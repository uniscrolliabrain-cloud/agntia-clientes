import { test } from "node:test";
import assert from "node:assert/strict";
import { testContext } from "../src/app/context.ts";
import { FIXTURE_NOW, TENANT_A, TENANT_B } from "../src/eval/fixtures.ts";
import { TenantTable } from "../src/storage/repository.ts";

test("C06: lookup scoped no devuelve filas de otro tenant", () => {
  const ctx = testContext();
  assert.equal(ctx.store.cases.get(TENANT_A, "case_beta_1"), null);
  assert.equal(ctx.store.cases.get(TENANT_B, "case_case_ana_1"), null);
  assert.notEqual(ctx.store.cases.get(TENANT_A, "case_case_ana_1"), null);
});

test("C06: unicidad de external link por conexión, no global", () => {
  const table = new TenantTable<{ id: string; tenantId: string; connectionId: string; model: string; externalId: string; localKind: string }>([
    { name: "external_link", fields: ["connectionId", "model", "externalId", "localKind"] },
  ]);
  const base = { tenantId: TENANT_A, connectionId: "conn_1", model: "person", externalId: "42", localKind: "contact" };
  table.insert({ ...base, id: "link_1" });
  assert.throws(() => table.insert({ ...base, id: "link_2" }));
  table.insert({ ...base, id: "link_3", connectionId: "conn_2" });
  table.insert({ ...base, id: "link_4", tenantId: TENANT_B });
  assert.equal(table.list(TENANT_A).length, 2);
});

test("C06: update con CAS rechaza versión obsoleta", () => {
  const table = new TenantTable<{ id: string; tenantId: string; version: number; value: string }>();
  table.insert({ id: "row_1", tenantId: TENANT_A, version: 0, value: "a" });
  table.update(TENANT_A, "row_1", { id: "row_1", tenantId: TENANT_A, version: 0, value: "b" }, 0);
  assert.throws(() => table.update(TENANT_A, "row_1", { id: "row_1", tenantId: TENANT_A, version: 0, value: "c" }, 0));
});

test("C24: RAG filtra ACL antes y después y no cruza tenants", () => {
  const ctx = testContext();
  const allowed = ctx.knowledge.search({
    tenantId: TENANT_A,
    text: "cómo doy de alta un usuario en el panel",
    locale: "es",
    acl: ["support"],
    purpose: "case_reply",
    now: FIXTURE_NOW,
  });
  assert.equal(allowed.abstained, false);
  assert.ok(allowed.citations.every((c) => c.version === 2));

  const forbiddenAcl = ctx.knowledge.search({
    tenantId: TENANT_A,
    text: "cómo doy de alta un usuario en el panel",
    locale: "es",
    acl: ["marketing"],
    purpose: "case_reply",
    now: FIXTURE_NOW,
  });
  assert.equal(forbiddenAcl.abstained, true);
  assert.deepEqual(forbiddenAcl.reasonCodes, ["no_authorized_evidence"]);

  const crossTenant = ctx.knowledge.search({
    tenantId: TENANT_A,
    text: "Initech doble aprobación",
    locale: "es",
    acl: ["support"],
    purpose: "case_reply",
    now: FIXTURE_NOW,
  });
  assert.equal(crossTenant.chunks.some((c) => c.tenantId === TENANT_B), false);
});

test("C24: artículo retirado y versión antigua no responden", () => {
  const ctx = testContext();
  const result = ctx.knowledge.search({
    tenantId: TENANT_A,
    text: "el alta se solicita por correo al equipo técnico",
    locale: "es",
    acl: ["support"],
    purpose: "case_reply",
    now: FIXTURE_NOW,
  });
  assert.equal(result.chunks.some((c) => c.version === 1), false);
});

test("C24: publicar exige revisor y fuente; retirar borra del índice", () => {
  const ctx = testContext();
  assert.throws(() =>
    ctx.knowledge.publish("kb_alta_usuarios", 2, ""),
  );
  ctx.knowledge.retire("kb_alta_usuarios");
  const after = ctx.knowledge.search({
    tenantId: TENANT_A,
    text: "Panel de administración alta de usuario",
    locale: "es",
    acl: ["support"],
    purpose: "case_reply",
    now: FIXTURE_NOW,
  });
  assert.equal(after.abstained, true);
});

test("C24: purge elimina chunks del tenant indicado", () => {
  const ctx = testContext();
  const removed = ctx.knowledge.purge(TENANT_A, "kb_alta_usuarios");
  assert.ok(removed > 0);
  const beta = ctx.knowledge.search({
    tenantId: TENANT_B,
    text: "Initech doble aprobación",
    locale: "es",
    acl: ["support"],
    purpose: "case_reply",
    now: FIXTURE_NOW,
  });
  assert.equal(beta.abstained, false);
});
