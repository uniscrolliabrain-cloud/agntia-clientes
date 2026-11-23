import { z } from "zod";
import { ServiceError, conflict, forbidden, notConfigured } from "../lib/errors.ts";
import { hashCanonical } from "../lib/ids.ts";
import {
  projectToNative,
  type DomainEvent,
  type HostPort,
  type NativeSystemEvent,
} from "./host.ts";

/**
 * CLI-C35 · Cliente real del puerto `HostPort` sobre HTTP.
 *
 * Qué es y qué no es:
 * - Es el lado **cliente** del contrato que el padre (`/agente`) debe exponer.
 *   Aquí no se toca `/agente`: no hay wiring, ni claims, ni enums nuevos allí.
 * - Sin `baseUrl` y token de servicio falla cerrado (`not_configured`); nunca
 *   cae a un host por defecto ni a un tenant por defecto.
 * - El token es de servicio y se inyecta en runtime (Doppler/SecretStore). No
 *   se escribe en logs, ni en URLs, ni en el cuerpo de la petición.
 * - El `tenantId` que devuelve el padre se acepta solo si es una cadena; la
 *   autorización de ese tenant la decide el padre y el llamador debe cruzarla
 *   con su propio principal. Este cliente no eleva roles.
 */

export interface HostTransportRequest {
  method: "GET" | "POST";
  url: string;
  headers: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface HostTransportResponse {
  status: number;
  body: string;
}

export interface HostTransport {
  send(request: HostTransportRequest): Promise<HostTransportResponse>;
}

/** Transporte por defecto: sin redirects y con timeout. La URL es de operador. */
export class FetchHostTransport implements HostTransport {
  async send(request: HostTransportRequest): Promise<HostTransportResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? 10_000);
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        redirect: "error",
        signal: controller.signal,
        ...(request.body !== undefined ? { body: request.body } : {}),
      });
      const body = await response.text();
      return { status: response.status, body };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export interface HttpHostOptions {
  baseUrl: string | null;
  serviceToken: string | null;
  transport?: HostTransport;
  timeoutMs?: number;
}

const PrincipalResponse = z
  .object({ actorId: z.string().min(1).max(200), tenantId: z.string().min(1).max(200) })
  .strict();
const ApprovalResponse = z.object({ approvalRef: z.string().min(1).max(300) }).strict();
const TaskResponse = z.object({ taskId: z.string().min(1).max(300) }).strict();
const EventResponse = z.object({ accepted: z.boolean() }).strict();

export class HttpHost implements HostPort {
  readonly #baseUrl: string | null;
  readonly #token: string | null;
  readonly #transport: HostTransport;
  readonly #timeoutMs: number;

  constructor(options: HttpHostOptions) {
    this.#baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/u, "") : null;
    this.#token = options.serviceToken;
    this.#transport = options.transport ?? new FetchHostTransport();
    this.#timeoutMs = options.timeoutMs ?? 10_000;
  }

  get configured(): boolean {
    return Boolean(this.#baseUrl && this.#token);
  }

  async verifyPrincipal(subjectRef: string): Promise<{ actorId: string; tenantId: string } | null> {
    const raw = await this.#post("/internal/host/principal", { subjectRef }, { allowNotFound: true });
    if (raw === null) return null;
    const parsed = PrincipalResponse.safeParse(raw);
    return parsed.success ? parsed.data : null;
  }

  async requestApproval(input: { proposalRef: string; payloadHash: string }): Promise<{ approvalRef: string } | null> {
    const raw = await this.#post("/internal/host/approvals", input, { allowNotFound: true });
    if (raw === null) return null;
    const parsed = ApprovalResponse.safeParse(raw);
    return parsed.success ? parsed.data : null;
  }

  async recordTask(input: {
    assignedBy: string;
    assignedTo: string;
    evidenceRefs: string[];
  }): Promise<{ taskId: string }> {
    const parsed = TaskResponse.safeParse(await this.#post("/internal/host/tasks", input));
    // El puerto exige una tarea: una respuesta sin id no se acepta como éxito.
    if (!parsed.success) throw new ServiceError("upstream_invalid", "El padre no devolvió taskId");
    return parsed.data;
  }

  /**
   * Publica un hecho proyectable. Devuelve `null` si el mapping conservador no
   * tiene equivalente nativo: no se inventa un tipo de evento para "llegar".
   */
  async publish(
    event: DomainEvent,
    options: { ownerRef: string; sourceId: string; personaId?: string },
  ): Promise<{ event: NativeSystemEvent; accepted: boolean } | null> {
    const native = projectToNative(event, options);
    if (!native) return null;
    const response = EventResponse.parse(await this.#post("/internal/host/events", { event: native }));
    return { event: native, accepted: response.accepted };
  }

  async #post(
    path: string,
    payload: unknown,
    options: { allowNotFound?: boolean } = {},
  ): Promise<unknown | null> {
    if (!this.#baseUrl || !this.#token) {
      throw notConfigured("Puente del padre sin AGENTE_BASE_URL o token de servicio");
    }
    const body = JSON.stringify(payload);
    let response: HostTransportResponse;
    try {
      response = await this.#transport.send({
        method: "POST",
        url: `${this.#baseUrl}${path}`,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.#token}`,
          "idempotency-key": hashCanonical(payload).slice(0, 64),
        },
        body,
        timeoutMs: this.#timeoutMs,
      });
    } catch {
      // El mensaje del transporte puede contener la URL interna: no se propaga.
      throw new ServiceError("unavailable", "Puente del padre inaccesible");
    }
    if (response.status === 401 || response.status === 403) {
      throw forbidden("El padre rechazó el token de servicio");
    }
    if (response.status === 409) throw conflict("El padre devolvió conflicto de idempotencia");
    if (response.status === 404 && options.allowNotFound) return null;
    if (response.status < 200 || response.status >= 300) {
      throw new ServiceError("unavailable", `El padre respondió ${response.status}`);
    }
    try {
      return JSON.parse(response.body) as unknown;
    } catch {
      throw new ServiceError("upstream_invalid", "El padre devolvió JSON inválido");
    }
  }
}
