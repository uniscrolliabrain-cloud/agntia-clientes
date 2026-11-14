import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { WebhookInbox } from "../src/inbox/webhooks.ts";
import { ingestAttachment, neutralizeCsv, sniffMime } from "../src/inbox/attachments.ts";
import { assertEgressAllowed, DEFAULT_EGRESS, isPrivateAddress } from "../src/integrations/egress.ts";
import { ConnectionRegistry, InMemorySecretStore } from "../src/integrations/registry.ts";
import { DiscoveryService } from "../src/integrations/discovery.ts";
import { ChatwootAdapter } from "../src/adapters/chatwoot.ts";
import { FakeTransport } from "../src/integrations/transport.ts";
import { fixedClock } from "../src/lib/time.ts";
import { FIXTURE_NOW, TENANT_A } from "../src/eval/fixtures.ts";
import { ServiceError } from "../src/lib/errors.ts";

const clock = fixedClock(FIXTURE_NOW);
const ts = Math.floor(Date.parse(FIXTURE_NOW) / 1000);
const SECRET = "webhook-secret";

function envelope(overrides: Partial<Parameters<WebhookInbox["accept"]>[0]> = {}) {
  const rawBody = JSON.stringify({ id: "evt_1", text: "hola" });
  const signatureHex = createHmac("sha256", SECRET).update(`${ts}.${rawBody}`).digest("hex");
  return {
    tenantId: TENANT_A,
    connectionId: "conn_1",
    externalEventId: "evt_1",
    timestampSeconds: ts,
    signatureHex,
    contentType: "application/json",
    rawBody,
    ...overrides,
  };
}

test("C21: webhook válido entra una sola vez", () => {
  const inbox = new WebhookInbox({ secret: SECRET, clock });
  const event = inbox.accept(envelope());
  assert.equal(event.sourceHash.length, 64);
  assert.throws(() => inbox.accept(envelope()));
});

test("C21: firma inválida, skew y tamaño se rechazan", () => {
  const inbox = new WebhookInbox({ secret: SECRET, clock, maxBytes: 64 });
  assert.throws(() => inbox.accept(envelope({ signatureHex: "0".repeat(64) })));
  assert.throws(() => inbox.accept(envelope({ timestampSeconds: ts - 4000 })));
  assert.throws(() => inbox.accept(envelope({ rawBody: `{"x":"${"a".repeat(80)}"}` })));
  assert.throws(() => inbox.accept(envelope({ contentType: "text/html" })));
});

test("C21: adjunto con MIME declarado falso o ruta traversal se rechaza", () => {
  const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
  assert.equal(sniffMime(pdf), "application/pdf");
  const stored = ingestAttachment({
    ref: "att_1",
    declaredMime: "application/pdf",
    filename: "factura.pdf",
    content: pdf,
  });
  assert.equal(stored.quarantined, false);
  assert.throws(() =>
    ingestAttachment({
      ref: "att_2",
      declaredMime: "image/png",
      filename: "factura.pdf",
      content: pdf,
    }),
  );
  assert.throws(() =>
    ingestAttachment({
      ref: "att_3",
      declaredMime: "application/pdf",
      filename: "../etc/passwd",
      content: pdf,
    }),
  );
  assert.throws(() =>
    ingestAttachment({
      ref: "att_4",
      declaredMime: "application/pdf",
      filename: "x.pdf",
      content: new Uint8Array([0x4d, 0x5a, 0x90, 0x00]),
    }),
  );
});

test("C21: CSV neutraliza fórmulas y HTML no se sirve como texto", () => {
  assert.equal(neutralizeCsv("=1+1,b", true), "'=1+1,b");
  const csv = ingestAttachment({
    ref: "att_csv",
    declaredMime: "text/csv",
    filename: "datos.csv",
    content: Buffer.from("=cmd|' /C calc',ok", "utf8"),
  });
  assert.equal(csv.sanitizedText, "'=cmd|' /C calc',ok");
  assert.ok(csv.reasonCodes.includes("formula_neutralized"));
  const html = ingestAttachment({
    ref: "att_html",
    declaredMime: "text/plain",
    filename: "nota.txt",
    content: Buffer.from("<script>alert(1)</script>", "utf8"),
  });
  assert.equal(html.sanitizedText, null);
  assert.equal(html.quarantined, true);
});

test("C09: egress bloquea metadata, host no permitido y DNS privado", async () => {
  assert.equal(isPrivateAddress("169.254.169.254"), true);
  assert.equal(isPrivateAddress("93.184.216.34"), false);
  await assert.rejects(() =>
    assertEgressAllowed("https://169.254.169.254/latest/meta-data", DEFAULT_EGRESS, {
      resolveDns: async () => ["93.184.216.34"],
    }),
  );
  await assert.rejects(() =>
    assertEgressAllowed("https://evil.example.com/x", DEFAULT_EGRESS, {
      resolveDns: async () => ["93.184.216.34"],
    }),
  );
  await assert.rejects(() =>
    assertEgressAllowed("https://chatwoot.example.com/x", DEFAULT_EGRESS, {
      resolveDns: async () => ["10.0.0.5"],
    }),
  );
  const ok = await assertEgressAllowed("https://chatwoot.example.com/api", DEFAULT_EGRESS, {
    resolveDns: async () => ["93.184.216.34"],
  });
  assert.equal(ok.hostname, "chatwoot.example.com");
});

