import { ServiceError, forbidden } from "../lib/errors.ts";
import { assertEgressAllowed, DEFAULT_EGRESS } from "./egress.ts";
import type { EgressPolicy } from "./egress.ts";

/**
 * Transporte HTTP acotado (CLI-C09): sin redirects, timeout, tamaño máximo de
 * respuesta y egress validado. Nunca se entrega al LLM ni se registra el cuerpo
 * completo de la respuesta remota.
 */
export interface HttpRequest {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface HttpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface HttpTransport {
  send(request: HttpRequest): Promise<HttpResponse>;
}

export class FetchTransport implements HttpTransport {
  readonly #policy: EgressPolicy;
  readonly #maxResponseBytes: number;

  constructor(options: { policy?: EgressPolicy; maxResponseBytes?: number } = {}) {
    this.#policy = options.policy ?? DEFAULT_EGRESS;
    this.#maxResponseBytes = options.maxResponseBytes ?? 2 * 1024 * 1024;
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    await assertEgressAllowed(request.url, this.#policy);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs ?? 10_000);
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "error",
        signal: controller.signal,
      });
      const text = await response.text();
      if (text.length > this.#maxResponseBytes) throw forbidden("Respuesta remota demasiado grande");
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: text,
      };
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      const message = error instanceof Error ? error.message : "error de red";
      throw new ServiceError("unavailable", `Transporte: ${message}`, { retryable: false });
    } finally {
      clearTimeout(timeout);
    }
  }
}

/** Transporte fake determinista para tests y evals: registra cada efecto. */
export class FakeTransport implements HttpTransport {
  readonly calls: HttpRequest[] = [];
  readonly #routes = new Map<string, (request: HttpRequest) => HttpResponse | Promise<HttpResponse>>();
  #failAfterCall: number | null = null;

  on(method: HttpRequest["method"], path: string, handler: (request: HttpRequest) => HttpResponse | Promise<HttpResponse>): void {
    this.#routes.set(`${method} ${path}`, handler);
  }

  /** Simula caída después de aceptar: el efecto ocurre, la respuesta se pierde. */
  failAfter(callIndex: number): void {
    this.#failAfterCall = callIndex;
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    this.calls.push(request);
    if (this.#failAfterCall !== null && this.calls.length > this.#failAfterCall) {
      throw new ServiceError("timeout", "Sin respuesta del proveedor", {
        retryable: false,
        reconciliationRequired: true,
      });
    }
    const url = new URL(request.url);
    const handler = this.#routes.get(`${request.method} ${url.pathname}`);
    if (!handler) {
      return { status: 404, headers: {}, body: JSON.stringify({ error: "not_found" }) };
    }
    return handler(request);
  }
}
