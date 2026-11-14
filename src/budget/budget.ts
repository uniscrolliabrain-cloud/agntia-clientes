import { conflict, forbidden, invalid } from "../lib/errors.ts";
import type { Clock } from "../lib/time.ts";
import { systemClock } from "../lib/time.ts";

/**
 * Presupuesto, cuotas y backpressure (CLI-C37).
 * Reserva antes de gastar, consumo observado, liberación y reconciliación.
 * Rate limit ≠ budget. Las bolsas Lite/L/XL son hipótesis, no precios contratados.
 */
export interface Reservation {
  id: string;
  tenantId: string;
  operationKey: string;
  amount: string;
  currency: string;
  state: "reserved" | "consumed" | "released";
  createdAt: string;
}

export interface TenantQuota {
  tenantId: string;
  monthlyCeilingEur: number;
  avMinutesPerMonth: number;
  channelMessagesPerHour: number;
}

export class BudgetLedger {
  readonly #reservations = new Map<string, Reservation>();
  readonly #quota = new Map<string, TenantQuota>();
  readonly #consumed = new Map<string, number>();
  readonly #clock: Clock;

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  setQuota(quota: TenantQuota): void {
    this.#quota.set(quota.tenantId, quota);
  }

  /** Reserva atómica por operationKey: dos workers no gastan el mismo saldo. */
  reserve(input: { tenantId: string; operationKey: string; amount: string; currency: string }): Reservation {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw invalid("Importe inválido");
    const key = `${input.tenantId}:${input.operationKey}`;
    const existing = this.#reservations.get(key);
    if (existing) {
      if (existing.amount !== input.amount || existing.currency !== input.currency) {
        throw conflict("operationKey reutilizada con otro importe");
      }
      return existing;
    }
    const quota = this.#quota.get(input.tenantId);
    if (quota) {
      const consumed = this.#consumed.get(input.tenantId) ?? 0;
      if (consumed + amount > quota.monthlyCeilingEur) {
        // Se conserva lectura/estado; se bloquea el gasto, no la seguridad.
        throw conflict("Presupuesto del tenant agotado: función optativa deshabilitada");
      }
    }
    const reservation: Reservation = {
      id: `bud_${input.operationKey.slice(0, 24)}`,
      tenantId: input.tenantId,
      operationKey: input.operationKey,
      amount: input.amount,
      currency: input.currency,
      state: "reserved",
      createdAt: this.#clock.now().toISOString(),
    };
    this.#reservations.set(key, reservation);
    return reservation;
  }

  consume(tenantId: string, operationKey: string, actualAmount?: string): Reservation {
    const reservation = this.#require(tenantId, operationKey);
    if (reservation.state !== "reserved") throw conflict("Reserva no consumible");
    const amount = actualAmount ?? reservation.amount;
    const next: Reservation = { ...reservation, state: "consumed", amount };
    this.#reservations.set(`${tenantId}:${operationKey}`, next);
    this.#consumed.set(tenantId, (this.#consumed.get(tenantId) ?? 0) + Number(amount));
    return next;
  }

  release(tenantId: string, operationKey: string): Reservation {
    const reservation = this.#require(tenantId, operationKey);
    const next: Reservation = { ...reservation, state: "released" };
    this.#reservations.set(`${tenantId}:${operationKey}`, next);
    return next;
  }

  spent(tenantId: string): number {
    return this.#consumed.get(tenantId) ?? 0;
  }

  #require(tenantId: string, operationKey: string): Reservation {
    const found = this.#reservations.get(`${tenantId}:${operationKey}`);
    if (!found) throw forbidden("Reserva inexistente");
    return found;
  }
}

/** Rate limit por sujeto, separado del presupuesto (C37). */
export class RateLimiter {
  readonly #buckets = new Map<string, { tokens: number; updatedAt: number }>();
  readonly #capacity: number;
  readonly #refillPerSecond: number;

  constructor(options: { capacity: number; refillPerSecond: number }) {
    this.#capacity = options.capacity;
    this.#refillPerSecond = options.refillPerSecond;
  }

  take(key: string, now = Date.now()): boolean {
    const bucket = this.#buckets.get(key) ?? { tokens: this.#capacity, updatedAt: now };
    const elapsed = Math.max(0, now - bucket.updatedAt) / 1000;
    const tokens = Math.min(this.#capacity, bucket.tokens + elapsed * this.#refillPerSecond);
    if (tokens < 1) {
      this.#buckets.set(key, { tokens, updatedAt: now });
      return false;
    }
    this.#buckets.set(key, { tokens: tokens - 1, updatedAt: now });
    return true;
  }
}
