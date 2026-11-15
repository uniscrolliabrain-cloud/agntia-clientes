# CONCEPT MASTER — AGNTIA CLIENTES

**Versión:** 1.0 · **Fecha:** 2026-11-15 · **Serie:** 07/14 · **Estado:** arquitectura de producto + auditoría documental selectiva del esqueleto

> **Regla de evidencia:** SKELETON_IMPLEMENTED no significa producción. Los resultados de pruebas proceden del informe existente; esta revisión no ha reejecutado tests ni certificado conectores. No modificar `/agente`.

## 01. Misión

Agntia Clientes es el sistema operativo especializado de relación con clientes: transforma interacciones dispersas en conocimiento verificable, atención coordinada, casos resueltos, incorporación ordenada y continuidad comercial. La experiencia conversacional con Laia y agentes especialistas es la interfaz; debajo operan contratos, SOPs, permisos, fuentes y estados deterministas. No sustituye el runtime del padre.

## 02. Diagnóstico del repositorio y grados de evidencia

README declara SKELETON_IMPLEMENTED, no producto desplegado. docs/release/IMPLEMENTATION-REPORT.md declara 42 fases ejecutadas en esqueleto TS, typecheck sin errores, 106/106 tests y 9/9 E2E sintéticos, 33 PASS locales, 8 NOT_VERIFIED y 1 BLOCKED. Es evidencia histórica documentada, no reejecución independiente en esta revisión. El README conserva cifras anteriores (87 tests; 30/8/4): reconciliar con el informe y artefactos antes de informar a clientes. El propio informe indica que no hubo push del trabajo de su rama; verificar HEAD y procedencia de archivos antes de certificar cada fase. No hay proveedores reales, Postgres/RLS ejecutado, bridge de /agente, CI remota ni UI validada en navegador.

## 03. Posicionamiento y resultado comercial

Cliente inicial: autónomos, pymes y medianas empresas compiladas por AgntiaPro, con servicio gestionado de atención, relación y mejora continua. También admite portal SaaS especializado independiente. Entregables: menos consultas perdidas, menor tiempo de respuesta, resolución trazable, onboarding visible y mejor conocimiento de cada relación. Medir ROI real contra baseline por tenant, sin inventar cifras de ahorro. El modelo comercial del padre se mantiene; este repositorio no define un nuevo precio de la plataforma.

## 04. 72 capacidades objetivo

01 organizaciones cliente; 02 contactos; 03 roles; 04 identidades por canal; 05 deduplicación revisable; 06 relaciones; 07 timeline; 08 hechos con provenance; 09 preferencias; 10 bases de tratamiento; 11 consentimientos; 12 importación; 13 sincronización; 14 CRM; 15 bandeja web; 16 correo; 17 WhatsApp; 18 chat; 19 voz derivada; 20 adjuntos; 21 threading; 22 inbox; 23 casos; 24 categorías; 25 prioridades; 26 SLA; 27 routing; 28 colas; 29 asignación; 30 handoff; 31 resolución; 32 reabertura; 33 encuestas; 34 reclamaciones; 35 escalados; 36 conocimiento; 37 versionado; 38 RAG autorizado; 39 citas; 40 resúmenes; 41 traducción; 42 propuestas de respuesta; 43 verificación; 44 aprobaciones; 45 envío; 46 receipts; 47 reconciliación; 48 onboarding; 49 hitos; 50 playbooks; 51 customer success; 52 objetivos; 53 health explicable; 54 renovaciones propuestas; 55 riesgos de churn con cautelas; 56 oportunidades derivadas; 57 coordinación ventas; 58 coordinación marketing; 59 coordinación comunicación; 60 coordinación finanzas; 61 portal; 62 chat con agentes; 63 avatar Anam; 64 SDK; 65 bridge; 66 eventos; 67 métricas; 68 reporting; 69 auditoría; 70 privacidad; 71 observabilidad; 72 continuidad. Catálogo objetivo, no lista de capacidades desplegadas.

## 05. Modelo de dominio y fronteras

Cuatro niveles separados: operadora Agntia, tenant de empresa contratante, CustomerOrganization/Contact dentro del tenant y principal humano/agente. Contact no es usuario autorizado ni tenant; email compartido no prueba identidad. Un usuario multitenant selecciona contexto validado. Entidades: CustomerOrganization, Contact, ChannelIdentity, RelationshipFact, ExternalLink, ProcessingBasis, ConsentEvent, Case, Message, KnowledgeVersion, AnswerProposal, ApprovalBinding, OutboundIntent, SuccessPlan, HealthObservation, AdvisorSession, TwinBinding, DelegationMandate y ResolutionContract.

