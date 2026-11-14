import { forbidden, unsupported } from "../lib/errors.ts";
import { sha256Hex } from "../lib/ids.ts";
import type { HttpTransport } from "../integrations/transport.ts";
import type { DiscoveryService } from "../integrations/discovery.ts";

/**
 * CRM/helpdesk alternativos (CLI-C15/C16/C17): Twenty, Frappe, Zammad.
 * Esqueleto schema-driven: sin descubrimiento previo no hay lectura ni escritura.
 * No se instala ninguno por defecto ni se duplica el motor de casos.
 */
export type CrmKind = "twenty" | "frappe" | "zammad";

export interface CrmBinding {
  tenantId: string;
  connectionId: string;
  kind: CrmKind;
  baseUrl: string;
  workspaceOrSiteRef: string;
  tokenRef: string;
  fieldMapping: Readonly<Record<string, string>>;
}

export interface CrmContact {
  externalId: string;
  displayName: string;
  email: string | null;
  companyExternalId: string | null;
  remoteVersion: string;
}

export class CrmAdapter {
  readonly #transport: HttpTransport;
  readonly #discovery: DiscoveryService;
  readonly #binding: CrmBinding;
  readonly #token: () => Promise<string>;

  constructor(input: {
    transport: HttpTransport;
    discovery: DiscoveryService;
    binding: CrmBinding;
    token: () => Promise<string>;
  }) {
    this.#transport = input.transport;
    this.#discovery = input.discovery;
    this.#binding = input.binding;
    this.#token = input.token;
  }

  async listContacts(limit = 25): Promise<CrmContact[]> {
    this.#discovery.requireCapability(
      this.#binding.tenantId,
      this.#binding.connectionId,
      "contact.read",
    );
    const path = this.#contactsPath(limit);
    const response = await this.#transport.send({
      method: "GET",
      url: `${this.#binding.baseUrl}${path}`,
      headers: { Authorization: `Bearer ${await this.#token()}`, Accept: "application/json" },
    });
    if (response.status === 401 || response.status === 403) {
      throw forbidden("CRM: permiso insuficiente");
    }
    if (response.status !== 200) throw unsupported(`CRM list: HTTP ${response.status}`);
    return this.#parseContacts(response.body);
  }

  /**
   * Escritura: exige aprobación, descubrimiento verificado y expectedRemoteVersion.
   * Nunca upsert por nombre ni mutación de metadata.
   */
  async updateContact(input: {
    externalId: string;
    expectedRemoteVersion: string;
    fields: Readonly<Record<string, string>>;
    approvalRef: string;
  }): Promise<{ externalId: string; sourceHash: string }> {
    if (!input.approvalRef) throw forbidden("Escritura CRM sin aprobación");
    this.#discovery.requireCapability(
      this.#binding.tenantId,
      this.#binding.connectionId,
      "contact.write",
    );
    for (const field of Object.keys(input.fields)) {
      if (!this.#binding.fieldMapping[field]) {
        throw unsupported(`Campo ${field} sin mapping confirmado en este workspace`);
      }
    }
    const response = await this.#transport.send({
      method: "PATCH",
      url: `${this.#binding.baseUrl}${this.#contactPath(input.externalId)}`,
      headers: {
        Authorization: `Bearer ${await this.#token()}`,
        "Content-Type": "application/json",
        "If-Match": input.expectedRemoteVersion,
      },
      body: JSON.stringify({
        expectedVersion: input.expectedRemoteVersion,
        fields: input.fields,
      }),
    });
    if (response.status === 412) throw forbidden("Versión remota cambiada: conflicto");
    if (response.status === 404) throw forbidden("Contacto remoto no encontrado");
    if (response.status !== 200) throw unsupported(`CRM write: HTTP ${response.status}`);
    return { externalId: input.externalId, sourceHash: sha256Hex(response.body) };
  }

  #contactsPath(limit: number): string {
    switch (this.#binding.kind) {
      case "twenty":
        return `/rest/people?limit=${limit}`;
      case "frappe":
        return `/api/resource/Contact?limit_page_length=${limit}`;
      case "zammad":
        return `/api/v1/users?limit=${limit}`;
    }
  }

  #contactPath(externalId: string): string {
    switch (this.#binding.kind) {
      case "twenty":
        return `/rest/people/${encodeURIComponent(externalId)}`;
      case "frappe":
        return `/api/resource/Contact/${encodeURIComponent(externalId)}`;
      case "zammad":
        return `/api/v1/users/${encodeURIComponent(externalId)}`;
    }
  }

  #parseContacts(body: string): CrmContact[] {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const rows = this.#binding.kind === "frappe" ? parsed.data : parsed.data ?? parsed;
    if (!Array.isArray(rows)) throw unsupported("Esquema remoto no reconocido");
    return rows.map((raw) => {
      const row = raw as Record<string, unknown>;
      return {
        externalId: String(row.id ?? row.name ?? ""),
        displayName: String(row.name ?? row.full_name ?? row.display_name ?? ""),
        email: typeof row.email === "string" ? row.email : null,
        companyExternalId:
          row.companyId !== undefined ? String(row.companyId) : row.company !== undefined ? String(row.company) : null,
        remoteVersion: String(row.updatedAt ?? row.modified ?? row.updated_at ?? ""),
      };
    });
  }
}

/** Zammad: los grupos no son aislamiento fuerte por sí solos (CLI-C17). */
export function assertZammadIsolation(mode: "shared" | "instance_per_tenant"): void {
  if (mode === "shared") {
    throw forbidden("Zammad compartido requiere prueba de aislamiento; usar instancia por tenant");
  }
}
