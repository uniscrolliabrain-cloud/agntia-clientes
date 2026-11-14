import { test } from "node:test";
import assert from "node:assert/strict";
import { transition } from "../src/domain/cases.ts";
import { testContext } from "../src/app/context.ts";
import { USERS, TENANT_A } from "../src/eval/fixtures.ts";
import { ServiceError } from "../src/lib/errors.ts";

function freshCase() {
  const ctx = testContext();
  return ctx.store.cases.require(TENANT_A, "case_case_ana_1");
}

test("C22: transición válida incrementa versión y registra actores", () => {
  const caseDto = freshCase();
  const result = transition(caseDto, "assign", {
    expectedVersion: caseDto.version,
    actorId: USERS.ownerA,
    actorKind: "human",
    assignedTo: USERS.reviewerA,
  });
  assert.equal(result.to, "assigned");
  assert.equal(result.case.version, caseDto.version + 1);
  assert.equal(result.case.assignedTo, USERS.reviewerA);
  assert.equal(result.case.assignedBy, USERS.ownerA);
});

test("C22: versión obsoleta produce conflicto", () => {
  const caseDto = freshCase();
  assert.throws(
    () =>
      transition(caseDto, "assign", {
        expectedVersion: caseDto.version + 5,
        actorId: USERS.ownerA,
        actorKind: "human",
        assignedTo: USERS.reviewerA,
      }),
    (error: unknown) => error instanceof ServiceError && error.status === 409,
  );
});

test("C22: resolución sin evidencia se bloquea", () => {
  const caseDto = freshCase();
  assert.throws(() =>
    transition(caseDto, "resolve", {
      expectedVersion: caseDto.version,
      actorId: USERS.ownerA,
      actorKind: "human",
      evidence: [],
    }),
  );
});

test("C22: resolución informativa con cita es aceptable", () => {
  const caseDto = freshCase();
  const result = transition(caseDto, "resolve", {
    expectedVersion: caseDto.version,
    actorId: USERS.ownerA,
    actorKind: "human",
    evidence: [{ kind: "citation", ref: "kb_alta_usuarios#v2#c0", satisfied: true }],
  });
  assert.equal(result.case.state, "resolved");
});

test("C22: resolución de cambio exige receipt o estado remoto", () => {
  const ctx = testContext();
  const initial = ctx.store.cases.require(TENANT_A, "case_case_ana_private");
  const triaged = transition(initial, "triage", {
    expectedVersion: initial.version,
    actorId: USERS.ownerA,
    actorKind: "human",
  }).case;
  const assigned = transition(triaged, "assign", {
    expectedVersion: triaged.version,
    actorId: USERS.ownerA,
    actorKind: "human",
    assignedTo: USERS.reviewerA,
  }).case;
  const working = transition(assigned, "start_work", {
    expectedVersion: assigned.version,
    actorId: USERS.reviewerA,
    actorKind: "human",
  }).case;
  assert.throws(() =>
    transition(working, "resolve", {
      expectedVersion: working.version,
      actorId: USERS.ownerA,
      actorKind: "human",
      evidence: [{ kind: "citation", ref: "kb_facturacion_acme#v1#c0", satisfied: true }],
    }),
  );
  const approved = transition(working, "resolve", {
    expectedVersion: working.version,
    actorId: USERS.ownerA,
    actorKind: "human",
    evidence: [{ kind: "receipt", ref: "remote_1", satisfied: true }],
  });
  assert.equal(approved.case.state, "resolved");
});

test("C22: cierre por silencio sin acuerdo se bloquea", () => {
  const caseDto = freshCase();
  assert.throws(() =>
    transition(caseDto, "close", {
      expectedVersion: caseDto.version,
      actorId: USERS.ownerA,
      actorKind: "human",
    }),
  );
});

test("C22: el contacto no resuelve ni cierra, pero puede reabrir su caso", () => {
  const ctx = testContext();
  const caseDto = ctx.store.cases.require(TENANT_A, "case_case_ana_1");
  assert.throws(() =>
    transition(caseDto, "resolve", {
      expectedVersion: caseDto.version,
      actorId: "contact_ana_acme",
      actorKind: "contact",
      evidence: [{ kind: "citation", ref: "x", satisfied: true }],
    }),
  );
  const resolved = { ...caseDto, state: "resolved" as const, version: 4 };
  const reopened = transition(resolved, "reopen", {
    expectedVersion: 4,
    actorId: "contact_ana_acme",
    actorKind: "contact",
  });
  assert.equal(reopened.case.state, "reopened");
});

test("C22: transición no permitida por estado se rechaza", () => {
  const caseDto = freshCase();
  assert.throws(() =>
    transition(caseDto, "close", {
      expectedVersion: caseDto.version,
      actorId: USERS.ownerA,
      actorKind: "human",
    }),
  );
});
