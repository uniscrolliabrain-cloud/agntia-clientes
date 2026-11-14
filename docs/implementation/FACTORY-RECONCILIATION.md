# Reconciliación con `docs/factory-prep-v1-20261113`

Revisión del 2026-11-14 contra los diez documentos de preparación
(`docs/factory/00-README.md` … `06-READINESS-AUDIT.md` y los tres handoffs).
Este documento dice **qué cambió en el código** por cada exigencia y qué sigue sin poder
afirmarse. Los números de test citados se ejecutaron en esta máquina.

## Criterio de lectura

El factory usa seis niveles de certeza (`DOC_ONLY`, `PROPOSED`, `CODE_VERIFIED`,
`TEST_VERIFIED`, `STALE`, `UNKNOWN`). Este repo traduce los estados de gate así
(`src/contracts/certainty.ts`):

| Estado de anexo | Certeza | Significado |
|---|---|---|
| PASS | `TEST_VERIFIED` | comportamiento cubierto por tests locales |
| NOT_VERIFIED | `CODE_VERIFIED` | código y contrato listos, sin proveedor ni runtime real |
| BLOCKED | `PROPOSED` | fuera de alcance, no se simula |

`isVerified()` solo devuelve `true` para `TEST_VERIFIED`, y `requiresExternalEvidence()`
marca los niveles que **no** autorizan hablar de integración. Un mock no asciende de nivel.

## Documento a documento

### `00-README.md` — invariantes y certeza

- Invariantes ya implementados: tenant explícito, ACL por caso/conversación/contacto,
  supresión, minimización, consentimiento/base, idempotencia y auditoría.
- Nuevo: vocabulario de certeza ejecutable (`src/contracts/certainty.ts`), con test que
  impide que un `CODE_VERIFIED` se trate como verificado.
- Sin cambios en `/agente`: el padre conserva identidad, kernel, bus, policy y aprobaciones.

### `01-PIPELINE.md` — estados y autoría

- Los estados del pipeline son organizativos, no código. El repo sigue en
  `IMPLEMENTING → REVIEWING`: no se declara `MERGED` ni `FOUNDER_APPROVAL`.
- Nada de proveedores, costes ni despliegues sin aprobación: `providers: not_configured`.

### `02-LEXICO.md` — vocabulario canónico

- `Task ≠ SOP ≠ Action ≠ Approval ≠ Event`: se mantienen separados (`src/domain/approvals.ts`,
  `src/jobs/outbox.ts`, `src/bridge/host.ts`).
- Distinciones respetadas y probadas: `messageDrafted ≠ sent ≠ delivered` (ledger de outbound),
  `ticketResolved ≠ customerSatisfied` (resolución verificada vs. CSAT nulo),
  `SLAClockPaused ≠ SLACompliant`, `KBMatch ≠ VerifiedAnswer` (citación con versión),
  `refundProposed ≠ refundExecuted` (no existe la capacidad de ejecutar),
  `customerIdentityLinked ≠ channelConsent` (consentimiento por canal separado).
- Nuevo: `eventId` único, `attemptId` por intento y `idempotencyKey` estable por efecto
  en el envelope ADTC.

### `03-TRACE-OBSERVABILITY.md` — ADTC

Implementado `src/contracts/adtc.ts` con el envelope `adtc/0.1`:

- Campos del documento: `schemaVersion`, `eventId`, `eventType`, `tenantId`, `actorId`,
  `taskId`, `correlationId`, `causationId`, `requestId`, `traceId`, `spanId`,
  `idempotencyKey`, `source`, `resourceRefs[]`, `evidenceRefs[]`, `payloadRef`.
- Añadido `attemptId` (nullable): el texto del documento lo exige por intento aunque el
  ejemplo JSON lo omita. Desviación declarada, no silenciosa.
- `source` fijo a `agntia-clientes`; `eventType` con nombres canónicos
  (`clientes.reply.proposed → clientes.ticket.reply_proposed`).
- **Sin PII en el bus**: `assertRestrictedRef` rechaza emails, JWT, claves de proveedor,
  DSN, `Bearer`, URLs, espacios y teléfonos aislados en cualquier ref. Test negativo incluido.
