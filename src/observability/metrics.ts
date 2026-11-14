import { createHash } from "node:crypto";

/**
 * Observabilidad y logs (CLI-C36).
 * Correlación por operationId sin payload sensible; centinelas de secretos y PII
 * se redactan antes de serializar. Un dashboard no rellena datos ausentes.
 */
export type MetricKind = "counter" | "histogram";

interface MetricPoint {
  name: string;
  kind: MetricKind;
  value: number;
  labels: Record<string, string>;
  at: string;
}

export class Metrics {
  readonly #points: MetricPoint[] = [];

  increment(name: string, labels: Record<string, string> = {}, value = 1): void {
    this.#points.push({ name, kind: "counter", value, labels, at: new Date().toISOString() });
  }

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    this.#points.push({ name, kind: "histogram", value, labels, at: new Date().toISOString() });
  }

  counter(name: string): number {
    return this.#points
      .filter((p) => p.name === name && p.kind === "counter")
      .reduce((total, p) => total + p.value, 0);
  }

  quantile(name: string, q: number): number | null {
    const values = this.#points
      .filter((p) => p.name === name && p.kind === "histogram")
      .map((p) => p.value)
      .sort((a, b) => a - b);
    if (values.length === 0) return null; // sin datos ≠ 0
    const index = Math.min(values.length - 1, Math.floor(q * values.length));
    return values[index] ?? null;
  }

  snapshot(): readonly MetricPoint[] {
    return [...this.#points];
  }
}

const SECRET_PATTERNS: readonly RegExp[] = [
  /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gu, // JWT
  /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]+/gu, // claves de proveedor
  /\bpostgres(?:ql)?:\/\/[^\s"']+/gu, // DSN
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gu, // email
  /\bBearer\s+[A-Za-z0-9._-]+/gu,
];

export interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  operationId: string | null;
  correlationId: string | null;
  tenantRef: string | null;
  fields: Record<string, unknown>;
  at: string;
}

export class StructuredLogger {
  readonly #entries: LogEntry[] = [];

  log(level: LogEntry["level"], message: string, context: Partial<Omit<LogEntry, "level" | "message" | "at">> = {}): LogEntry {
    const entry: LogEntry = {
      level,
      message: redactText(message),
      operationId: context.operationId ?? null,
      correlationId: context.correlationId ?? null,
      tenantRef: context.tenantRef ?? null,
      fields: redactValue(context.fields ?? {}) as Record<string, unknown>,
      at: new Date().toISOString(),
    };
    this.#entries.push(entry);
    return entry;
  }

  entries(): readonly LogEntry[] {
    return [...this.#entries];
  }

  /** Attestation para gates: cero centinelas en logs/export. */
  containsSentinels(): boolean {
    const serialized = JSON.stringify(this.#entries);
    return SECRET_PATTERNS.some((pattern) => new RegExp(pattern.source, pattern.flags).test(serialized));
  }
}

export function redactText(text: string): string {
  return SECRET_PATTERNS.reduce((acc, pattern) => acc.replace(pattern, "[redacted]"), text);
}

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        /token|secret|password|key|authorization/iu.test(key) ? "[redacted]" : redactValue(child),
      ]),
    );
  }
  return value;
}

/** Huella de correlación sin exponer el dato original. */
export function correlationFingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