test("C09: OAuth state ligado a tenant y PKCE verificado", () => {
  const registry = new ConnectionRegistry(new InMemorySecretStore(), { clock });
  const { state, codeChallenge } = registry.beginOAuth({
    tenantId: TENANT_A,
    provider: "chatwoot",
    codeVerifier: "verifier-1234567890",
  });
  assert.ok(codeChallenge.length > 10);
  assert.throws(() =>
    registry.completeOAuth({
      state,
      tenantId: "tenant_beta",
      provider: "chatwoot",
      codeVerifier: "verifier-1234567890",
    }),
  );
});

test("C09: conexión sin secreto devuelve not_configured y revocar detiene efectos", async () => {
  const secrets = new InMemorySecretStore();
  const registry = new ConnectionRegistry(secrets, { clock });
  const connection = registry.register({
    tenantId: TENANT_A,
    provider: "chatwoot",
    baseUrl: "https://chatwoot.example.com",
    endpointRef: "endpoint_chatwoot",
    secretRef: "secret_chatwoot",
    remoteTenantRef: "account_fixture",
    requestedCapabilities: ["conversation.read"],
  });
  await assert.rejects(
    () => registry.credential(TENANT_A, connection.id),
    (error: unknown) => error instanceof ServiceError && error.code === "not_configured",
  );
  await secrets.put("secret_chatwoot", "token-de-prueba-1234");
  assert.equal(await registry.credential(TENANT_A, connection.id), "token-de-prueba-1234");
  registry.revoke(TENANT_A, connection.id);
  await assert.rejects(() => registry.credential(TENANT_A, connection.id));
});

test("C10: sin discovery no hay escritura; con permiso faltante queda forbidden", async () => {
  const discovery = new DiscoveryService({ clock });
  const base = {
    tenantId: TENANT_A,
    connectionId: "conn_1",
    provider: "chatwoot",
    requiredScopes: ["conversation.read", "message.create"],
  };
  assert.throws(() => discovery.requireCapability(TENANT_A, "conn_1", "message.create"));
  const report = await discovery.probe({
    ...base,
    readOnlyProbe: async () => ({
      ok: true,
      version: "4.2.0",
      schema: { conversation: ["id"] },
      observedScopes: ["conversation.read"],
      contentType: "application/json",
    }),
  });
  assert.equal(report.entries[0]?.state, "forbidden");
  assert.throws(() =>
    discovery.requireCapability(TENANT_A, "conn_1", "conversation.read"),
  );
  await assert.rejects(async () =>
    discovery.probe({
      ...base,
      readOnlyProbe: async () => ({
        ok: false,
        version: "",
        schema: {},
        observedScopes: [],
        contentType: "text/html",
      }),
    }).then((r) => {
      if (r.entries[0]?.state === "unknown") throw new ServiceError("capability_unsupported", "unknown");
      return r;
    }),
  );
});

test("C13: Chatwoot mapea visibilidad y no mezcla inbox de otro tenant", async () => {
  const transport = new FakeTransport();
  transport.on("GET", "/api/v1/accounts/1/conversations/9/messages", () => ({
    status: 200,
    headers: {},
    body: JSON.stringify({
      payload: [
        {
          id: 101,
          conversation_id: 9,
          content: "mensaje público",
          message_type: "incoming",
          private: false,
          created_at: 1_760_000_000,
          sender: { id: 5 },
          attachments: [],
        },
        {
          id: 102,
          conversation_id: 9,
          content: "nota interna",
          message_type: "outgoing",
          private: true,
          created_at: 1_760_000_100,
          sender: { id: 7 },
          attachments: [{ id: 3, content_type: "application/pdf" }],
        },
      ],
    }),
  }));
  const adapter = new ChatwootAdapter({
    transport,
    baseUrl: "https://chatwoot.example.com",
    token: async () => "token-fixture",
    binding: {
      tenantId: TENANT_A,
      connectionId: "conn_1",
      accountId: "1",
      inboxIds: ["2"],
      apiTokenRef: "secret_chatwoot",
    },
  });
  const messages = await adapter.listMessages("9", "2");
  assert.equal(messages.length, 2);
  const mapped = messages.map((message) => adapter.toServiceMessage(message, TENANT_A));
  assert.equal(mapped[1]?.visibility, "internal");
  assert.equal(mapped[0]?.direction, "inbound");
  await assert.rejects(() => adapter.listMessages("9", "999"));
});

test("C14: writeback exige aprobación y no inventa id remoto", async () => {
  const transport = new FakeTransport();
  transport.on("POST", "/api/v1/accounts/1/conversations/9/messages", () => ({
    status: 200,
    headers: {},
    body: JSON.stringify({ id: 555 }),
  }));
  const adapter = new ChatwootAdapter({
    transport,
    baseUrl: "https://chatwoot.example.com",
    token: async () => "token-fixture",
    binding: { tenantId: TENANT_A, connectionId: "conn_1", accountId: "1", inboxIds: ["2"], apiTokenRef: "s" },
  });
  await assert.rejects(() =>
    adapter.createMessage({ conversationId: "9", inboxId: "2", content: "hola", isPrivate: false, approvalRef: "" }),
  );
  const created = await adapter.createMessage({
    conversationId: "9",
    inboxId: "2",
    content: "hola",
    isPrivate: false,
    approvalRef: "apr_1",
  });
  assert.equal(created.remoteId, "555");
  assert.equal(transport.calls.length, 1);
});
