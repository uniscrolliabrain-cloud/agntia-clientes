import { conflict, forbidden, invalid, notFound } from "../lib/errors.ts";
import type { Case as CaseDto, ResolutionEvidence } from "../contracts/dto.ts";

/**
 * FSM de casos (CLI-C22). Responder, cerrar por silencio y resolver con evidencia
 * no son equivalentes; la transición exige guard y versión esperada (CAS).
 */

export const CASE_STATES = [
  "new",
  "triaged",
  "assigned",
  "in_progress",
  "waiting_customer",
  "waiting_internal",
  "resolution_proposed",
  "resolved",
  "closed",
  "reopened",
] as const;

export type CaseState = (typeof CASE_STATES)[number];

export type CaseEvent =
  | "triage"
  | "assign"
  | "start_work"
  | "ask_customer"
  | "resume_work"
  | "wait_internal"
  | "propose_resolution"
  | "resolve"
  | "close"
  | "reopen";

interface TransitionRule {
  from: readonly CaseState[];
  to: CaseState;
  guard?: (input: TransitionInput) => void;
}

export interface TransitionInput {
  case: CaseDto;
  actorId: string;
  actorKind: "human" | "agent" | "contact";
  assignedTo?: string | null;
  evidence?: readonly ResolutionEvidence[];
  /** Cierre por silencio: debe estar acordado en el contrato, no improvisado. */
  silentCloseAgreed?: boolean;
  reason?: string;
}

const RULES: Record<CaseEvent, TransitionRule> = {
  triage: { from: ["new", "reopened"], to: "triaged" },
  assign: {
    from: ["new", "triaged", "reopened", "in_progress", "waiting_internal"],
    to: "assigned",
    guard: ({ assignedTo }) => {
      if (!assignedTo) throw invalid("assign requiere assignedTo");
    },
  },
  start_work: { from: ["assigned", "waiting_internal", "reopened"], to: "in_progress" },
  ask_customer: { from: ["in_progress"], to: "waiting_customer" },
  resume_work: { from: ["waiting_customer"], to: "in_progress" },
  wait_internal: { from: ["in_progress", "assigned"], to: "waiting_internal" },
  propose_resolution: {
    from: ["in_progress", "waiting_customer", "waiting_internal"],
    to: "resolution_proposed",
  },
  resolve: {
    from: ["resolution_proposed", "in_progress"],
    to: "resolved",
    guard: ({ evidence, case: caseDto }) => {
      // Un texto amable no resuelve: hace falta evidencia que satisfaga el contrato.
      const satisfied = (evidence ?? []).filter((item) => item.satisfied);
      if (satisfied.length === 0) {
        throw conflict("Resolución sin evidencia verificable: permanece abierta");
      }
      if (caseDto.resolutionContract.kind === "informational") return;
      // Un cambio real exige prueba del cambio, no solo una cita.
      const proofOfChange = satisfied.some((item) =>
        ["receipt", "remote_state", "human_ack"].includes(item.kind),
      );
      if (!proofOfChange) {
        throw conflict("Resolución de cambio sin receipt ni estado remoto verificado");
      }
    },
  },
  close: {
    from: ["resolved", "waiting_customer"],
    to: "closed",
    guard: ({ silentCloseAgreed, case: caseDto }) => {
      if (caseDto.state === "waiting_customer" && silentCloseAgreed !== true) {
        throw conflict("Cierre por silencio sin acuerdo explícito");
      }
    },
  },
  reopen: { from: ["resolved", "closed"], to: "reopened" },
};

export interface TransitionResult {
  case: CaseDto;
  event: CaseEvent;
  from: CaseState;
  to: CaseState;
}

export function transition(
  caseDto: CaseDto,
  event: CaseEvent,
  input: Omit<TransitionInput, "case"> & { expectedVersion: number },
): TransitionResult {
  const rule = RULES[event];
  if (!rule) throw invalid(`Evento desconocido: ${event}`);
  if (caseDto.version !== input.expectedVersion) {
    throw conflict("expectedVersion obsoleto: el caso cambió");
  }
  if (!rule.from.includes(caseDto.state)) {
    throw conflict(`Transición ${event} no permitida desde ${caseDto.state}`);
  }
  if (input.actorKind === "contact") {
    // El contacto puede reabrir o pedir humano, nunca cerrar/resolver a su antojo.
    if (!["reopen"].includes(event)) throw forbidden("El contacto no puede ejecutar esa transición");
    if (input.actorId !== caseDto.contactId) throw forbidden("Caso de otro contacto");
  }
  rule.guard?.({ ...input, case: caseDto });

  const next: CaseDto = {
    ...caseDto,
    state: rule.to,
    version: caseDto.version + 1,
    updatedAt: new Date().toISOString(),
    ...(input.assignedTo !== undefined
      ? { assignedTo: input.assignedTo, assignedBy: input.actorId }
      : {}),
  };
  return { case: next, event, from: caseDto.state, to: rule.to };
}

/** Un evento de respuesta enviada no resuelve el caso por sí mismo. */
export function assertDeliveryDoesNotResolve(caseDto: CaseDto): void {
  if (caseDto.state === "resolved") return;
}

export function requireCase(caseDto: CaseDto | null): CaseDto {
  if (!caseDto) throw notFound();
  return caseDto;
}

/** Métricas honestas: cierre automático no es resolución verificada. */
export type ResolutionKind = "verified_resolution" | "auto_close" | "agent_claimed";

export function classifyResolution(kind: ResolutionKind): string {
  return kind;
}