## 06. Arquitectura técnica

Portal o /agente → Supabase JWT, membresía y ACL → Hono API con DTO Zod y capacidades nominadas → core de identidad, policy, casos, SLA, conocimiento, propuestas y approvals → persistencia Postgres/RLS planificada con outbox/inbox/audit → workers con leases, fencing y reconciliación → conectores Chatwoot/Twenty/Frappe/Zammad/Resend/Meta bajo capability discovery → receipts. La implementación en memoria y transportes fake solo demuestran lógica local, no seguridad RLS real ni comportamiento remoto.

## 07. Fuente de verdad y AuthorityMap

Identidad canónica, rotas, supervisión y agentes en /agente; membresía en Supabase/directory verificado; datos CRM por campo según AuthorityMap; mensaje entregado confirmado por proveedor; caso y SLA en único motor elegido por WorkOrder; preferencias y consentimientos en ledger de evidencia; pagos y obligaciones en dominios competentes. Cada encargo define quién modifica, quién aprueba y quién confirma; se permiten capacidades solapadas sin doble efecto.

## 08. Contratos y protocolo

Envelope versionado: operationId, tenantId server-resolved, actorId verificado, capability, correlationId, causationId, idempotencyKey, expectedVersion, approvalRef, dryRun, payload. Nunca aceptar identidad, rol o URL de un prompt. DelegationMandate vincula actor de origen, tenant objetivo, scope de recursos/campos, finalidad, coste, expiración y revocación. ADTC v0.1 y refs restringidas según informe; comprobar src/contracts/adtc.ts y tests antes de elevar a validado. Contratos de salida discriminados por status, warnings, evidenceRefs, remoteRefs mínimos y reconciliationRequired.

## 09. Customer 360 con procedencia

Cada hecho de cliente debe llevar fuente, vigencia, autoridad por campo, propósito, fecha observada y conflictos. No fusionar automáticamente dos contactos por email, teléfono o nombre. Identidades por canal se verifican por conexión y tenant. Datos desactualizados se marcan stale; divergencias entre CRM, email y canal se convierten en tareas de reconciliación, no en overwrites silenciosos.

## 10. Bandeja y canales

Canal web y Chatwoot como primer candidato; Resend/email y WhatsApp solo tras discovery de scopes, políticas y pruebas de proveedor. Mensajes entrantes: firma webhook, deduplicación, clasificación, visibilidad, adjuntos, threading y vínculo a caso. Salientes: preview, destinatario y canal, approval atado al hash, OutboundIntent durable, envío autorizado y receipt. Si se pierde ACK remoto, reconciliar antes de reintentar; nunca duplicar respuestas por timeout.

## 11. Casos, SLA y handoff

Case FSM propuesta: new, triaged, assigned, waiting_customer, waiting_internal, proposed, approved, sending, resolved, reopened, closed, blocked. SLA con calendario y zona horaria versionados, pausas justificadas, prioridad y owner. ResolutionContract define evidencia observable de resolución, no cierre por texto del LLM. Handoff humano exige aceptación real, ownership exclusivo y trazabilidad. No fingir actividad de un agente o humano.

## 12. Conocimiento y respuestas verificables

KnowledgeVersion con ACL, idioma, vigencia, status y fragmentos citables. Retrieval filtrado por tenant y recurso antes de búsqueda y antes de respuesta. AnswerProposal registra citas, unsupportedClaims, revisión y versión de modelo. Un agente puede abstenerse, pedir aclaración o escalar si falta evidencia. Respuesta correcta en texto no autoriza envío ni implica caso resuelto.

## 13. Onboarding y customer success

SuccessPlan con objetivos, responsables, hitos, evidencias y criterios de aceptación. HealthObservation declara ventana, fuente, cobertura, frescura, definición de métrica y reasonCodes; una puntuación no equivale a verdad psicológica ni prueba de abandono. Detectar riesgo de relación para proponer seguimiento, nunca utilizar emociones biométricas ni perfilar atributos sensibles. Renovaciones y propuestas comerciales son borradores que pasan al dominio con autoridad.

## 14. Experiencia de usuario y agentes

Vistas: bandeja unificada, Customer 360, casos, SLA, conocimiento, aprobaciones, onboarding, customer success, métricas y auditoría. Laia coordina experiencia y comunica estados; twins especialistas usan identidad canónica del padre. Anam ofrece presencia audiovisual bajo consentimiento, presupuesto y sesión; si no está configurado, fallback textual. No confundir avatar con persona humana ni presentar acciones simuladas como ejecutadas.

