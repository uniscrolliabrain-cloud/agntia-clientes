import { conflict, invalid } from "../lib/errors.ts";

/**
 * Routing determinista (CLI-C23): capacidad + carga + contrato.
 * El nombre del agente o una emoción inferida del cliente no dan prioridad ni permiso.
 */
export interface RouteCandidate {
  assigneeRef: string;
  capabilities: readonly string[];
  activeLoad: number;
  maxLoad: number;
  eligibleContractIds: readonly string[];
}

export interface RouteRequest {
  requiredCapability: string;
  contractId: string;
  priority: "low" | "normal" | "high" | "urgent";
}

export interface RouteDecision {
  assigneeRef: string;
  reasonCodes: string[];
}

export function route(request: RouteRequest, candidates: readonly RouteCandidate[]): RouteDecision {
  const eligible = candidates.filter(
    (candidate) =>
      candidate.capabilities.includes(request.requiredCapability) &&
      candidate.eligibleContractIds.includes(request.contractId) &&
      candidate.activeLoad < candidate.maxLoad,
  );
  if (eligible.length === 0) {
    // Sin cobertura real: se declara, no se promete atención inmediata.
    throw conflict("Sin cobertura disponible para el contrato y la capacidad requeridos");
  }
  const ordered = [...eligible].sort((a, b) => {
    if (a.activeLoad !== b.activeLoad) return a.activeLoad - b.activeLoad;
    return a.assigneeRef.localeCompare(b.assigneeRef);
  });
  const chosen = ordered[0];
  if (!chosen) throw conflict("Sin cobertura disponible");
  if (request.priority === "urgent" && chosen.maxLoad - chosen.activeLoad <= 0) {
    throw invalid("Capacidad saturada para prioridad urgente");
  }
  return { assigneeRef: chosen.assigneeRef, reasonCodes: ["capability_match", "contract_eligible", "lowest_load"] };
}

/** El escalado humano no crea un segundo scheduler: solo señala al padre. */
export interface EscalationSignal {
  tenantId: string;
  caseId: string;
  reason: "sla_breach" | "no_coverage" | "customer_request" | "risk";
  emittedAt: string;
}
