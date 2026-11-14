import { conflict, forbidden, unsupported } from "../lib/errors.ts";
import { hashCanonical } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Discovery y capacidades verificadas (CLI-C10).
 * `documented` no es `verified`: una página de marketing o un 200 con HTML
 * no habilitan una escritura.
 */
export type CapabilityState = "documented" | "verified" | "unsupported" | "forbidden" | "unknown";

export interface CapabilityEntry {
  provider: string;
  operation: string;
  state: CapabilityState;
  evidenceRef: string | null;
  checkedAt: string;
  requiredScopes: readonly string[];
  editionRequirement: string | null;
}

export interface CapabilityReport {
  connectionId: string;
  tenantId: string;
  providerVersion: string;
  schemaHash: string;
  generatedAt: string;
  entries: CapabilityEntry[];
  hash: string;
}

export interface ProbeResult {
  ok: boolean;
  version: string;
  schema: Record<string, unknown>;
  observedScopes: readonly string[];
  contentType: string;
}

export class DiscoveryService {
  readonly #clock: Clock;
  readonly #reports = new Map<string, CapabilityReport>();

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  /** Un probe es de lectura: nunca crea tickets ni envía mensajes. */
  async probe(input: {
    tenantId: string;
    connectionId: string;
    provider: string;
    readOnlyProbe: () => Promise<ProbeResult>;
    requiredScopes: readonly string[];
    editionRequirement?: string | null;
  }): Promise<CapabilityReport> {
    const probe = await input.readOnlyProbe();
    if (!probe.ok || !probe.contentType.includes("application/json")) {
      return this.#persist(input, "unknown", probe, "probe_inconclusive");
    }
    const missingScopes = input.requiredScopes.filter((s) => !probe.observedScopes.includes(s));
    const state: CapabilityState = missingScopes.length > 0 ? "forbidden" : "verified";
    const report: CapabilityReport = {
      connectionId: input.connectionId,
      tenantId: input.tenantId,
      providerVersion: probe.version,
      schemaHash: hashCanonical(probe.schema),
      generatedAt: nowIso(this.#clock),
      entries: [
        {
          provider: input.provider,
          operation: "probe.read",
          state,
          evidenceRef: `probe:${probe.version}`,
          checkedAt: nowIso(this.#clock),
          requiredScopes: [...input.requiredScopes],
          editionRequirement: input.editionRequirement ?? null,
        },
      ],
      hash: "",
    };
    report.hash = hashCanonical({
      connectionId: report.connectionId,
      providerVersion: report.providerVersion,
      schemaHash: report.schemaHash,
      entries: report.entries,
    });
    this.#reports.set(`${input.tenantId}:${input.connectionId}`, report);
    return report;
  }

  requireCapability(tenantId: string, connectionId: string, operation: string): CapabilityEntry {
    const report = this.#reports.get(`${tenantId}:${connectionId}`);
    if (!report) throw conflict("Sin capability report: ejecutar discovery primero");
    const entry = report.entries.find((e) => e.operation === operation);
    if (!entry) throw unsupported(`Operación ${operation} no descubierta`);
    if (entry.state === "forbidden") throw forbidden("Permiso no concedido en el proveedor");
    if (entry.state !== "verified") {
      throw unsupported(`Operación ${operation} en estado ${entry.state}`);
    }
    return entry;
  }

  /** Cambiar schema/rol/módulo exige nueva verificación. */
  invalidate(tenantId: string, connectionId: string): void {
    this.#reports.delete(`${tenantId}:${connectionId}`);
  }

  report(tenantId: string, connectionId: string): CapabilityReport | null {
    return this.#reports.get(`${tenantId}:${connectionId}`) ?? null;
  }

  #persist(
    input: { tenantId: string; connectionId: string; provider: string; requiredScopes: readonly string[] },
    state: CapabilityState,
    probe: ProbeResult,
    reason: string,
  ): CapabilityReport {
    const report: CapabilityReport = {
      connectionId: input.connectionId,
      tenantId: input.tenantId,
      providerVersion: probe.version || "unknown",
      schemaHash: hashCanonical(probe.schema ?? {}),
      generatedAt: nowIso(this.#clock),
      entries: [
        {
          provider: input.provider,
          operation: "probe.read",
          state,
          evidenceRef: reason,
          checkedAt: nowIso(this.#clock),
          requiredScopes: [...input.requiredScopes],
          editionRequirement: null,
        },
      ],
      hash: "",
    };
    report.hash = hashCanonical(report.entries);
    this.#reports.set(`${input.tenantId}:${input.connectionId}`, report);
    return report;
  }
}
