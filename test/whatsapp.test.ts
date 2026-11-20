import assert from "node:assert/strict";
import test from "node:test";
import {
  WHATSAPP_DOCUMENTED,
  WHATSAPP_UNVERIFIED,
  WhatsAppChannel,
  type WhatsAppCapabilities,
} from "../src/channels/whatsapp.ts";

const TENANT = "tn_test_wa";
const CONNECTION = "conn_wa";

const verified: WhatsAppCapabilities = {
  verified: true,
  graphVersion: "v23.0",
  sessionWindowMinutes: WHATSAPP_DOCUMENTED.sessionWindowMinutes,
  templates: [
    { name: "pedido_listo", category: "utility", locale: "es" },
    { name: "promo_verano", category: "marketing", locale: "es" },
  ],
};

const channel = (capabilities: WhatsAppCapabilities) =>
  new WhatsAppChannel({ capabilities, tenantId: TENANT, connectionId: CONNECTION });

const base = {
  templateName: null as string | null,
  category: "free_form" as const,
  purpose: "support_reply" as const,
  approvedAt: "2026-11-20T12:00:00.000Z",
  lastInboundAt: "2026-11-20T11:00:00.000Z" as string | null,
};

test("C20: sin cuenta configurada el canal está cerrado y no finge documentación pendiente", () => {
  const state = channel(WHATSAPP_UNVERIFIED).state();
  assert.equal(state.enabled, false);
  assert.equal(state.reason, "account_not_configured");
});

test("C20: con capacidad verificada, el mensaje libre dentro de las 24 h se permite", () => {
  assert.doesNotThrow(() => channel(verified).assertCanSend({ ...base }));
});

test("C20: justo pasado el límite de 24 h exige plantilla aprobada", () => {
  const expired = {
    ...base,
    approvedAt: "2026-11-21T11:00:01.000Z", // 24 h + 1 s desde el último entrante
  };
  assert.throws(() => channel(verified).assertCanSend(expired), /Ventana de sesión expirada/);
});

test("C20: sin último entrante no hay ventana que abrir", () => {
  assert.throws(
    () => channel(verified).assertCanSend({ ...base, lastInboundAt: null }),
    /fuera de ventana/,
  );
});

test("C20: plantilla de marketing no se usa para una respuesta de soporte", () => {
  assert.throws(
    () =>
      channel(verified).assertCanSend({
        ...base,
        category: "marketing",
        templateName: "promo_verano",
      }),
    /finalidad de soporte/,
  );
});

test("C20: una plantilla no verificada para el número se rechaza", () => {
  assert.throws(
    () =>
      channel(verified).assertCanSend({
        ...base,
        category: "utility",
        templateName: "pedido_listo_v2",
      }),
    /Plantilla no verificada/,
  );
});

test("C20: timeout deja el resultado incierto y no se reintenta a ciegas", async () => {
  const outcome = await channel(verified).sendWithUncertainty({
    dispatch: async () => {
      const error = new Error("timeout");
      error.name = "TimeoutError";
      throw error;
    },
  });
  assert.equal(outcome.state, "outcome_unknown");
  assert.equal(outcome.retryable, false);
  assert.equal(outcome.reconciliationRequired, true);
});
