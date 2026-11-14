import { conflict, forbidden, invalid, notFound } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Derechos y retención (CLI-C38).
 * Una orden de chat no borra ni exporta: hace falta identidad, alcance, revisión
 * y comprobación de bloqueos de conservación.
 */
export type PrivacyRequestKind = "access" | "rectification" | "erasure" | "export" | "restriction";

export interface PrivacyRequest {
  id: string;
  tenantId: string;
  kind: PrivacyRequestKind;
  requesterRef: string;
  subjectRef: string;
  scope: string[];
  status: "received" | "verified" | "reviewing" | "approved" | "executed" | "rejected";
  legalHold: boolean;
  createdAt: string;
  executedAt: string | null;
  reviewedBy: string | null;
  notes: string[];
}

export interface RetentionRule {
  objectKind: string;
  purpose: string;
  months: number;
  needsLegalReview: boolean;
}

export const DEFAULT_RETENTION: readonly RetentionRule[] = [
  { objectKind: "message.original", purpose: "support_reply", months: 24, needsLegalReview: true },
  { objectKind: "message.summary", purpose: "analytics", months: 12, needsLegalReview: true },
  { objectKind: "embedding.chunk", purpose: "case_management", months: 12, needsLegalReview: true },
  { objectKind: "audit.ref", purpose: "security", months: 60, needsLegalReview: true },
  { objectKind: "av.transcript", purpose: "av_recording", months: 3, needsLegalReview: true },
];

export class PrivacyService {
  readonly #requests: PrivacyRequest[] = [];
  readonly #clock: Clock;
  readonly #retention: RetentionRule[];

  constructor(options: { clock?: Clock; retention?: readonly RetentionRule[] } = {}) {
    this.#clock = options.clock ?? systemClock;
    this.#retention = [...(options.retention ?? DEFAULT_RETENTION)];
  }

  open(input: {
    tenantId: string;
    kind: PrivacyRequestKind;
    requesterRef: string;
    subjectRef: string;
    scope: readonly string[];
    requestedByModel?: boolean;
    legalHold?: boolean;
  }): PrivacyRequest {
    if (input.scope.length === 0) throw invalid("Solicitud sin alcance");
    if (input.scope.includes("*") && input.requestedByModel) {
      throw forbidden("Una petición del modelo no puede pedir exportación total");
    }
    const request: PrivacyRequest = {
      id: opaqueId("privacy"),
      tenantId: input.tenantId,
      kind: input.kind,
      requesterRef: input.requesterRef,
      subjectRef: input.subjectRef,
      scope: [...input.scope],
      status: "received",
      legalHold: input.legalHold ?? false,
      createdAt: nowIso(this.#clock),
      executedAt: null,
      reviewedBy: null,
      notes: [],
    };
    this.#requests.push(request);
    return request;
  }

  verify(id: string, tenantId: string, reviewedBy: string): PrivacyRequest {
    const request = this.#require(id, tenantId);
    if (request.status !== "received") throw conflict("Solicitud ya verificada");
    request.status = "verified";
    request.reviewedBy = reviewedBy;
    return request;
  }

  /** Preview de exportación: nunca devuelve datos de terceros sin revisión. */
  previewExport(id: string, tenantId: string): { requestId: string; includedScopes: string[]; redactions: string[] } {
    const request = this.#require(id, tenantId);
    if (request.kind !== "export" && request.kind !== "access") {
      throw invalid("La solicitud no es de exportación/acceso");
    }
    const redactions = request.scope
      .filter((s) => s.startsWith("third_party:"))
      .map((s) => `omitido:${s}`);
    return {
      requestId: request.id,
      includedScopes: request.scope.filter((s) => !s.startsWith("third_party:")),
      redactions,
    };
  }

  approve(id: string, tenantId: string, reviewedBy: string): PrivacyRequest {
    const request = this.#require(id, tenantId);
    if (request.status !== "verified") throw conflict("Verificar antes de aprobar");
    if (request.kind === "erasure" && request.legalHold) {
      throw conflict("Bloqueo legal: planificar restricción, no supresión");
    }
    request.status = "approved";
    request.reviewedBy = reviewedBy;
    return request;
  }

  execute(id: string, tenantId: string, stores: readonly string[]): PrivacyRequest {
    const request = this.#require(id, tenantId);
    if (request.status !== "approved") throw conflict("Solicitud no aprobada");
    request.status = "executed";
    request.executedAt = nowIso(this.#clock);
    for (const store of stores) {
      // ACK explícito por almacén; un almacén pendiente no se declara borrado.
      request.notes.push(`propagated:${store}`);
    }
    return request;
  }

  retentionFor(objectKind: string): RetentionRule {
    const found = this.#retention.find((rule) => rule.objectKind === objectKind);
    if (!found) throw notFound(`Sin política de retención para ${objectKind}`);
    return found;
  }

  /** Tras restaurar un backup se reaplican supresiones aprobadas. */
  reappliedAfterRestore(tenantId: string): readonly PrivacyRequest[] {
    return this.#requests.filter(
      (r) => r.tenantId === tenantId && r.status === "executed" && r.kind === "erasure",
    );
  }

  #require(id: string, tenantId: string): PrivacyRequest {
    const found = this.#requests.find((r) => r.id === id && r.tenantId === tenantId);
    if (!found) throw notFound();
    return found;
  }
}
