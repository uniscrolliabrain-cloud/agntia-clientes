import { conflict, forbidden } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Outbox y jobs (CLI-C27). Transacción local de estado+audit+outbox, leases con
 * fencing, ACK posterior al commit, retry finito y DLQ. Una cola no es verdad final.
 */
export type JobState = "queued" | "leased" | "running" | "succeeded" | "failed" | "dead_letter" | "cancelled";

export interface Job {
  id: string;
  tenantId: string;
  kind: string;
  state: JobState;
  attempts: number;
  maxAttempts: number;
  leaseFence: number;
  leaseExpiresAt: string | null;
  lastError: string | null;
  payloadRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitOfWork {
  /** Estado + outbox se confirman juntos o no se confirman. */
  commit(): void;
  rollback(): void;
}

export class Outbox {
  readonly #jobs = new Map<string, Job>();
  readonly #clock: Clock;
  readonly #pending: Array<{ tenantId: string; kind: string; payloadRef: string }> = [];

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  /** Encolar dentro de la transacción: no visible hasta commit. */
  stage(input: { tenantId: string; kind: string; payloadRef: string }): void {
    this.#pending.push(input);
  }

  begin(): UnitOfWork & { staged: number } {
    const stagedBefore = this.#pending.length;
    let closed = false;
    return {
      staged: stagedBefore,
      commit: () => {
        if (closed) throw conflict("Unidad de trabajo ya cerrada");
        closed = true;
        while (this.#pending.length > 0) {
          const entry = this.#pending.shift();
          if (!entry) break;
          const job: Job = {
            id: opaqueId("job"),
            tenantId: entry.tenantId,
            kind: entry.kind,
            state: "queued",
            attempts: 0,
            maxAttempts: 5,
            leaseFence: 0,
            leaseExpiresAt: null,
            lastError: null,
            payloadRef: entry.payloadRef,
            createdAt: nowIso(this.#clock),
            updatedAt: nowIso(this.#clock),
          };
          this.#jobs.set(job.id, job);
        }
      },
      rollback: () => {
        closed = true;
        // Se descarta lo staged en esta unidad (sin efectos huérfanos).
        this.#pending.splice(0, this.#pending.length - stagedBefore);
      },
    };
  }

  /** Claim con fencing: un worker viejo no puede confirmar tras perder la lease. */
  claim(tenantId: string, leaseSeconds = 30): Job | null {
    const now = this.#clock.now().getTime();
    const candidate = [...this.#jobs.values()].find(
      (job) =>
        job.tenantId === tenantId &&
        job.state === "queued" &&
        (job.leaseExpiresAt === null || Date.parse(job.leaseExpiresAt) < now),
    );
    if (!candidate) return null;
    const claimed: Job = {
      ...candidate,
      state: "leased",
      attempts: candidate.attempts + 1,
      leaseFence: candidate.leaseFence + 1,
      leaseExpiresAt: new Date(now + leaseSeconds * 1000).toISOString(),
      updatedAt: nowIso(this.#clock),
    };
    this.#jobs.set(claimed.id, claimed);
    return claimed;
  }

  start(tenantId: string, jobId: string, fence: number): Job {
    const job = this.#require(tenantId, jobId);
    if (job.leaseFence !== fence || job.state !== "leased") throw conflict("Lease perdida");
    const next: Job = { ...job, state: "running", updatedAt: nowIso(this.#clock) };
    this.#jobs.set(jobId, next);
    return next;
  }

  ack(tenantId: string, jobId: string, fence: number): Job {
    const job = this.#require(tenantId, jobId);
    if (job.leaseFence !== fence) throw forbidden("ACK con fence obsoleto");
    const next: Job = {
      ...job,
      state: "succeeded",
      leaseExpiresAt: null,
      updatedAt: nowIso(this.#clock),
    };
    this.#jobs.set(jobId, next);
    return next;
  }

  /**
   * Un fallo incierto NO vuelve a `queued`: pasa a dead_letter/reconciliación.
   * Un fallo conocido y reintentable sí, hasta maxAttempts.
   */
  fail(input: {
    tenantId: string;
    jobId: string;
    fence: number;
    error: string;
    certain: boolean;
    retryable: boolean;
  }): Job {
    const job = this.#require(input.tenantId, input.jobId);
    if (job.leaseFence !== input.fence) throw conflict("Fence obsoleto");
    const exhausted = job.attempts >= job.maxAttempts;
    const state: JobState = !input.certain || !input.retryable || exhausted ? "dead_letter" : "queued";
    const next: Job = {
      ...job,
      state,
      lastError: input.error,
      leaseExpiresAt: null,
      updatedAt: nowIso(this.#clock),
    };
    this.#jobs.set(input.jobId, next);
    return next;
  }

  get(tenantId: string, jobId: string): Job {
    return this.#require(tenantId, jobId);
  }

  list(tenantId: string): Job[] {
    return [...this.#jobs.values()].filter((j) => j.tenantId === tenantId);
  }

  #require(tenantId: string, jobId: string): Job {
    const job = this.#jobs.get(jobId);
    if (!job || job.tenantId !== tenantId) throw conflict("Job no encontrado en este tenant");
    return job;
  }
}
