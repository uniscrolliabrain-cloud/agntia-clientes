import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app/http.ts";
import { FIXTURE_SECRET, testContext } from "../src/app/context.ts";
import { mintDevToken } from "../src/auth/dev-token.ts";
import { FIXTURE_NOW, TENANT_A, TENANT_B, USERS } from "../src/eval/fixtures.ts";

const ISSUER = "https://fixture.supabase.co/auth/v1";

function app() {
  return createApp(testContext());
}

function token(sub: string, tenantId?: string): string {
  return mintDevToken({
    sub,
    ...(tenantId ? { tenantId } : {}),
    issuer: ISSUER,
    audience: "authenticated",
    secret: FIXTURE_SECRET,
    issuedAtSeconds: Math.floor(Date.parse(FIXTURE_NOW) / 1000),
    expiresInSeconds: 3600,
  });
}

async function call(
  path: string,
  init: { method?: string; token?: string; tenant?: string; body?: unknown } = {},
) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (init.token) headers.authorization = `Bearer ${init.token}`;
  if (init.tenant) headers["x-tenant-id"] = init.tenant;
  const response = await app().fetch(
    new Request(`http://localhost${path}`, {
      method: init.method ?? "GET",
      headers,
      ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    }),
  );
  const text = await response.text();
  return { status: response.status, body: text.length ? JSON.parse(text) : {} };
}

test("C34: sin token la API responde 401 y no cae a owner/default", async () => {
  const response = await call("/v1/clientes/me");
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "unauthorized");
});

test("C34: token válido devuelve principal y entitlements", async () => {
  const response = await call("/v1/clientes/me", { token: token(USERS.ownerA, TENANT_A) });
  assert.equal(response.status, 200);
  assert.equal(response.body.principal.tenantId, TENANT_A);
  assert.ok(response.body.principal.capabilities.includes("reply.approve"));
});

test("C03: token con tenant ajeno a la membresía no autoriza", async () => {
  const response = await call("/v1/clientes/me", { token: token(USERS.ownerA, TENANT_B) });
  assert.equal(response.status, 403);
});

test("C34: x-tenant-id sin membresía devuelve 404 sin filtrar", async () => {
  const response = await call("/v1/clientes/me", {
    token: token(USERS.ownerA, TENANT_A),
    tenant: "tenant_desconocido",
  });
  assert.equal(response.status, 404);
});

test("C22: listar casos y leer uno propio", async () => {
  const list = await call("/v1/clientes/cases", { token: token(USERS.ownerA, TENANT_A) });
  assert.equal(list.status, 200);
  assert.ok(list.body.items.length >= 2);
  const detail = await call("/v1/clientes/cases/case_case_ana_1", { token: token(USERS.ownerA, TENANT_A) });
  assert.equal(detail.status, 200);
  assert.equal(detail.body.case.id, "case_case_ana_1");
  assert.ok(detail.body.sla.timeZone);
});

test("C03: un caso de otro tenant responde 404", async () => {
  const response = await call("/v1/clientes/cases/case_beta_1", { token: token(USERS.ownerA, TENANT_A) });
  assert.equal(response.status, 404);
});

test("C25/C26: propuesta, preview y aprobación con intent", async () => {
  const ctxApp = createApp(testContext());
  const auth = { authorization: `Bearer ${token(USERS.reviewerA, TENANT_A)}`, "content-type": "application/json" };
  const proposalResponse = await ctxApp.fetch(
    new Request("http://localhost/v1/clientes/cases/case_case_ana_1/answer-proposals", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ locale: "es", question: "¿Cómo doy de alta un usuario?", acl: ["support"] }),
    }),
  );
  assert.equal(proposalResponse.status, 201);
  const proposalBody = (await proposalResponse.json()) as { proposal: { id: string; body: string }; effect: string };
  assert.equal(proposalBody.effect, "none");

  const previewResponse = await ctxApp.fetch(
    new Request("http://localhost/v1/clientes/outbound-previews", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        caseId: "case_case_ana_1",
        proposalId: proposalBody.proposal.id,
        recipientRef: "addr_ana_a",
        channel: "email",
        attachmentHashes: [],
      }),
    }),
  );
  assert.equal(previewResponse.status, 200);
  const previewBody = (await previewResponse.json()) as { effect: string; requiresApproval: boolean };
  assert.equal(previewBody.effect, "none");
  assert.equal(previewBody.requiresApproval, true);

  const intentResponse = await ctxApp.fetch(
    new Request("http://localhost/v1/clientes/outbound-intents", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        caseId: "case_case_ana_1",
        proposalId: proposalBody.proposal.id,
        recipientRef: "addr_ana_a",
        channel: "email",
        attachmentHashes: [],
        expectedVersion: 1,
        policyVersion: "policy_reply_v1",
      }),
    }),
  );
  assert.equal(intentResponse.status, 201);
  const intentBody = (await intentResponse.json()) as { intent: { state: string; id: string } };
  assert.equal(intentBody.intent.state, "awaiting_approval");
});

test("C24: knowledge search se abstiene sin evidencia autorizada", async () => {
  const found = await call("/v1/clientes/knowledge/search?q=alta%20de%20usuarios%20panel&locale=es", {
    token: token(USERS.ownerA, TENANT_A),
  });
  assert.equal(found.status, 200);
  assert.equal(found.body.abstained, false);

  const missing = await call("/v1/clientes/knowledge/search?q=zzzqqq%20inexistente&locale=fr", {
    token: token(USERS.ownerA, TENANT_A),
  });
  assert.equal(missing.body.abstained, true);
});

test("C36: reporte sin encuestas no inventa CSAT", async () => {
  const response = await call("/v1/clientes/reports", { token: token(USERS.ownerA, TENANT_A) });
  assert.equal(response.status, 200);
  assert.equal(response.body.snapshot.surveys.csat, null);
  assert.equal(response.body.p50FirstResponse, null);
});

test("C32: sin Anam configurado hay fallback de texto, no error opaco", async () => {
  const response = await call("/v1/clientes/advisor-sessions", {
    token: token(USERS.ownerA, TENANT_A),
    method: "POST",
    body: {
      twinBindingId: "twin_alpha_support",
      caseRef: "case_case_ana_1",
      durationMinutes: 10,
      recordingRequested: false,
      consentRecording: false,
    },
  });
  assert.equal(response.status, 503);
  assert.equal(response.body.fallback, "text_only");
});

test("C18: portal HTML accesible sin exponer datos", async () => {
  const response = await app().fetch(new Request("http://localhost/portal"));
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes("<html lang=\"es\""));
  assert.ok(html.includes("viewport"));
  assert.equal(html.includes("sk_live"), false);
});

test("C21: webhook sin firma válida no entra", async () => {
  const response = await app().fetch(
    new Request("http://localhost/webhooks/conn_1", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": TENANT_A,
        "x-event-id": "evt_1",
        "x-timestamp": "0",
        "x-signature": "0".repeat(64),
      },
      body: JSON.stringify({ hello: "world" }),
    }),
  );
  assert.equal(response.status, 403);
});

test("C09: /dev/token no existe en producción", async () => {
  const productionCtx = testContext();
  productionCtx.config = { ...productionCtx.config, env: "production" };
  const produced = createApp(productionCtx);
  const response = await produced.fetch(
    new Request("http://localhost/dev/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sub: USERS.ownerA }),
    }),
  );
  assert.equal(response.status, 403);
});
