# Contratos de diseño v1

Contratos propuestos, no APIs implementadas. TypeScript y validación runtime en fronteras, extra fields rechazados, tamaños máximos, IDs opacos, fechas ISO con offset y zona IANA por separado. `tenantId` no se fuerza a UUID del middleware. Dinero como decimal string más currency y exponente validado; no float ni NaN. Definir compatibilidad de schemaVersion del servicio por separado de la literal nativa del padre.

## Principal y delegación

Actor procede del servidor, JWT Supabase verificado y directorio/membresías. Campos nativos según tipo: kind, id, tenantId, userId o roleId/runtimeId, personaId?, kernelTurnId?, roles, profile mínimo, active. Un modelo recibe solo refs/contexto mínimo; nunca JWT o roles mutables.

DelegationMandate nuevo del servicio: id, originatingActorRef, originatingTenantId, targetTenantId, serviceAgreementId, twinBindingId, capabilities, resourceScope, fieldScope, purpose, costCeiling, issuedAt, expiresAt, revocationVersion, signatureOrVerificationRef. No crea una membership implícita. Verificar cadena de emisión/alcance y no permitir redelegación ampliada. El nombre de una capacidad no demuestra que el usuario la posea.

## Envelope

```json
{"schemaVersion":1,"operationId":"opaque","tenantId":"server-resolved","actorId":"server-resolved","capability":"clientes.reply.propose","requestId":"host-request-if-present","correlationId":"stable-trace","causationId":null,"idempotencyKey":"domain-key","expectedVersion":3,"approvalRef":null,"dryRun":true,"payload":{"caseId":"opaque","conversationId":"opaque"}}
```

Los IDs de identidad se derivan/verifican fuera del input del LLM. El campo tenantId representa el ámbito de datos; en delegación cross-tenant no sustituye Actor.tenantId de origen. El contexto autorizado conserva ambos. Resultado: status discriminado, operationId, localRefs, remoteRefs mínimos, evidenceRefs, policyVersion, payloadHash, warnings, retryable, reconciliationRequired y actualScope. dryRun no muta remoto; si necesita lectura pagada, informar y autorizar presupuesto antes.

## Datos del servicio

| DTO nuevo | Campos esenciales y guardas |
|---|---|
| CustomerOrganization | id, tenantId, legal/displayName, verifiedIdentifiers[], relationships, source/revision; no es Supabase tenant |
| Contact | id, tenantId, displayName, verifiedChannelIdentities[], organizationRelations[], preferredLocale, accessRefs; email no es clave global |
| ChannelIdentity | provider, connectionId, remoteContactId, normalizedAddressRef, verificationState, verifiedAt, evidenceRef; identidad por canal y contexto |
| RelationshipFact | subjectRef, field, valueRef, purpose, authority, effectiveFrom/to, observedAt, sourceVersion, provenance y conflictRef |
| ExternalLink | tenantId, provider, connectionId, model, externalId string, localKind/id, remoteVersion/writeDate, sourceHash, mapperVersion y lastSeenAt |
| ProcessingBasis | purpose, lawfulBasis, noticeVersion, scope, sourceEvidenceRef, validFrom/to, restriction; consentimiento es una base posible, no universal |
| ConsentEvent | sujeto, canal, finalidad, grant/withdraw, fecha/medio/version y prueba; append-only, estado derivado |
| Case | tenantId, organization/contact refs, conversationRefs, category, priority, state, assignedTo, assignedBy, version, SLA policy/version y ResolutionContractRef |
| Message | channel/connection, remoteId, conversationRef, direction, visibility public/internal, contentRef, attachmentRefs, occurred/receivedAt, sourceHash y delivery state |
| KnowledgeVersion | articleId/version, ACL, locale, effective dates, status draft/reviewed/published/retired, sourceRefs/hash, reviewerRef |
| AnswerProposal | caseRef, contentRevision, locale, citations[] a fragmentos autorizados, unsupportedClaims[], modelConfigRef, policyRef, confidence no autoritativa |
| ApprovalBinding | nativeApprovalRef o aprobación local verificada, actor/tenant, proposalHash, recipient/channel/attachments hashes, expectedVersion, expiresAt/revocationVersion |
| OutboundIntent | tenantId, operationKey, conversation/contact/channel binding, payloadHash, proposal/approvalRef, state, leaseFence, remoteRefs y reconciliationRef |
| SuccessPlan | tenantId, CustomerOrganizationRef, goals, milestones, assignedTo/By, evidence, acceptance y version |
| HealthObservation | metricDefinitionVersion, window, sourceRefs, value/null, coverage, freshness, reasonCodes; score derivado explicable, no verdad del cliente |
| AdvisorSession | tenantId, principalRef, contact/customer scope, canonical runtime/persona refs, twinBindingRef, capabilities, duration/budget, consent/recording policy y expiresAt |

