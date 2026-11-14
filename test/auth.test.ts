import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { JwtVerifier } from "../src/auth/jwt.ts";
import { resolveActor, requireCapability, assertResourceAccess } from "../src/auth/principal.ts";
import { MandateVerifier } from "../src/auth/delegation.ts";
import { mintDevToken } from "../src/auth/dev-token.ts";
import { fixedClock } from "../src/lib/time.ts";
import { ServiceError } from "../src/lib/errors.ts";
import { FIXTURE_NOW, OPERATOR_P, TENANT_A, TENANT_B, USERS } from "../src/eval/fixtures.ts";

const SECRET = "test-secret-not-a-real-credential";
const ISSUER = "https://project.supabase.co/auth/v1";
const clock = fixedClock(FIXTURE_NOW);

const verifier = new JwtVerifier(
  {
    issuer: ISSUER,
    audience: "authenticated",
    hmacSecret: SECRET,
    allowedAlgorithms: ["HS256"],
    clockToleranceSeconds: 30,
    jwksCacheSeconds: 60,
  },
  { clock },
);

function token(overrides: Partial<Parameters<typeof mintDevToken>[0]> = {}): string {
  return mintDevToken({
    sub: USERS.ownerA,
    issuer: ISSUER,
    audience: "authenticated",
    secret: SECRET,
    issuedAtSeconds: Math.floor(Date.parse(FIXTURE_NOW) / 1000),
    expiresInSeconds: 900,
    ...overrides,
  });
}

async function expectUnauthorized(value: string, message?: string) {
  await assert.rejects(
    () => verifier.verify(value),
    (error: unknown) => error instanceof ServiceError && error.status === 401,
    message,
  );
}

test("C03: token válido resuelve claims y tenant", async () => {
  const claims = await verifier.verify(token({ tenantId: TENANT_A }));
  assert.equal(claims.sub, USERS.ownerA);
  assert.equal(claims.tenantIdClaim, TENANT_A);
  assert.equal(claims.iss, ISSUER);
});

test("C03: firma inválida, exp, iss y aud fallan cerrado", async () => {
  await expectUnauthorized(`${token().split(".").slice(0, 2).join(".")}.${"a".repeat(43)}`);
  await expectUnauthorized(
    token({ issuedAtSeconds: Math.floor(Date.parse(FIXTURE_NOW) / 1000) - 3600, expiresInSeconds: 60 }),
  );
  await expectUnauthorized(token({ issuer: "https://otro.supabase.co/auth/v1" }));
  await expectUnauthorized(token({ audience: "anon" }));
});

test("C03: alg none y alg no permitido se rechazan", async () => {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: "x", iss: ISSUER, aud: "authenticated", exp: 9_999_999_999, iat: 1 })).toString("base64url");
  await expectUnauthorized(`${header}.${payload}.`);
});

test("C03: user_metadata no concede autorización", async () => {
  const claims = await verifier.verify(
    mintDevToken({
      sub: "user_desconocido",
      issuer: ISSUER,
      audience: "authenticated",
      secret: SECRET,
      appMetadata: { role: "tenant_owner", tenant_id: TENANT_A },
      issuedAtSeconds: Math.floor(Date.parse(FIXTURE_NOW) / 1000),
    }),
  );
  const directory = {
    membershipsFor: async () => [],
    contactGrantsFor: async () => [],
  };
  await assert.rejects(
    () => resolveActor(claims, directory),
    (error: unknown) => error instanceof ServiceError && error.status === 403,
  );
});

test("C03: tenant del token distinto de la membresía no autoriza", async () => {
  const claims = await verifier.verify(token({ tenantId: TENANT_B }));
  const directory = {
    membershipsFor: async () => [
      {
        userId: USERS.ownerA,
        tenantId: TENANT_A,
        roleId: "tenant_owner",
        suspended: false,
        capabilities: ["cases.read"],
      },
    ],
    contactGrantsFor: async () => [],
  };
  await assert.rejects(
    () => resolveActor(claims, directory),
    (error: unknown) => error instanceof ServiceError && error.status === 403,
  );
});

