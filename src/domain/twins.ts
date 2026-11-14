import { forbidden, conflict } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import { IsoDateTime } from "../contracts/common.ts";
import { z } from "zod";
import { strictObject, TenantId } from "../contracts/common.ts";

/**
 * Twin vinculado (CLI-C04). Identidades nativas del padre preservadas:
 * persona ≠ rol ≠ runtime, y el twin no se autoautoriza ni comparte memoria.
 */
export const TwinBinding = strictObject({
  id: z.string().min(3).max(200),
  tenantId: TenantId,
  canonicalActorId: z.string().min(1).max(200),
  canonicalRoleId: z.string().min(1).max(120),
  canonicalRuntimeId: z.string().min(1).max(120),
  canonicalPersonaId: z.string().max(120).nullable(),
  canonicalRevision: z.string().min(1).max(120),
  mandateId: z.string().min(3).max(200),
  capabilities: z.array(z.string().min(1).max(120)),
  budgetRef: z.string().min(1).max(200),
  validFrom: IsoDateTime,
  validTo: IsoDateTime,
  revoked: z.boolean(),
});

export type TwinBindingValue = z.infer<typeof TwinBinding>;

export class TwinRegistry {
  readonly #bindings = new Map<string, TwinBindingValue>();
  readonly #memories = new Map<string, Map<string, string>>();

  register(binding: TwinBindingValue): TwinBindingValue {
    this.#bindings.set(binding.id, binding);
    return binding;
  }

  require(tenantId: string, bindingId: string, capability: string): TwinBindingValue {
    const binding = this.#bindings.get(bindingId);
    // Un binding de otro tenant se comporta como inexistente.
    if (!binding || binding.tenantId !== tenantId) throw forbidden("TwinBinding no válido");
    if (binding.revoked) throw forbidden("TwinBinding revocado");
    if (Date.parse(binding.validTo) <= Date.now()) throw forbidden("TwinBinding caducado");
    if (!binding.capabilities.includes(capability)) throw forbidden("Capacidad fuera del binding");
    return binding;
  }

  /** Memoria scoped por binding: nunca se comparte entre clientes/tenants. */
  remember(bindingId: string, key: string, value: string): void {
    const scoped = this.#bindings.get(bindingId);
    if (!scoped) throw forbidden("TwinBinding no válido");
    const memoryKey = `${scoped.id}:${scoped.canonicalRevision}:${key}`;
    const bucket = this.#memories.get(bindingId) ?? new Map<string, string>();
    bucket.set(memoryKey, value);
    this.#memories.set(bindingId, bucket);
  }

  recall(bindingId: string, key: string): string | null {
    return this.#memories.get(bindingId)?.get(`${bindingId}:${key}`) ?? null;
  }

  createBinding(input: Omit<TwinBindingValue, "id">): TwinBindingValue {
    const binding: TwinBindingValue = { ...input, id: opaqueId("twin") };
    return this.register(binding);
  }

  revoke(bindingId: string): void {
    const binding = this.#bindings.get(bindingId);
    if (!binding) throw conflict("TwinBinding inexistente");
    this.#bindings.set(bindingId, { ...binding, revoked: true });
  }
}