Índices únicos: ExternalLink por tenantId/connection/model/externalId/localKind; operación por tenantId/capability/idempotencyKey; webhook por tenantId/connection/externalEventId; canal verificado según cardinalidad admitida. No imponer unicidad global de email o teléfono. FK compuesta evita referencias entre tenants. Las fusiones generan un plan aprobado y aliases con posibilidad de reconstrucción; no mueven consentimientos/casos por similitud de nombre.

## API nominada propuesta

| Método/ruta | Semántica |
|---|---|
| GET /v1/clientes/me | Principal mínimo, tenant efectivo y entitlements |
| GET/POST /organizations, /contacts | Lectura/create bajo permisos; writes con revisión/idempotencia |
| POST /imports/previews y /imports | Preview y aceptación async; sin duplicar registros |
| GET /integrations/{id}/capabilities | Capacidad documentada/probada y frescura, sin credenciales |
| GET /conversations y /cases | Filtros allowlist, paginación y ACL por contacto/registro |
| POST /cases/{id}/transitions | Transición nominada, guard y expectedVersion |
| POST /cases/{id}/answer-proposals | Contexto mínimo, propuesta con citas; no envía |
| POST /outbound-previews y /outbound-intents | Preview y commit autorizado; no generic send HTTP |
| GET /outbound-intents/{id} y POST /{id}/reconcile | Estado y reconciliación; no retry ciego |
| POST /handoffs y GET /handoffs/{id} | Resumen minimizado, receptor y ACK explícitos |
| GET /knowledge/search | ACL antes y después de recuperar; sin contenido privado en snippets |
| POST /knowledge/releases | Promoción humana/versionada; eval no equivale a aprobación |
| GET /success-plans y /health | Hechos, cobertura y propuestas, sin promesa de renovación |
| POST /reports y GET /reports/{id} | Job y snapshot tenant-scoped |
| POST /advisor-sessions y /advisor-sessions/{id}/close | Supabase principal, binding y token Anam efímero separado |
| GET /jobs/{id}, /conflicts y /events | Recurso scoped; no PII en bus |
| POST /privacy-requests | Solicitud con verificación humana/alcance, no borrado inmediato por texto |

Todas las rutas abreviadas comparten prefijo /v1/clientes. El SDK servidor, proxy Hono y herramientas usan allowlist exacta método/ruta. Ninguna ruta acepta SQL, modelo ORM, URL, domain filter arbitrario o métodos de proveedor del agente. Webhooks tienen endpoints de ingreso con firma/binding, no reutilizan la autenticación humana.

401 identidad inválida;403 capacidad;404 recurso ajeno/inexistente sin filtración;409 versión/idempotencia/conflicto;422 negocio;424 dependencia/capacidad ausente si se adopta en contrato;429 límites;502 remoto inválido;503 indisponible;504 timeout. Envelope code/message/correlationId/retryable/reconciliationRequired sin PII, DSN o respuesta cruda. Operaciones largas202+jobId. Un timeout de escritura no se marca como retryable hasta resolver su incertidumbre.

## Eventos y herramientas

Dominio nuevo: clientes.contact.imported, clientes.case.changed, clientes.reply.proposed, clientes.message.accepted/delivered/outcome_unknown, clientes.handoff.required, clientes.knowledge.gap, clientes.health.changed, clientes.review.required. Envelope propio v1 con id/tenantId/actorRef/correlationId/causationId/occurredAt y refs mínimas; no se envía directamente como SystemEvent del padre. Bridge transforma a tipos nativos permitidos solo tras mapping probado: schemaVersion string1.0, emittedAt, owner, source.kind/id/personaId? y type del enum. Conservar domainEventId como referencia de dedup. Outbox/inbox/receipt hacen entrega at-least-once; no anunciar exactly-once HTTP.

Tools iniciales: clientes_customer_read, clientes_case_read, clientes_case_timeline, clientes_knowledge_search, clientes_answer_propose, clientes_handoff_propose, clientes_health_explain, clientes_report_read, clientes_integration_health. Inputs excluyen tenant/actor/capabilities configurables por modelo. Approve/send/merge/export_all/refund/admin no son tools iniciales. Anam y MCP invocan el mismo PEP; un callback del avatar no demuestra consentimiento ni identidad.
