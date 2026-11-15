import { conflict, invalid } from "../lib/errors.ts";
import { hashCanonical, opaqueId, sha256Hex } from "../lib/ids.ts";
import type { Contact } from "../contracts/dto.ts";
import type { MemoryStore } from "../storage/memory.ts";

/**
 * Importación de contactos y sync (CLI-C12).
 * Staging con cursor, cuarentena por fila y comité idempotente: repetir el mismo
 * fichero no duplica contactos, y una fila mala no aborta el lote.
 */
export type ImportReason =
  | "missing_external_id"
  | "missing_display_name"
  | "invalid_email"
  | "invalid_locale"
  | "duplicate_in_batch";

export interface ImportRow {
  externalId?: string;
  displayName?: string;
  email?: string;
  locale?: string;
}

export interface QuarantinedRow {
  readonly index: number;
  readonly reason: ImportReason;
}

export interface ImportPreview {
  readonly jobRef: string;
  readonly tenantId: string;
  readonly sourceRef: string;
  readonly mappingVersion: string;
  readonly dryRun: boolean;
  readonly totalRows: number;
  readonly accepted: number;
  readonly quarantined: readonly QuarantinedRow[];
  readonly nextCursor: number;
  readonly payloadHash: string;
}

export interface ImportCommit {
  readonly jobRef: string;
  readonly created: number;
  readonly skippedExisting: number;
  readonly quarantined: number;
}