test("C03: membresía suspendida no resuelve actor humano", async () => {
  const claims = await verifier.verify(token({ tenantId: TENANT_A }));
  const directory = {
    membershipsFor: async () => [
      { userId: USERS.ownerA, tenantId: TENANT_A, roleId: "operator", suspended: true, capabilities: [] },
    ],
    contactGrantsFor: async () => [],
  };
  await assert.rejects(() => resolveActor(claims, directory));
});

test("C03: portal externo solo ve recursos compartidos", async () => {
  const claims = await verifier.verify(token({ sub: USERS.contactA1 }));
  const actor = await resolveActor(claims, {
    membershipsFor: async () => [],
    contactGrantsFor: async () => [
      { principalId: USERS.contactA1, tenantId: TENANT_A, resourceScopes: ["case_case_ana_1"], revoked: false },
    ],
  });
  assert.equal(actor.kind, "contact");
  assertResourceAccess(actor, "case_case_ana_1");
  assert.throws(() => assertResourceAccess(actor, "case_case_ana_private"));
});

test("C03: capabilities se derivan del rol y no del nombre", async () => {
  const claims = await verifier.verify(token({ sub: USERS.reviewerA, tenantId: TENANT_A }));
  const actor = await resolveActor(claims, {
    membershipsFor: async () => [
      { userId: USERS.reviewerA, tenantId: TENANT_A, roleId: "reviewer", suspended: false, capabilities: [] },
    ],
    contactGrantsFor: async () => [],
  });
  requireCapability(actor, "reply.approve");
  assert.throws(() => requireCapability(actor, "knowledge.write"));
});

test("C04: mandato válido, caducado y cross-tenant", () => {
  const mandates = new MandateVerifier({ hmacSecret: SECRET, clock });
  const base = {
    id: "mandate_test",
    originatingActorRef: "agent_fixture",
    originatingTenantId: OPERATOR_P,
    targetTenantId: TENANT_A,
    serviceAgreementId: "agreement_alpha",
    twinBindingId: "twin_alpha_support",
    capabilities: ["reply.propose"],
    resourceScope: ["case_case_ana_1"],
    fieldScope: ["case.state"],
    purpose: "test",
    costCeiling: { amount: "1.00", currency: "EUR", exponent: 2 },
    issuedAt: FIXTURE_NOW,
    expiresAt: "2027-01-01T00:00:00.000Z",
    revocationVersion: 3,
  };
  const mandate = { ...base, signatureOrVerificationRef: mandates.sign(base) };
  mandates.verify(mandate, {
    actorId: "agent_fixture",
    originTenantId: OPERATOR_P,
    targetTenantId: TENANT_A,
    capability: "reply.propose",
    resourceRef: "case_case_ana_1",
  });
  assert.throws(() =>
    mandates.verify(mandate, {
      actorId: "agent_fixture",
      originTenantId: OPERATOR_P,
      targetTenantId: TENANT_B,
      capability: "reply.propose",
    }),
  );
  assert.throws(() =>
    mandates.verify(mandate, {
      actorId: "agent_fixture",
      originTenantId: OPERATOR_P,
      targetTenantId: TENANT_A,
      capability: "reply.approve",
    }),
  );
  assert.throws(() =>
    mandates.verify(mandate, {
      actorId: "agent_fixture",
      originTenantId: OPERATOR_P,
      targetTenantId: TENANT_A,
      capability: "reply.propose",
      revokedAtVersion: 3,
    }),
  );
  const tampered = { ...mandate, targetTenantId: TENANT_B };
  assert.throws(() =>
    mandates.verify(tampered, {
      actorId: "agent_fixture",
      originTenantId: OPERATOR_P,
      targetTenantId: TENANT_B,
      capability: "reply.propose",
    }),
  );
});
