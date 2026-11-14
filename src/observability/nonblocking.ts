import type { Metrics } from "./metrics.ts";

/**
 * Fallo de observabilidad no bloquea servicio (docs/factory/03 · negativos).
 * Envoltorio tolerante: si el sumidero lanza, la operación sigue y se cuentan
 * los fallos para alertar por separado.
 */
export interface MetricSinkLike {
  increment(name: string, labels?: Record<string, string>, value?: number): void;
  observe(name: string, value: number, labels?: Record<string, string>): void;
}

export class NonBlockingMetrics {
  readonly #sink: MetricSinkLike | Metrics;
  #failures = 0;

  constructor(sink: MetricSinkLike | Metrics) {
    this.#sink = sink;
  }

  increment(name: string, labels: Record<string, string> = {}, value = 1): void {
    try {
      this.#sink.increment(name, labels, value);
    } catch {
      this.#failures += 1;
    }
  }

  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    try {
      this.#sink.observe(name, value, labels);
    } catch {
      this.#failures += 1;
    }
  }

  failureCount(): number {
    return this.#failures;
  }

  /** Trabajo accesorio (logs, evidencia, métricas) nunca tumba la operación. */
  static guard<Value>(work: () => Value, fallback: Value): Value {
    try {
      return work();
    } catch {
      return fallback;
    }
  }
}
