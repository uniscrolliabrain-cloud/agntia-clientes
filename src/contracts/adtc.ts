import { z } from "zod";
import type { DomainEvent, DomainEventType } from "../bridge/host.ts";
import { invalid } from "../lib/errors.ts";
import { sha256Hex } from "../lib/ids.ts";

/**
 * ADTC v0.1 (docs/factory/03-TRACE-OBSERVABILITY.md).
 * Contrato lógico de trazabilidad distribuida: sin PII, con refs restringidas,
 * correlación W3C y claves de idempotencia estables por efecto.
 *
 * Desviación declarada: el ejemplo del documento no incluye `attemptId`, pero su
 * texto exige un id por intento; se añade como campo nullable.
 */
export const ADTC_SCHEMA_VERSION = "adtc/0.1" as const;
export const ADTC_SOURCE = "agntia-clientes" as const;

const TraceId = z.string().regex(/^[0-9a-f]{32}$/u, "traceId W3C de 32 hex");
const SpanId = z.string().regex(/^[0-9a-f]{16}$/u, "spanId W3C de 16 hex");
const Ref = z
  .string()
  .min(3)
  .max(200)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]+$/u, "referencia opaca, no contenido");

const EVENT_TYPE = /^clientes\.[a-z0-9_]+(?:\.[a-z0-9_]+)+$/u;

/** Nombres canónicos del documento; no inventan tipos nuevos. */
export const ADTC_EVENT_TYPE_MAP: Record<DomainEventType, string> = {
  "clientes.contact.imported": "clientes.contact.imported",
  "clientes.case.changed": "clientes.ticket.changed",
  "clientes.reply.proposed": "clientes.ticket.reply_proposed",
  "clientes.message.accepted": "clientes.message.accepted",
  "clientes.message.delivered": "clientes.message.delivered",
  "clientes.message.outcome_unknown": "clientes.message.outcome_unknown",
  "clientes.handoff.required": "clientes.ticket.handoff_required",
  "clientes.knowledge.gap": "clientes.knowledge.gap",
  "clientes.health.changed": "clientes.customer_health.changed",
  "clientes.review.required": "clientes.review.required",
};

export const AdtcEvent = z
  .object({
    schemaVersion: z.literal(ADTC_SCHEMA_VERSION),
    eventId: Ref,
    eventType: z.string().regex(EVENT_TYPE),
    tenantId: z.string().min(1).max(128),
    actorId: Ref,
    taskId: Ref.nullable(),
    correlationId: Ref,
    causationId: Ref.nullable(),
    requestId: Ref.nullable(),
    traceId: TraceId,
    spanId: SpanId,
    idempotencyKey: z.string().min(8).max(200),
    source: z.literal(ADTC_SOURCE),
    resourceRefs: z.array(Ref).max(20),
    evidenceRefs: z.array(Ref).max(20),
    payloadRef: Ref.nullable(),
    attemptId: Ref.nullable(),
  })
  .strict();

export type AdtcEventValue = z.infer<typeof AdtcEvent>;

/**
 * El bus y OTel no llevan conversaciones, emails, teléfonos, adjuntos ni secretos.
 * Una ref que contenga esos datos se rechaza antes de emitir.
 */
const FORBIDDEN_IN_REF: readonly RegExp[] = [
  /\S+@\S+\.\S+/u, // email
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/u, // JWT
  /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]+/u, // claves de proveedor
  /postgres(?:ql)?:\/\//u, // DSN
  /Bearer\s+/iu,
  /https?:\/\//iu,
  /\s/u, // texto libre, no ref
  /(?<![\w])\+?\d{9,}(?![\w])/u, // teléfono aislado, no un id con dígitos
];

export function assertRestrictedRef(value: string, field: string): void {
  for (const pattern of FORBIDDEN_IN_REF) {
    if (pattern.test(value)) throw invalid(`${field} contiene contenido no permitido en el bus`, { field });
  }
}

export interface AdtcContext {
  traceId?: string;
  spanId?: string;
  taskId?: string | null;
  requestId?: string | null;
  causationId?: string | null;
  idempotencyKey?: string;
  attemptId?: string | null;
  payloadRef?: string | null;
  resourceRefs?: readonly string[];
  evidenceRefs?: readonly string[];
}

/**
 * Deriva trace/span de forma determinista a partir del evento cuando no hay
 * propagación real del padre. Documentado: no sustituye un traceparent recibido.
 */
export function deriveTraceIds(event: Pick<DomainEvent, "id" | "correlationId">): {
  traceId: string;
  spanId: string;
} {
  return {
    traceId: sha256Hex(event.correlationId).slice(0, 32),
    spanId: sha256Hex(event.id).slice(0, 16),
  };
}

export function toAdtcEvent(event: DomainEvent, context: AdtcContext = {}): AdtcEventValue {
  const derived = deriveTraceIds(event);
  const draft = {
    schemaVersion: ADTC_SCHEMA_VERSION,
    eventId: event.id,
    eventType: ADTC_EVENT_TYPE_MAP[event.type],
    tenantId: event.tenantId,
    actorId: event.actorRef,
    taskId: context.taskId ?? null,
    correlationId: event.correlationId,
    causationId: context.causationId ?? event.causationId,
    requestId: context.requestId ?? null,
    traceId: context.traceId ?? derived.traceId,
    spanId: context.spanId ?? derived.spanId,
    idempotencyKey: context.idempotencyKey ?? sha256Hex(`${event.type}:${event.id}`),
    source: ADTC_SOURCE,
    resourceRefs: [...(context.resourceRefs ?? Object.values(event.refs).filter(isRefLike))],
    evidenceRefs: [...(context.evidenceRefs ?? [])],
    payloadRef: context.payloadRef ?? null,
    attemptId: context.attemptId ?? null,
  };
  for (const [field, value] of Object.entries(draft)) {
    if (typeof value === "string") assertRestrictedRef(value, field);
    if (Array.isArray(value)) value.forEach((entry, index) => assertRestrictedRef(String(entry), `${field}[${index}]`));
  }
  return AdtcEvent.parse(draft);
}

function isRefLike(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,199}$/u.test(value);
}

/** traceparent W3C: versión 00, sin flags arbitrarios. */
export function formatTraceparent(event: Pick<AdtcEventValue, "traceId" | "spanId">): string {
  return `00-${event.traceId}-${event.spanId}-01`;
}

export function parseTraceparent(header: string): { traceId: string; spanId: string } | null {
  const match = /^00-([0-9a-f]{32})-([0-9a-f]{16})-(0[01])$/u.exec(header.trim());
  if (!match) return null;
  const [, traceId, spanId] = match;
  if (!traceId || !spanId) return null;
  if (/^0+$/u.test(traceId) || /^0+$/u.test(spanId)) return null; // all-zero inválido
  return { traceId, spanId };
}
