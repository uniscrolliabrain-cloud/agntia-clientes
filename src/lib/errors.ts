/**
 * Errores de servicio (CLI-C05 / contrato de API).
 * Nunca exponen metadatos de otro tenant: 404 para recurso ajeno o inexistente.
 */
export type ErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation_failed"
  | "dependency_unavailable"
  | "capability_unsupported"
  | "rate_limited"
  | "upstream_invalid"
  | "unavailable"
  | "timeout"
  | "not_configured";

const STATUS: Record<ErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  validation_failed: 422,
  dependency_unavailable: 424,
  capability_unsupported: 424,
  rate_limited: 429,
  upstream_invalid: 502,
  unavailable: 503,
  timeout: 504,
  not_configured: 503,
};

export interface ServiceErrorOptions {
  /** Retryable solo para lecturas o escrituras cuyo estado remoto es conocido. */
  retryable?: boolean;
  reconciliationRequired?: boolean;
  details?: Record<string, unknown>;
}

export class ServiceError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly retryable: boolean;
  readonly reconciliationRequired: boolean;
  readonly details: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, options: ServiceErrorOptions = {}) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = STATUS[code];
    this.retryable = options.retryable ?? false;
    this.reconciliationRequired = options.reconciliationRequired ?? false;
    this.details = options.details ?? {};
  }

  toEnvelope(correlationId: string) {
    return {
      error: {
        code: this.code,
        message: this.message,
        correlationId,
        retryable: this.retryable,
        reconciliationRequired: this.reconciliationRequired,
      },
    };
  }
}

export const unauthorized = (message = "Identidad no verificada") =>
  new ServiceError("unauthorized", message);

export const forbidden = (message = "Capacidad no autorizada") =>
  new ServiceError("forbidden", message);

export const notFound = (message = "Recurso no encontrado") =>
  new ServiceError("not_found", message);

export const conflict = (message = "Conflicto de versión o idempotencia") =>
  new ServiceError("conflict", message);

export const invalid = (message = "Payload inválido", details?: Record<string, unknown>) =>
  new ServiceError("validation_failed", message, { details });

export const unsupported = (message = "Capacidad no soportada por el proveedor") =>
  new ServiceError("capability_unsupported", message);

export const notConfigured = (message = "Integración no configurada") =>
  new ServiceError("not_configured", message);

export function toServiceError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;
  if (error instanceof Error) {
    return new ServiceError("unavailable", error.message);
  }
  return new ServiceError("unavailable", "Error no clasificado");
}
