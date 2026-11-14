import type { Case, AnswerProposal, OutboundIntent, ApprovalBinding } from "../contracts/dto.ts";

/**
 * SDK servidor (CLI-C34). Rutas nominadas, sin proxy universal: el cliente solo
 * puede llamar a las operaciones declaradas aquí. Tokens fuera del navegador.
 */
export interface ClientOptions {
  baseUrl: string;
  token: () => Promise<string> | string;
  tenantId?: string;
  correlationId?: () => string;
  fetchImpl?: typeof fetch;
}

export interface ApiErrorShape {
  code: string;
  message: string;
  correlationId: string;
  retryable: boolean;
  reconciliationRequired: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly correlationId: string;
  readonly retryable: boolean;
  readonly reconciliationRequired: boolean;

  constructor(status: number, shape: ApiErrorShape) {
    super(shape.message);
    this.status = status;
    this.code = shape.code;
    this.correlationId = shape.correlationId;
    this.retryable = shape.retryable;
    this.reconciliationRequired = shape.reconciliationRequired;
  }
}

export class ClientesClient {
  readonly #options: ClientOptions;

  constructor(options: ClientOptions) {
    this.#options = options;
  }

  async me(): Promise<{ principal: { tenantId: string; capabilities: string[] }; entitlements: { entitled: boolean } }> {
    return this.#request("GET", "/v1/clientes/me");
  }

  async listCases(): Promise<{ items: { id: string; state: string }[]; denominator: number }> {
    return this.#request("GET", "/v1/clientes/cases");
  }

  async getCase(id: string): Promise<{ case: Case; sla: { dueAt: string } }> {
    return this.#request("GET", `/v1/clientes/cases/${encodeURIComponent(id)}`);
  }

  async transitionCase(
    id: string,
    body: { event: string; expectedVersion: number; assignedTo?: string | null },
  ): Promise<{ case: Case }> {
    return this.#request("POST", `/v1/clientes/cases/${encodeURIComponent(id)}/transitions`, body);
  }

  async proposeReply(
    caseId: string,
    body: { locale: "es" | "en" | "fr"; question: string; acl: string[] },
  ): Promise<{ proposal: AnswerProposal; effect: "none" }> {
    return this.#request("POST", `/v1/clientes/cases/${encodeURIComponent(caseId)}/answer-proposals`, body);
  }

  async createOutboundIntent(body: {
    caseId: string;
    proposalId: string;
    recipientRef: string;
    channel: "web" | "email" | "whatsapp" | "chatwoot";
    attachmentHashes: string[];
    expectedVersion: number;
    policyVersion: string;
  }): Promise<{ intent: OutboundIntent; approval: ApprovalBinding }> {
    return this.#request("POST", "/v1/clientes/outbound-intents", body);
  }

  async getIntent(id: string): Promise<{ intent: OutboundIntent }> {
    return this.#request("GET", `/v1/clientes/outbound-intents/${encodeURIComponent(id)}`);
  }

  async reconcileIntent(id: string, body: { remoteRef: string; delivered: boolean }): Promise<{ intent: OutboundIntent }> {
    return this.#request("POST", `/v1/clientes/outbound-intents/${encodeURIComponent(id)}/reconcile`, body);
  }

  async searchKnowledge(query: string, locale: "es" | "en" | "fr" = "es"): Promise<{
    abstained: boolean;
    citations: { articleId: string; version: number }[];
  }> {
    const params = new URLSearchParams({ q: query, locale });
    return this.#request("GET", `/v1/clientes/knowledge/search?${params.toString()}`);
  }

  async report(): Promise<{ snapshot: { hash: string; surveys: { csat: number | null } }; p50FirstResponse: number | null }> {
    return this.#request("GET", "/v1/clientes/reports");
  }

  async #request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const token = await this.#options.token();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(this.#options.tenantId ? { "x-tenant-id": this.#options.tenantId } : {}),
      ...(this.#options.correlationId ? { "x-correlation-id": this.#options.correlationId() } : {}),
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await (this.#options.fetchImpl ?? fetch)(
      `${this.#options.baseUrl.replace(/\/$/u, "")}${path}`,
      { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
    );
    const text = await response.text();
    const parsed = text.length > 0 ? (JSON.parse(text) as Record<string, unknown>) : {};
    if (!response.ok) {
      const error = parsed.error as ApiErrorShape | undefined;
      throw new ApiError(
        response.status,
        error ?? {
          code: "http_error",
          message: `HTTP ${response.status}`,
          correlationId: response.headers.get("x-correlation-id") ?? "unknown",
          retryable: false,
          reconciliationRequired: false,
        },
      );
    }
    return parsed as T;
  }
}

/** Rutas permitidas para el proxy: método + patrón exacto. */
export const ALLOWED_ROUTES: readonly { method: "GET" | "POST"; pattern: RegExp }[] = [
  { method: "GET", pattern: /^\/v1\/clientes\/me$/u },
  { method: "GET", pattern: /^\/v1\/clientes\/cases$/u },
  { method: "GET", pattern: /^\/v1\/clientes\/cases\/[A-Za-z0-9_-]{3,200}$/u },
  { method: "POST", pattern: /^\/v1\/clientes\/cases\/[A-Za-z0-9_-]{3,200}\/transitions$/u },
  { method: "POST", pattern: /^\/v1\/clientes\/cases\/[A-Za-z0-9_-]{3,200}\/answer-proposals$/u },
  { method: "POST", pattern: /^\/v1\/clientes\/outbound-previews$/u },
  { method: "POST", pattern: /^\/v1\/clientes\/outbound-intents$/u },
  { method: "GET", pattern: /^\/v1\/clientes\/outbound-intents\/[A-Za-z0-9_-]{3,200}$/u },
  { method: "POST", pattern: /^\/v1\/clientes\/outbound-intents\/[A-Za-z0-9_-]{3,200}\/reconcile$/u },
  { method: "GET", pattern: /^\/v1\/clientes\/knowledge\/search$/u },
  { method: "GET", pattern: /^\/v1\/clientes\/reports$/u },
  { method: "GET", pattern: /^\/v1\/clientes\/jobs\/[A-Za-z0-9_-]{3,200}$/u },
];

export function isAllowedRoute(method: string, path: string): boolean {
  return ALLOWED_ROUTES.some((route) => route.method === method && route.pattern.test(path));
}
