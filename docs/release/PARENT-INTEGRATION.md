# Propuesta de integración con `agente` (padre)

Documento de **propuesta**. No se ha modificado `/agente`, ni sus contratos, ni su bus.
Estado del bridge: `HOST_BRIDGE_NOT_VERIFIED`.

## Qué expone este servicio

- HTTP nominal bajo `/v1/clientes/*` (casos, propuestas, aprobaciones, intents, handoffs,
  conocimiento, reportes, sesiones de asesor). Sin proxy genérico.
- SDK TypeScript con rutas nominadas (`src/sdk/client.ts`) y 8 tools de agente
  (`src/tools/agent-tools.ts`): ninguna permite aprobar, enviar, reembolsar ni exportar todo.
- Contratos de salida: `Envelope` v1 y `OperationResult` discriminado
  (`ok | preview | accepted_async | outcome_unknown | error`).
- ADTC v0.1 para trazabilidad (`src/contracts/adtc.ts`), con `traceparent` W3C y refs sin PII.

## Contrato con el padre (ya definido, no conectado)

`src/bridge/host.ts` declara el puerto que el padre debe implementar:

| Operación | Uso |
|---|---|
| `verifyPrincipal(subjectRef)` | Resolver `actorId`/`tenantId` del principal verificado |
| `requestApproval({proposalRef, payloadHash})` | Pedir aprobación vinculada al hash exacto |
| `recordTask({assignedBy, assignedTo, evidenceRefs})` | Registrar tarea con evidencia |

Proyección de eventos: solo tres equivalencias inequívocas —
`clientes.handoff.required → ticket.escalated`,
`clientes.case.changed + assignedTo → ticket.assigned`,
`clientes.case.changed + verifiedResolution=true → ticket.resolved`.

Deliberadamente **no** se proyecta `clientes.message.delivered → conversation.closed`: entregar
un mensaje no cierra una conversación. Cualquier ampliación exige mapping probado y diff de
contratos con el padre.

## Identidad y tenants

- `tenantId` es siempre el del cliente atendido; el tenant del agente proveedor viaja aparte y
  se cruza solo con `DelegationMandate` firmado (`src/auth/delegation.ts`).
- `Contact`, `CustomerOrganization`, `User` de Supabase y `tenant` no se consideran
  equivalentes en ningún punto del código.
- La memoria de un cliente no se reutiliza para otro: conocimiento, contactos, casos y
  vínculos están scoped por tenant y hay tests de fuga cruzada (E2E B y F).

## Lo que el padre tendría que aportar

1. Implementación real de `HostPort` y wiring del bus; hoy existe `FakeHost`.
2. Congelar el SHA del catálogo de personas (divergencia 12 vs 16 sigue abierta).
3. Aprobar el mapping de eventos y la versión del envelope nativo.
4. Resolver si el padre emitirá `traceparent` para no derivar `traceId` localmente.

## Cambios propuestos en el padre (no aplicados)

- Añadir al catálogo de eventos nativos `clientes.ticket.reply_proposed` y
  `clientes.ticket.handoff_required`, o confirmar su equivalencia.
- Aceptar `payloadRef` restringida en lugar de contenido de conversación en el bus.
- Definir la autoridad única por efecto (mensaje, devolución, cambio de CRM, escalado) en el
  `AuthorityMap` del padre; el servicio ya implementa el mapa local.

## Pruebas de integración previstas

`FakeHost` cubre hoy: verificación de principal, solicitud de aprobación, registro de tarea,
inbox idempotente por `domainEventId` y rechazo de `source.kind` no permitido. Falta una
prueba contra el padre real con SHA fijado.

## Rollback

Nada que revertir en el padre: no hay cambios aplicados. En este servicio, desactivar el
bridge es quitar la emisión de eventos; el resto de capacidades funciona sin él.
