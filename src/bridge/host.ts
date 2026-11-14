import { forbidden, invalid } from "../lib/errors.ts";
import { hashCanonical } from "../lib/ids.ts";

/**
 * Bridge del padre (CLI-C35). Contratos y proyección de eventos; el wiring real
 * en /agente NO se aplica aquí (requiere otra autorización) → HOST_BRIDGE_NOT_VERIFIED.
 */
export const HOST_BRIDGE_STATUS = "HOST_BRIDGE_NOT_VERIFIED" as const;

export interface HostPort {
  verifyPrincipal(subjectRef: string): Promise<{ actorId: string; tenantId: string } | null>;
  requestApproval(input: { proposalRef: string; payloadHash: string }): Promise<{ approvalRef: string } | null>;
  recordTask(input: { assignedBy: string; assignedTo: string; evidenceRefs: string[] }): Promise<{ taskId: string }>;
}

/** SystemEvent nativo del padre: schemaVersion literal "1.0" (string, no número). */
export interface NativeSystemEvent {
  id: string;
  type:
    | "ticket.created"
    | "ticket.assigned"
    | "ticket.resolved"
    | "ticket.escalated"
    | "conversation.opened"
    | "conversation.routed"
    | "conversation.closed";
  schemaVersion: "1.0";
  tenantId: string;
  owner: string;
  emittedAt: string;
  source: { kind: "service" | "agent" | "human"; id: string; personaId?: string };
  correlationId: string;
  payload: Record<string, unknown>;
}

export type DomainEventType =
  | "clientes.contact.imported"
  | "clientes.case.changed"
  | "clientes.reply.proposed"
  | "clientes.message.accepted"
  | "clientes.message.delivered"
  | "clientes.message.outcome_unknown"
  | "clientes.handoff.required"
  | "clientes.knowledge.gap"
  | "clientes.health.changed"
  | "clientes.review.required";

export interface DomainEvent {
  id: string;
  type: DomainEventType;
  tenantId: string;
  actorRef: string;
  correlationId: string;
  causationId: string | null;
  occurredAt: string;
  refs: Record<string, string>;
}

export function projectToNative(
  event: DomainEvent,
  options: { ownerRef: string; sourceId: string; personaId?: string },
): NativeSystemEvent | null {
  // Proyección conservadora: solo hechos con equivalente nativo inequívoco.
  // Entregar un mensaje NO cierra una conversación y una promesa NO resuelve.
  const mapping: Partial<Record<DomainEventType, NativeSystemEvent["type"]>> = {
    "clientes.handoff.required": "ticket.escalated",
  };
  let type = mapping[event.type];
  if (event.type === "clientes.case.changed" && event.refs["assignedTo"]) {
    type = "ticket.assigned";
  }
  if (event.type === "clientes.case.changed" && event.refs["verifiedResolution"] === "true") {
    type = "ticket.resolved";
  }
  if (!type) return null;
  return {
    id: event.id,
    type,
    schemaVersion: "1.0",
    tenantId: event.tenantId,
    owner: options.ownerRef,
    emittedAt: event.occurredAt,
    source: { kind: "service", id: options.sourceId, ...(options.personaId ? { personaId: options.personaId } : {}) },
    correlationId: event.correlationId,
    payload: { ...event.refs, domainEventId: event.id },
  };
}

/** Consumidor idempotente del host: dedup por domainEventId. */
export class HostEventInbox {
  readonly #seen = new Set<string>();

  accept(event: NativeSystemEvent): void {
    if (event.schemaVersion !== "1.0") throw invalid("schemaVersion nativo inválido");
    if (!["service", "agent", "human"].includes(event.source.kind)) {
      throw forbidden("source.kind no permitido por el enum nativo");
    }
    const key = `${event.tenantId}:${event.id}`;
    if (this.#seen.has(key)) return; // replay: no segunda tarea
    this.#seen.add(key);
  }

  seenCount(): number {
    return this.#seen.size;
  }
}

/** Host fake para pruebas contractuales: nunca se presenta como integración instalada. */
export class FakeHost implements HostPort {
  readonly approvals: string[] = [];
  readonly tasks: { assignedBy: string; assignedTo: string; evidenceRefs: string[] }[] = [];

  async verifyPrincipal(subjectRef: string) {
    return subjectRef.startsWith("sub_") ? { actorId: subjectRef, tenantId: "tenant_fixture" } : null;
  }

  async requestApproval(input: { proposalRef: string; payloadHash: string }) {
    const approvalRef = `host_approval_${hashCanonical(input).slice(0, 12)}`;
    this.approvals.push(approvalRef);
    return { approvalRef };
  }

  async recordTask(input: { assignedBy: string; assignedTo: string; evidenceRefs: string[] }) {
    this.tasks.push(input);
    return { taskId: `host_task_${this.tasks.length}` };
  }
}
