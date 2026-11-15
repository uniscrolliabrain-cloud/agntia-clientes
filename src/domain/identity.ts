import { conflict, forbidden, invalid, notFound } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";

/**
 * Directorio de identidad multicanal (CLI-C11).
 * Un vínculo necesita prueba; un nombre parecido no fusiona nada. El merge es
 * revisable, deja alias y se puede deshacer sin reconstruir datos.
 */
export type IdentityProvider = "email" | "whatsapp" | "web" | "chatwoot" | "zammad" | "frappe";

export type VerificationState = "unverified" | "pending" | "verified" | "revoked";

export interface ChannelLink {
  readonly id: string;
  readonly tenantId: string;
  readonly contactRef: string;
  readonly provider: IdentityProvider;
  readonly addressRef: string;
  readonly verificationState: VerificationState;
  readonly evidenceRef: string | null;
  readonly verifiedAt: string | null;
}

/** Señales admisibles para fusionar; `name_only` nunca lo es. */
export type MergeSignal = "verified_email" | "verified_phone" | "human_review" | "name_only";

export interface MergeRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly primaryRef: string;
  readonly secondaryRef: string;
  readonly reviewedBy: string;
  readonly signal: MergeSignal;
  readonly evidenceRefs: readonly string[];
  readonly createdAt: string;
  state: "applied" | "reverted";
  revertedBy: string | null;
  revertedAt: string | null;
}

export interface LinkInput {
  tenantId: string;
  contactRef: string;
  provider: IdentityProvider;
  addressRef: string;
  verificationState: VerificationState;
  evidenceRef: string | null;
  verifiedAt: string | null;
}

export class IdentityDirectory {
  readonly #links: ChannelLink[] = [];
  readonly #merges: MergeRecord[] = [];
  /** secondaryRef → primaryRef; se elimina al deshacer el merge. */
  readonly #aliases = new Map<string, string>();
  readonly #clock: () => string;

  constructor(options: { now?: () => string } = {}) {
    this.#clock = options.now ?? (() => new Date().toISOString());
  }

  /** Vincular exige dirección normalizada y evidencia cuando se declara verificada. */
  link(input: LinkInput): ChannelLink {
    if (!input.tenantId) throw invalid("tenantId requerido");
    if (!input.addressRef.trim()) throw invalid("addressRef vacío");
    if (input.verificationState === "verified" && !input.evidenceRef) {
      throw forbidden("Un vínculo verificado requiere evidenceRef");
    }
    if (input.verificationState === "verified" && !input.verifiedAt) {
      throw invalid("Un vínculo verificado requiere verifiedAt");
    }
    const duplicate = this.#links.find(
      (link) =>
        link.tenantId === input.tenantId &&
        link.provider === input.provider &&
        link.addressRef === input.addressRef &&
        link.verificationState !== "revoked",
    );
    if (duplicate) {
      if (duplicate.contactRef === input.contactRef) return duplicate;
      throw conflict("Dirección ya vinculada a otro contacto; requiere revisión");
    }
    const link: ChannelLink = { ...input, id: opaqueId("idlink") };
    this.#links.push(link);
    return link;
  }

  /** Candidatos por dirección, solo dentro del tenant. */
  candidates(input: { tenantId: string; provider: IdentityProvider; addressRef: string }): readonly ChannelLink[] {
    return this.#links.filter(
      (link) =>
        link.tenantId === input.tenantId &&
        link.provider === input.provider &&
        link.addressRef === input.addressRef,
    );
  }

  /**
   * Fusiona dos contactos con evidencia y revisor humano. No automático:
   * `name_only` y la ausencia de evidencia se rechazan.
   */
  merge(input: {
    tenantId: string;
    primaryRef: string;
    secondaryRef: string;
    reviewedBy: string;
    signal: MergeSignal;
    evidenceRefs: readonly string[];
  }): MergeRecord {
    if (input.primaryRef === input.secondaryRef) throw invalid("No se fusiona un contacto consigo mismo");
    if (input.signal === "name_only") {
      throw forbidden("Coincidencia de nombre no autoriza una fusión");
    }
    if (!input.reviewedBy || input.reviewedBy.startsWith("agent_") || input.reviewedBy.startsWith("system")) {
      throw forbidden("La fusión requiere revisión humana identificada");
    }
    if (input.evidenceRefs.length === 0) throw forbidden("La fusión requiere evidencia");
    const primary = this.resolveAlias(input.tenantId, input.primaryRef);
    const secondary = this.resolveAlias(input.tenantId, input.secondaryRef);
    if (primary === secondary) throw conflict("Los contactos ya son el mismo");
    const existing = this.#merges.find(
      (m) => m.tenantId === input.tenantId && m.secondaryRef === secondary && m.state === "applied",
    );
    if (existing) throw conflict("El contacto secundario ya está fusionado");
    const record: MergeRecord = {
      id: opaqueId("merge"),
      tenantId: input.tenantId,
      primaryRef: primary,
      secondaryRef: secondary,
      reviewedBy: input.reviewedBy,
      signal: input.signal,
      evidenceRefs: [...input.evidenceRefs],
      createdAt: this.#clock(),
      state: "applied",
      revertedBy: null,
      revertedAt: null,
    };
    this.#merges.push(record);
    this.#aliases.set(`${input.tenantId}:${secondary}`, primary);
    return record;
  }

  /** Deshacer es parte del diseño: alias fuera y vínculos intactos. */
  unmerge(input: { tenantId: string; mergeRef: string; revertedBy: string }): MergeRecord {
    const record = this.#merges.find((m) => m.id === input.mergeRef && m.tenantId === input.tenantId);
    if (!record) throw notFound("Merge no encontrado");
    if (record.state === "reverted") throw conflict("El merge ya fue deshecho");
    if (!input.revertedBy) throw forbidden("Deshacer requiere actor identificado");
    record.state = "reverted";
    record.revertedBy = input.revertedBy;
    record.revertedAt = this.#clock();
    this.#aliases.delete(`${input.tenantId}:${record.secondaryRef}`);
    return record;
  }

  /** Resolución por canal que sigue alias y no cruza tenants. */
  resolve(tenantId: string, provider: IdentityProvider, addressRef: string): string | null {
    const links = this.candidates({ tenantId, provider, addressRef }).filter(
      (link) => link.verificationState === "verified",
    );
    const first = links[0];
    return first ? this.resolveAlias(tenantId, first.contactRef) : null;
  }

  resolveAlias(tenantId: string, contactRef: string): string {
    let current = contactRef;
    const seen = new Set<string>();
    for (;;) {
      const next = this.#aliases.get(`${tenantId}:${current}`);
      if (!next) return current;
      if (seen.has(next)) throw conflict("Ciclo de alias detectado");
      seen.add(next);
      current = next;
    }
  }

  linksOf(tenantId: string, contactRef: string): readonly ChannelLink[] {
    const resolved = this.resolveAlias(tenantId, contactRef);
    return this.#links.filter((link) => link.tenantId === tenantId && this.resolveAlias(tenantId, link.contactRef) === resolved);
  }

  merges(tenantId: string): readonly MergeRecord[] {
    return this.#merges.filter((m) => m.tenantId === tenantId);
  }

  /** Invariante de aislamiento: ningún vínculo apunta fuera de su tenant. */
  assertTenantIntegrity(): void {
    for (const link of this.#links) {
      if (!link.tenantId) throw invalid("vínculo sin tenantId");
    }
  }
}