## 15. Seguridad, privacidad y aislamiento

Deny-by-default y pruebas negativas tenantA/tenantB, recursos privados dentro del tenant, JWT verificado, scopes por campo, RLS real por ejecutar, Storage, realtime, search, vector, exports y backup. Consentimiento no es base universal; finalidades y derechos por canal. Revocación invalida sesiones, trabajos y approvals antes de efecto. Prompt injection en emails, adjuntos y KB no puede activar tools. Egress allowlist, sin credenciales en prompts, y sanitización de logs/observabilidad.

## 16. Adaptadores y realidad de proveedores

docs/implementation/CAPABILITY-MATRIX.md documenta Chatwoot, Twenty, Frappe, Zammad, Resend y Meta con FakeTransport; ninguno probado contra proveedor real. Meta WhatsApp permanece documentation_revalidation_required por 429; Anam not_configured; Supabase JWT verified local, sin proyecto real. Habilitar con cuenta laboratorio, versión, scope, licencia, endpointRef/secretRef, probe, fixtures A/B, lectura/escritura y evidencia de receipts. Un 200 HTML no es health; unknown permanece bloqueado.

## 17. Pruebas y gates

El informe declara 106 tests y 9 E2E sintéticos, no pruebas reejecutadas en esta revisión. Siguientes gates: Postgres/RLS con roles reales, proveedor de bandeja y envío sandbox, multi-tenant en almacenamiento/búsqueda/jobs, navegador y accesibilidad, CI GitHub, bridge padre, límites de coste, cancelación, revocación, idempotencia y recuperación tras crash. Bloqueo ante fuga, aprobación fabricada, secreto, doble envío o replay. Registrar PASS/FAIL/BLOCKED/NOT_VERIFIED con SHA, comandos y artefactos.

## 18. Roadmap de ejecución

Preservar 42 campañas CLI-C01..C42 y sus anexos; reconciliar inconsistencias README/informe/campaigns. Orden diferencial: 1 congelar baseline y HEAD; 2 ejecutar typecheck/test/eval en checkout verificable; 3 Postgres/Supabase y RLS; 4 binding canónico de twins y divergencia 12/16; 5 un único proveedor Chatwoot laboratorio; 6 webhooks y outbound real controlado; 7 portal/browser/accessibility; 8 bridge /agente con aprobación; 9 piloto sintético dos tenants; 10 aceptación founder antes de datos reales. No reescribir 42 fases ya implementadas sin diff de gaps.

## 19. Costes, operación y observabilidad

Presupuesto por tenant, conversación, canal, modelo, avatar, almacenamiento y egress. Métricas: primera respuesta, resolución comprobada, SLA cumplidos, reopen, handoff, mensajes duplicados, propuestas rechazadas, citas faltantes, tiempo humano ahorrado medido y satisfacción con muestra. Outbox/inbox, DLQ, snapshots y replay sin efectos duplicados; backups restaurables; telemetría por correlación sin PII en etiquetas.

## 20. Relación con otros repositorios

Ventas posee oportunidad/negociación según WorkOrder; Marketing campañas y segmentación autorizada; Redes canales sociales; Comunicación contenidos/canales institucionales; Finanzas cobros; Gestoría documentos contables; Legal reclamaciones con consecuencias jurídicas; Ciberseguridad incidentes; Formación onboarding formativo. Clientes puede tener funciones locales limitadas para autonomía SaaS, pero AuthorityMap impide dos emisores del mismo mensaje y dos fuentes de verdad de una obligación.

## 21. Visión evolutiva

De CRM y soporte asistido a departamento relacional continuo que entiende compromisos, mantiene contexto verificable, detecta fricciones, coordina especialistas y convierte cada interacción en una mejora operacional. No simular relaciones humanas ni autonomía ilimitada: ofrecer confianza mediante permisos, trazabilidad, revisión y resultados reales. El Concept Master se revisa cuando existan integraciones probadas, métricas de piloto y feedback de clientes.

## Referencias verificadas en este trabajo

- `README.md`
- `docs/01-producto-y-limites.md`
- `docs/architecture/01-arquitectura.md`
- `docs/contracts/01-contratos.md`
- `docs/campaigns/README.md`
- `docs/release/IMPLEMENTATION-REPORT.md`
- `docs/implementation/CAPABILITY-MATRIX.md`
- `package.json`

## Control de cambios

V1.0: 72 capacidades objetivo, 22 secciones, reconciliación de discrepancias de estado documental, roadmap diferencial y límites de verificación. Se preservan las 42 campañas; no se modifica `/agente`.
