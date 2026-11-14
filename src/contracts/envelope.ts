import { z } from "zod";
import { IsoDateTime, OpaqueRef, SERVICE_SCHEMA_VERSION, TenantId, strictObject } from "./common.ts";

/**
 * Envelope de operación (CLI-C05). actorId/tenantId los resuelve el servidor;
 * el input del modelo no puede fijarlos.
 */
export const Envelope = strictObject({
  schemaVersion: z.literal(SERVICE_SCHEMA_VERSION),
  operationId: OpaqueRef,
  tenantId: TenantId,
  actorId: OpaqueRef,
  capability: z.string().min(3).max(120),
  requestId: z.string().min(1).max(200).nullable(),
  correlationId: z.string().min(1).max(200),
  causationId: z.string().min(1).max(200).nullable(),
  idempotencyKey: z.string().min(8).max(200),
  expectedVersion: z.number().int().nonnegative().nullable(),
  approvalRef: z.string().min(3).max(200).nullable(),
  dryRun: z.boolean(),
  payload: z.record(z.string(), z.unknown()),
});

export type EnvelopeValue = z.infer<typeof Envelope>;

export const CapabilityReportState = z.enum([
  "documented",
  "verified",
  "unsupported",
  "forbidden",
  "unknown",
]);

export type CapabilityState = z.infer<typeof CapabilityReportState>;

export const EvidenceRef = strictObject({
  kind: z.enum(["receipt", "remote_id", "snapshot", "hash", "log", "approval", "test"]),
  ref: z.string().min(1).max(500),
  hash: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
  observedAt: IsoDateTime,
});

/** Resultado discriminado: un timeout de escritura no es `ok` ni `retryable` por defecto. */
export const OperationResult = z.discriminatedUnion("status", [
  strictObject({
    status: z.literal("ok"),
    operationId: OpaqueRef,
    applied: z.boolean(),
    localRefs: z.record(z.string(), z.string()),
    remoteRefs: z.record(z.string(), z.string()),
    evidenceRefs: z.array(EvidenceRef),
    policyVersion: z.string(),
    payloadHash: z.string().regex(/^[0-9a-f]{64}$/),
    warnings: z.array(z.string()),
  }),
  strictObject({
    status: z.literal("preview"),
    operationId: OpaqueRef,
    payloadHash: z.string().regex(/^[0-9a-f]{64}$/),
    diff: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
  strictObject({
    status: z.literal("accepted_async"),
    operationId: OpaqueRef,
    jobId: OpaqueRef,
    payloadHash: z.string().regex(/^[0-9a-f]{64}$/),
  }),
  strictObject({
    status: z.literal("outcome_unknown"),
    operationId: OpaqueRef,
    payloadHash: z.string().regex(/^[0-9a-f]{64}$/),
    reconciliationRequired: z.literal(true),
    retryable: z.literal(false),
    notes: z.array(z.string()),
  }),
  strictObject({
    status: z.literal("error"),
    operationId: OpaqueRef,
    code: z.string(),
    message: z.string(),
    retryable: z.boolean(),
    reconciliationRequired: z.boolean(),
  }),
]);

export type OperationResultValue = z.infer<typeof OperationResult>;