const LOCALES = new Set(["es", "en", "fr"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/u;

export function normalizeEmail(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  return EMAIL.test(trimmed) ? trimmed : null;
}

interface StagedRow {
  externalId: string;
  displayName: string;
  email: string | null;
  locale: "es" | "en" | "fr";
}

interface Job {
  readonly ref: string;
  readonly tenantId: string;
  readonly sourceRef: string;
  readonly mappingVersion: string;
  readonly connectionId: string;
  staged: StagedRow[];
  preview: ImportPreview | null;
  committed: ImportCommit | null;
}

export class ContactImport {
  readonly #store: Pick<MemoryStore, "contacts" | "links">;
  readonly #clock: () => string;
  readonly #jobs = new Map<string, Job>();

  constructor(store: Pick<MemoryStore, "contacts" | "links">, options: { now?: () => string } = {}) {
    this.#store = store;
    this.#clock = options.now ?? (() => new Date().toISOString());
  }

  /**
   * Prepara el lote. `dryRun` no escribe nada; el cursor permite reanudar
   * exactamente donde se quedó el lote anterior.
   */
  stage(input: {
    tenantId: string;
    sourceRef: string;
    connectionId: string;
    mappingVersion: string;
    rows: readonly ImportRow[];
    cursor?: number;
    dryRun?: boolean;
  }): ImportPreview {
    if (!input.tenantId) throw invalid("tenantId requerido");
    if (!input.connectionId) throw invalid("connectionId requerido");
    const cursor = input.cursor ?? 0;
    if (cursor < 0 || cursor > input.rows.length) throw invalid("cursor fuera de rango");
    const dryRun = input.dryRun ?? false;
    const jobRef = opaqueId("import");
    const staged: StagedRow[] = [];
    const quarantined: QuarantinedRow[] = [];
    const seen = new Set<string>();
    for (let index = cursor; index < input.rows.length; index += 1) {
      const row = input.rows[index] ?? {};
      const externalId = row.externalId?.trim();
      if (!externalId) {
        quarantined.push({ index, reason: "missing_external_id" });
        continue;
      }
      if (seen.has(externalId)) {
        quarantined.push({ index, reason: "duplicate_in_batch" });
        continue;
      }
      const displayName = row.displayName?.trim();
      if (!displayName) {
        quarantined.push({ index, reason: "missing_display_name" });
        continue;
      }
      const email = row.email ? normalizeEmail(row.email) : null;
      if (row.email && !email) {
        quarantined.push({ index, reason: "invalid_email" });
        continue;
      }
      const locale = (row.locale ?? "es").trim().toLowerCase();
      if (!LOCALES.has(locale)) {
        quarantined.push({ index, reason: "invalid_locale" });
        continue;
      }
      seen.add(externalId);
      staged.push({
        externalId,
        displayName,
        email,
        locale: locale as "es" | "en" | "fr",
      });
    }
    const preview: ImportPreview = {
      jobRef,
      tenantId: input.tenantId,
      sourceRef: input.sourceRef,
      mappingVersion: input.mappingVersion,
      dryRun,
      totalRows: input.rows.length,
      accepted: staged.length,
      quarantined,
      nextCursor: input.rows.length,
      payloadHash: sha256Hex(JSON.stringify(staged.map((row) => [row.externalId, row.displayName, row.email, row.locale]))),
    };
    this.#jobs.set(jobRef, {
      ref: jobRef,
      tenantId: input.tenantId,
      sourceRef: input.sourceRef,
      mappingVersion: input.mappingVersion,
      connectionId: input.connectionId,
      staged,
      preview,
      committed: null,
    });
    return preview;
  }

  /** Aplica el lote ya revisado. Idempotente por (conexión, modelo, externalId). */
  commit(jobRef: string): ImportCommit {
    const job = this.#jobs.get(jobRef);
    if (!job) throw invalid("job de importación desconocido");
    if (!job.preview) throw conflict("El lote no se ha preparado");
    if (job.committed) return job.committed;
    let created = 0;
    let skippedExisting = 0;
    for (const row of job.staged) {
      const alreadyLinked = this.#store.links.list(
        job.tenantId,
        (link) =>
          link.connectionId === job.connectionId &&
          link.model === "contact" &&
          link.externalId === row.externalId &&
          link.localKind === "contact",
      );
      if (alreadyLinked.length > 0) {
        skippedExisting += 1;
        continue;
      }
      const contactRef = opaqueId("contact");
      const contact: Contact = {
        id: contactRef,
        tenantId: job.tenantId,
        displayName: row.displayName,
        verifiedChannelIdentities: row.email
          ? [
              {
                provider: "email",
                connectionId: job.connectionId,
                remoteContactId: row.externalId,
                normalizedAddressRef: sha256Hex(row.email).slice(0, 32),
                verificationState: "unverified",
                verifiedAt: null,
                evidenceRef: null,
              },
            ]
          : [],
        organizationRelations: [],
        preferredLocale: row.locale,
        accessRefs: [],
      };
      this.#store.contacts.insert(contact);
      this.#store.links.insert({
        id: opaqueId("link"),
        tenantId: job.tenantId,
        provider: "import",
        connectionId: job.connectionId,
        model: "contact",
        externalId: row.externalId,
        localKind: "contact",
        localId: contactRef,
        remoteVersion: null,
        writeDate: null,
        sourceHash: hashCanonical({ externalId: row.externalId, email: row.email }),
        mapperVersion: job.mappingVersion,
        lastSeenAt: this.#clock(),
      });
      created += 1;
    }
    const commit: ImportCommit = {
      jobRef,
      created,
      skippedExisting,
      quarantined: job.preview.quarantined.length,
    };
    job.committed = commit;
    return commit;
  }

  /** Reanudación: nuevo lote desde el cursor del anterior, sin repetir filas. */
  resume(input: {
    jobRef: string;
    rows: readonly ImportRow[];
    cursor?: number;
  }): ImportPreview {
    const job = this.#jobs.get(input.jobRef);
    if (!job || !job.preview) throw invalid("job de importación desconocido");
    return this.stage({
      tenantId: job.tenantId,
      sourceRef: job.sourceRef,
      connectionId: job.connectionId,
      mappingVersion: job.mappingVersion,
      rows: input.rows,
      cursor: input.cursor ?? job.preview.nextCursor,
      dryRun: job.preview.dryRun,
    });
  }

  preview(jobRef: string): ImportPreview {
    const job = this.#jobs.get(jobRef);
    if (!job || !job.preview) throw invalid("job de importación desconocido");
    return job.preview;
  }
}
