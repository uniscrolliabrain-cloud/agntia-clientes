import { createHmac } from "node:crypto";
import { z } from "zod";
import { forbidden } from "../lib/errors.ts";
import { constantTimeEqualHex, hashCanonical } from "../lib/ids.ts";
import { IsoDateTime, Money, OpaqueRef, TenantId, strictObject } from "../contracts/common.ts";
import type { Clock } from "../lib/time.ts";
import { parseInstant, systemClock } from "../lib/time.ts";

/**
 * Delegación explícita (CLI-C04): tenant de origen ≠ tenant objetivo.
 * Un mandato no crea membresía y no se puede redelegar ampliado.
 */
export const DelegationMandate = strictObject({
  id: OpaqueRef,
  originatingActorRef: OpaqueRef,
  originatingTenantId: TenantId,
  targetTenantId: TenantId,
  serviceAgreementId: OpaqueRef,
  twinBindingId: OpaqueRef,
  capabilities: z.array(z.string().min(1).max(120)).min(1),
  resourceScope: z.array(z.string().min(1).max(300)),
  fieldScope: z.array(z.string().min(1).max(120)),
  purpose: z.string().min(1).max(200),
  costCeiling: Money,
  issuedAt: IsoDateTime,
  expiresAt: IsoDateTime,
  revocationVersion: z.number().int().nonnegative(),
  signatureOrVerificationRef: z.string().min(1).max(400),
});

export type DelegationMandateValue = z.infer<typeof DelegationMandate>;

export interface MandateVerifierOptions {
  /** Secreto de servidor solo para mandatos de desarrollo/fixtures. */
  hmacSecret: string;
  clock?: Clock;
}

export class MandateVerifier {
  readonly #secret: string;
  readonly #clock: Clock;

  constructor(options: MandateVerifierOptions) {
    this.#secret = options.hmacSecret;
    this.#clock = options.clock ?? systemClock;
  }

  sign(mandate: Omit<DelegationMandateValue, "signatureOrVerificationRef">): string {
    return createHmac("sha256", this.#secret).update(hashCanonical(mandate)).digest("hex");
  }

  verify(
    mandate: DelegationMandateValue,
    context: {
      actorId: string;
      originTenantId: string;
      targetTenantId: string;
      capability: string;
      resourceRef?: string;
      revokedAtVersion?: number;
    },
  ): void {
    if (mandate.originatingActorRef !== context.actorId) {
      throw forbidden("Mandato emitido para otro actor");
    }
    if (mandate.originatingTenantId !== context.originTenantId) {
      throw forbidden("Mandato de otro tenant de origen");
    }
    if (mandate.targetTenantId !== context.targetTenantId) {
      throw forbidden("Mandato no cubre el tenant objetivo");
    }
    if (!mandate.capabilities.includes(context.capability)) {
      throw forbidden("Capacidad fuera del mandato");
    }
    if (
      context.resourceRef &&
      mandate.resourceScope.length > 0 &&
      !mandate.resourceScope.includes(context.resourceRef)
    ) {
      throw forbidden("Recurso fuera del alcance del mandato");
    }
    if (parseInstant(mandate.expiresAt) <= this.#clock.now().getTime()) {
      throw forbidden("Mandato caducado");
    }
    if (
      context.revokedAtVersion !== undefined &&
      mandate.revocationVersion <= context.revokedAtVersion
    ) {
      throw forbidden("Mandato revocado");
    }
    // La firma cubre el mandato SIN el campo de firma (si no, cambiaría al firmarlo).
    const { signatureOrVerificationRef: _ignored, ...unsigned } = mandate;
    const expected = createHmac("sha256", this.#secret)
      .update(hashCanonical(unsigned))
      .digest("hex");
    if (!constantTimeEqualHex(expected, mandate.signatureOrVerificationRef)) {
      throw forbidden("Firma de mandato inválida");
    }
  }
}
