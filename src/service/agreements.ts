import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import { Money } from "../contracts/common.ts";
import { z } from "zod";
import { strictObject, IsoDateTime, OpaqueRef, TenantId } from "../contracts/common.ts";

/**
 * Acuerdos, entitlements y encargos (CLI-C08).
 * Contrato comercial ≠ aprobación editorial ≠ permiso de datos.
 */
export const ServiceAgreement = strictObject({
  id: OpaqueRef,
  operatorOrgRef: OpaqueRef,
  tenantId: TenantId,
  authorizedContacts: z.array(OpaqueRef),
  services: z.array(z.string().min(1).max(120)),
  humanHours: z.object({ timeZone: z.string(), startHour: z.number(), endHour: z.number() }).strict(),
  slaPolicyId: z.string().min(1).max(120),
  budget: Money,
  dataProcessingRef: z.string().min(1).max(200),
  subprocessors: z.array(z.string().max(200)),
  retentionPolicyRef: z.string().min(1).max(200),
  exitProcedureRef: z.string().min(1).max(200),
  validFrom: IsoDateTime,
  validTo: IsoDateTime.nullable(),
});

export type ServiceAgreement = z.infer<typeof ServiceAgreement>;

export const WorkOrder = strictObject({
  id: OpaqueRef,
  tenantId: TenantId,
  serviceAgreementId: OpaqueRef,
  scope: z.string().min(1).max(1000),
  dataSources: z.array(z.string().max(200)),
  deliverable: z.string().min(1).max(500),
  effectOwner: z.enum(["middleware", "crm_backend", "helpdesk_backend", "channel_provider", "human"]),
  acceptedBy: OpaqueRef.nullable(),
  authorizedSpend: Money,
  status: z.enum(["draft", "active", "delivered", "accepted", "cancelled"]),
});

export type WorkOrder = z.infer<typeof WorkOrder>;

export class AgreementRegistry {
  readonly #agreements = new Map<string, ServiceAgreement>();
  readonly #orders = new Map<string, WorkOrder>();

  registerAgreement(agreement: ServiceAgreement): ServiceAgreement {
    this.#agreements.set(agreement.id, agreement);
    return agreement;
  }

  requireAgreement(tenantId: string): ServiceAgreement {
    const found = [...this.#agreements.values()].find(
      (a) => a.tenantId === tenantId && (!a.validTo || Date.parse(a.validTo) > Date.now()),
    );
    if (!found) throw forbidden("Tenant sin ServiceAgreement vigente");
    return found;
  }

  entitlement(tenantId: string, service: string): { entitled: boolean; reason: string } {
    const agreement = this.requireAgreement(tenantId);
    if (!agreement.services.includes(service)) {
      return { entitled: false, reason: "not_contracted" };
    }
    return { entitled: true, reason: "contracted" };
  }

  createOrder(input: Omit<WorkOrder, "id">): WorkOrder {
    const agreement = this.#agreements.get(input.serviceAgreementId);
    if (!agreement || agreement.tenantId !== input.tenantId) {
      throw forbidden("WorkOrder sin acuerdo del mismo tenant");
    }
    if (agreement.services.length === 0) throw invalid("Acuerdo sin servicios");
    const order: WorkOrder = { ...input, id: opaqueId("wo") };
    this.#orders.set(order.id, order);
    return order;
  }

  acceptOrder(orderId: string, tenantId: string, acceptedBy: string): WorkOrder {
    const order = this.#orders.get(orderId);
    if (!order || order.tenantId !== tenantId) throw forbidden("WorkOrder no encontrado");
    if (order.status !== "delivered") throw conflict("Solo un entregable entregado se acepta");
    const accepted: WorkOrder = { ...order, status: "accepted", acceptedBy };
    this.#orders.set(orderId, accepted);
    return accepted;
  }
}
