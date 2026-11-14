# Arquitectura, autoridad y mapeo nativo

Consolida `docs/domain-model.md`, `docs/authority-map.md` y `docs/native-mapping.md`.

## Cuatro niveles (implementados como tipos y como tests)

1. **Organización operadora** (`tenant_operator_p`): presta el servicio y aloja los agentes
   canónicos en `/agente`.
2. **Tenant cliente** (`tenant_alpha`, `tenant_beta`): frontera de seguridad, contrato, datos,
   membresías y presupuesto. Todo registro lleva `tenantId`.
3. **CustomerOrganization / Contact**: empresas y personas atendidas dentro del tenant. No son
   tenants y no generan membresía.
4. **Principal**: humano (`kind: "human"`), agente (`"agent"`) o contacto de portal
   (`"contact"`), con capacidades y scopes de recurso.

## AuthorityMap implementado

`src/domain/authority.ts` declara autoridad por campo con `conflictPolicy`. Escribir desde una
fuente no autorizada **no muta** el dato: registra un `ConflictRecord` y lanza 409.

| Campo | Autoridad | Política |
|---|---|---|
| `contact.displayName`, `contact.email` | `service_middleware` | review |
| `organization.legalName` | `crm_backend` | block_overwrite |
| `case.state` | `helpdesk_backend` | block_overwrite |
| `consent.marketing` | `consent_ledger` | keep_authority |
| `message.deliveryState` | `channel_provider` | block_overwrite |

Un solo motor de SLA/estado por caso: el servicio calcula plazos con política versionada; un
helpdesk elegido puede ser autoridad de estado, nunca ambos a la vez.

## TwinBinding

`src/domain/twins.ts` conserva las identidades nativas separadas:

```ts
{
  canonicalActorId, canonicalRoleId, canonicalRuntimeId, canonicalPersonaId?,
  canonicalRevision, mandateId, capabilities, budgetRef, validFrom, validTo, revoked
}
```

Reglas verificadas: binding de otro tenant no se resuelve; revocado o caducado bloquea
propuestas; `remember`/`recall` están scoped por binding y revisión, de modo que un twin no
hereda memoria de otro cliente.

## Delegación

`DelegationMandate` con `originatingTenantId` ≠ `targetTenantId`, capacidades, `resourceScope`,
`fieldScope`, `costCeiling`, caducidad, `revocationVersion` y firma HMAC.

`MandateVerifier.verify` comprueba: actor emisor, tenant origen, tenant objetivo, capacidad,
recurso, caducidad, revocación y firma (calculada **sin** el propio campo de firma). No hay
redelegación ampliada ni membership implícita.

## Mapeo nativo con el padre (sin tocarlo)

| Concepto del servicio | Nativo del padre | Nota |
|---|---|---|
| `Actor` humano | `Actor` (`sub`, `tenantId`, `roleId`, `runtimeId`, `personaId`, `kernelTurnId`) | mismos nombres, sin colapsar |
| Procedencia de dato | `{source, actor, updatedAt, confidence?}` | se conserva y se amplía con hash/revisión |
| Evento de dominio `clientes.*` | `SystemEvent` con `schemaVersion: "1.0"` | proyección conservadora |
| Tarea delegada | `assignedBy` / `assignedTo` | no se sustituyen IDs |

Proyección implementada (`src/bridge/host.ts`):

- `clientes.case.changed` + `assignedTo` → `ticket.assigned`
- `clientes.case.changed` + `verifiedResolution=true` → `ticket.resolved`
- `clientes.handoff.required` → `ticket.escalated`
- `clientes.message.delivered` → **null** (entregar no cierra conversación)
- Cualquier otro evento `clientes.*` → **null** (no se inventan enums)

`HostEventInbox` deduplica por `tenantId + id` y valida `schemaVersion === "1.0"` y
`source.kind` permitido. `HOST_BRIDGE_STATUS = "HOST_BRIDGE_NOT_VERIFIED"`.

## Flujo de atención implementado

`src/app/http.ts` + `src/jobs/worker.ts`:

1. JWT verificado y `resolveActor` (membresía + tenant + capacidades).
2. Caso leído con scope de tenant y ACL de recurso.
3. `proposeReply` recupera conocimiento autorizado y genera borrador con citas.
4. Preview puro (`/outbound-previews`): efecto `none`.
5. `buildApproval` con hash del payload, destinatario, canal y adjuntos.
6. `DispatchWorker.dispatch` revalida handoff, aprobación, supresión/consentimiento y presupuesto
   antes de cualquier efecto.
7. Proveedor → `accepted` (con receipt) o `outcome_unknown` bloqueado para reconciliación.
8. El caso **no** pasa a `resolved` por enviar: exige `ResolutionEvidence` satisfecha.
