import { forbidden, notFound, unauthorized } from "../lib/errors.ts";
import type { SupabaseClaims } from "./jwt.ts";

/**
 * Principal y scope de recurso (CLI-C03).
 * El servidor resuelve Actor desde JWT verificado + membresía provisionada.
 * Nada de user_metadata, ni fallback owner/default, ni `authenticated` == owner.
 */

export type ActorKind = "human" | "agent" | "contact";

export interface Actor {
  kind: ActorKind;
  id: string;
  tenantId: string;
  userId: string | null;
  roleId: string;
  roles: readonly string[];
  capabilities: readonly string[];
  /** Solo para contactos de portal: recursos concretos compartidos. */
  resourceScopes: readonly string[];
  personaId?: string;
  runtimeId?: string;
  kernelTurnId?: string;
}

export interface Membership {
  userId: string;
  tenantId: string;
  roleId: string;
  suspended: boolean;
  /** Derecho del rol; una capacidad nombrada no demuestra posesión. */
  capabilities: readonly string[];
}

export interface ContactPortalGrant {
  principalId: string;
  tenantId: string;
  /** Recursos concretos: p. ej. `case_xxx`, `org_xxx`. Nunca "toda la empresa". */
  resourceScopes: readonly string[];
  revoked: boolean;
}

export interface PrincipalDirectory {
  membershipsFor(userId: string): Promise<readonly Membership[]>;
  contactGrantsFor(userId: string): Promise<readonly ContactPortalGrant[]>;
}

export const ROLE_CAPABILITIES: Record<string, readonly string[]> = {
  tenant_owner: [
    "clients.read",
    "cases.read",
    "cases.write",
    "cases.transition",
    "reply.propose",
    "reply.approve",
    "knowledge.read",
    "knowledge.write",
    "reports.read",
    "handoff.manage",
    "privacy.request",
    "integrations.read",
    "advisor.session",
  ],
  operator: [
    "clients.read",
    "cases.read",
    "cases.write",
    "cases.transition",
    "reply.propose",
    "knowledge.read",
    "reports.read",
    "handoff.manage",
    "advisor.session",
  ],
  reviewer: [
    "clients.read",
    "cases.read",
    "reply.propose",
    "reply.approve",
    "knowledge.read",
    "reports.read",
  ],
  contact_portal: ["cases.read_own", "reply.propose_own", "knowledge.read_public"],
};

export async function resolveActor(
  claims: SupabaseClaims,
  directory: PrincipalDirectory,
  options: { requestedTenantId?: string } = {},
): Promise<Actor> {
  const memberships = (await directory.membershipsFor(claims.sub)).filter((m) => !m.suspended);
  if (memberships.length === 0) {
    const grants = (await directory.contactGrantsFor(claims.sub)).filter((g) => !g.revoked);
    const active = grants[0];
    if (!active) throw forbidden("Sin membresía ni acceso de portal válido");
    return {
      kind: "contact",
      id: claims.sub,
      tenantId: active.tenantId,
      userId: claims.sub,
      roleId: "contact_portal",
      roles: ["contact_portal"],
      capabilities: ROLE_CAPABILITIES.contact_portal ?? [],
      resourceScopes: active.resourceScopes,
    };
  }

  // El claim de tenant debe contrastarse con membresía; nunca la sustituye.
  const claimMatches = claims.tenantIdClaim
    ? memberships.find((m) => m.tenantId === claims.tenantIdClaim)
    : undefined;
  const requested = options.requestedTenantId
    ? memberships.find((m) => m.tenantId === options.requestedTenantId)
    : undefined;

  if (options.requestedTenantId && !requested) {
    // 404 antes que 403: no se confirma la existencia de otro tenant.
    throw notFound();
  }
  if (claims.tenantIdClaim && !claimMatches) {
    throw forbidden("El tenant del token no corresponde a una membresía vigente");
  }

  const membership = requested ?? claimMatches ?? memberships[0];
  if (!membership) throw unauthorized("Membresía no resuelta");

  const declared = ROLE_CAPABILITIES[membership.roleId] ?? [];
  const capabilities = membership.capabilities.length
    ? membership.capabilities.filter((c) => declared.includes(c))
    : declared;

  return {
    kind: "human",
    id: claims.sub,
    tenantId: membership.tenantId,
    userId: claims.sub,
    roleId: membership.roleId,
    roles: [membership.roleId],
    capabilities,
    resourceScopes: [],
  };
}

export function requireCapability(actor: Actor, capability: string): void {
  if (!actor.capabilities.includes(capability)) {
    throw forbidden(`Capacidad requerida ausente: ${capability}`);
  }
}

/**
 * Aislamiento de tenant. Un recurso de otro tenant se comporta como inexistente.
 */
export function assertTenant(actor: Actor, resourceTenantId: string): void {
  if (actor.tenantId !== resourceTenantId) throw notFound();
}

/** ACL por recurso: un contacto de portal solo ve lo compartido con él. */
export function assertResourceAccess(actor: Actor, resourceRef: string): void {
  if (actor.kind !== "contact") return;
  if (!actor.resourceScopes.includes(resourceRef)) throw notFound();
}
