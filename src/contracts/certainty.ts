/**
 * Vocabulario de certeza del factory (docs/factory/00-README.md):
 * DOC_ONLY, PROPOSED, CODE_VERIFIED, TEST_VERIFIED, STALE, UNKNOWN.
 *
 * Un mock no sube de nivel. PASS local de este repo significa TEST_VERIFIED
 * para el código del esqueleto, nunca un gate de proveedor real.
 */
export const CERTAINTY_LEVELS = [
  "DOC_ONLY",
  "PROPOSED",
  "CODE_VERIFIED",
  "TEST_VERIFIED",
  "STALE",
  "UNKNOWN",
] as const;

export type Certainty = (typeof CERTAINTY_LEVELS)[number];

export type GateStatus = "PASS" | "NOT_VERIFIED" | "BLOCKED";

const FROM_GATE: Record<GateStatus, Certainty> = {
  PASS: "TEST_VERIFIED",
  NOT_VERIFIED: "CODE_VERIFIED",
  BLOCKED: "PROPOSED",
};

export function fromGateStatus(status: GateStatus): Certainty {
  return FROM_GATE[status];
}

const LABEL: Record<Certainty, string> = {
  DOC_ONLY: "solo documentado, sin código",
  PROPOSED: "propuesto, bloqueado o fuera de alcance",
  CODE_VERIFIED: "el código existe y pasa typecheck; sin prueba de comportamiento",
  TEST_VERIFIED: "comportamiento cubierto por tests locales en este repo",
  STALE: "verificado en una revisión anterior, no revalidado",
  UNKNOWN: "sin evidencia registrada",
};

export function describeCertainty(level: Certainty): string {
  return LABEL[level];
}

/** Solo TEST_VERIFIED autoriza hablar de comportamiento probado. */
export function isVerified(level: Certainty): boolean {
  return level === "TEST_VERIFIED";
}

/** Un gate de proveedor exige evidencia externa, no código local. */
export function requiresExternalEvidence(level: Certainty): boolean {
  return level === "CODE_VERIFIED" || level === "PROPOSED" || level === "DOC_ONLY";
}