- Trazabilidad W3C: `formatTraceparent`/`parseTraceparent` validan versión `00` y rechazan
  ids todo-cero. Cuando no hay propagación del padre, `traceId`/`spanId` se derivan de forma
  determinista del evento; **eso no sustituye un traceparent real** y así queda documentado.
- Negativos del documento cubiertos: tenant B no lee A (E2E B), empleado sin ACL del caso no
  ve adjuntos (`requireAttachmentAccess`, nuevo), conocimiento revocado no se cita, timeout no
  duplica mensaje (E2E C), cambio de borrador invalida aprobación (E2E D), y **fallo de
  observabilidad no bloquea servicio** (`src/observability/nonblocking.ts`, aplicado en la
  ruta de transición y en el manejador de errores).

### `04-PRODUCTO-CLIENTES.md` — capacidades

Cubiertas en el esqueleto: ficha y timeline, inbox omnicanal con consentimiento por canal,
casos/colas/SLA, RAG con abstención, propuestas con revisión humana, onboarding, customer
success explicable, reclamaciones **propuestas**, reporting y portal externo.
Fuera: voz/telefonía real y avatar Anam (presencia simulada, `NOT_CONFIGURED`).

### `05-INTERFACES-ADAPTERS.md` — puertos y contrato de adaptador

Implementado `src/ports/index.ts`:

- Los **11 puertos** con nombre canónico: `CustomerProfilePort`, `ChannelIdentityPort`,
  `InboxPort`, `MessagingPort`, `TicketPort`, `SLAPort`, `KnowledgePort`,
  `EscalationPort`, `CSATPort`, `RefundProposalPort`, `AuditEvidencePort`.
- `AdapterContract` con los **19 campos** exigidos: provider, tenantBinding, channelIdentity,
  scope, consentOrLawfulBasis, suppression, sourceOfTruth, acl, purpose, schemaVersion,
  rateLimit, budget, timeoutMs, retry, idempotency, ackReconciliation, audit, retention,
  dataResidency.
- `AdapterRegistry` rechaza contratos incompletos indicando los campos que faltan, exige al
  menos un puerto, prohíbe el modo compartido sin aislamiento verificado y **nunca marca
  `connected`** por estar el proveedor nombrado: solo con evidencia declarada.

### `06-READINESS-AUDIT.md` — baseline y cuestiones abiertas

El baseline documental se conserva; lo que cambia es el estado declarado: las 42 campañas
pasan de `NOT_STARTED` a su anexo con gate local. Las cuestiones abiertas del documento
siguen abiertas y ahora son explícitas en `CAPABILITY-MATRIX.md` (fuente de verdad CRM,
identidad multicanal, calendarios, canal voz/WhatsApp, autoridad de reembolsos, bridge).

### Handoffs (arquitecto/founder, Codex, Freebuff)

- **Codex**: el SHA congelado es el commit de esta rama; los puntos que debe revisar
  (aislamiento, ACL, fuga RAG, SLA, aprobaciones, no doble mensaje, receipts, rollback)
  tienen test o anexo asociado.
- **Freebuff**: se respetó "no enviar respuestas reales, no reembolsar, no modificar CRM
  externo": no hay ninguna ruta con efecto financiero ni escritura remota sin aprobación.
- **Arquitecto/founder**: pendiente de su revisión; el repo no se declara aceptado.

## Lo que esta reconciliación NO arregla

1. **Bus real**: ADTC existe como contrato validado y probado, pero no hay transporte al bus
   del padre. Wiring real = `HOST_BRIDGE_NOT_VERIFIED`.
2. **Proveedores**: ningún contrato de adaptador se marcó como conectado; no hay receipts.
3. **Postgres/RLS**: sigue `NOT_VERIFIED`; las migraciones no se ejecutaron.
4. **Puertos**: existen como interfaces; los adaptadores actuales no los implementan todos
   (Chatwoot cubre inbox/mensajería, no perfil 360 ni CSAT).
5. **Voz y Anam**: sin SDK, sin sesión, sin grabación.

## Verificación ejecutada

```bash
npm ci             # lockfile regenerado y verificado (antes no cuadraba con package.json)
npm run typecheck  # sin errores
npm test           # 96 tests (87 previos + 9 de esta reconciliación)
npm run eval       # 9/9 escenarios A–I
```
