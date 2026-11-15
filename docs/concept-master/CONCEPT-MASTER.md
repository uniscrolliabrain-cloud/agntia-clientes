# AGNTIA CLIENTES — CONCEPT MASTER V1.0
**Fecha:** 2026-11-15 · **Estado:** TARGET VISION / EVOLUTIVO · **Repositorio:** `uniscrolliabrain-cloud/agntia-clientes`

> **Visión:** construir el sistema operativo agéntico de las relaciones entre una empresa y sus clientes: memoria verificable de cada relación, atención multicanal, resolución efectiva de problemas, customer success, aprendizaje continuo y experiencias humanas asistidas por IA, con control de identidad, privacidad, autoridad, resultados y economía del servicio.

## 0. Naturaleza y contrato de verdad

Este Concept Master describe **el producto final deseado**, no la madurez actual del repositorio ni un alcance limitado a su piloto. Se suma a la documentación existente sin reemplazarla. La implementación declarada en `docs/release/IMPLEMENTATION-REPORT.md` es un **esqueleto** con tests locales y simulaciones; no demuestra integraciones productivas, Postgres/RLS ejecutada, bridge real con `/agente` ni atención real. La visión puede evolucionar a V2 cuando el producto y la investigación lo justifiquen.

**Etiquetas:** [C] capacidad o enfoque conocido; [D] diseño conceptual propuesto; [H] hipótesis de frontera. **P0/P1/P2** marcan orden de construcción, no límite de ambición. La IA propone; el runtime, los contratos, las políticas y los humanos autorizados deciden. Ningún avatar, twin o prompt adquiere permisos propios. El objetivo es **resolver** necesidades de clientes, no simular trabajo, multiplicar tickets o maximizar tasas de cierre artificiales.

## 1. Tesis: de CRM y helpdesk a inteligencia relacional verificable

### 1.1 El problema real
Los clientes hablan con una empresa por correo, web, WhatsApp, teléfono, redes, videollamada y empleados distintos. La información queda fragmentada, los sistemas confunden identidades, se pierden compromisos y los indicadores premian la rapidez de respuesta aunque el problema no esté resuelto. Los asistentes de IA pueden redactar respuestas plausibles, pero no necesariamente consultar la política vigente, comprobar el efecto remoto, respetar permisos o entender la historia comercial. Customer success y soporte se separan aunque describen una única relación.

### 1.2 Resultado final
**Agntia Customer Relationship Intelligence OS** mantiene una representación temporal, verificable y autorizada de relaciones, compromisos, problemas, objetivos y resultados. Coordina especialistas y humanos para:
- comprender quién solicita algo y qué derechos tiene en ese contexto;
- recordar lo relevante sin convertir cada conversación en un perfil ilimitado;
- responder con conocimiento autorizado, versión y evidencia;
- ejecutar acciones de negocio nominadas, seguras y verificadas;
- demostrar si el resultado solicitado se alcanzó realmente;
- detectar fricción, necesidades emergentes y riesgos de abandono sin manipulación;
- acompañar onboarding, adopción, éxito, renovaciones y recuperación de confianza;
- comunicar de forma consistente por texto, voz y avatar;
- alimentar Ventas, Marketing, Finanzas, Comunicación y Producto con hechos, no con conjeturas.

### 1.3 Diez apuestas diferenciales [D]
1. **Relationship Evidence Graph:** grafo vivo de organizaciones, personas, roles, interacciones, hechos, acuerdos y fuentes, con vigencia, conflictos y permisos.
2. **Resolution Contract:** definición verificable de qué significa resolver cada caso; cerrar no equivale a solucionar.
3. **Commitment Ledger:** compromisos adquiridos por humanos o agentes, plazos, responsables, evidencia de cumplimiento y escalado.
4. **Customer Context Budget:** mínima información necesaria para la tarea, con finalidad, caducidad y control de exposición al modelo.
5. **Identity Confidence & Rights Graph:** identidad por canal, verificación, representación, acceso y conflictos sin fusiones heurísticas peligrosas.
6. **Outcome-Aware Agent Runtime:** evalúa trayectorias, acciones intermedias, efectos remotos, derechos y resultado final.
7. **Customer Journey Twin:** modelo temporal de la experiencia real de cada cliente, con señales, incertidumbre y oportunidades de mejora.
8. **Service Economics Twin:** relación entre satisfacción, resolución, coste de atención, valor de vida y capacidad operativa sin sacrificar derechos.
9. **Trust Repair Engine:** gestión de errores, promesas incumplidas, reclamaciones y recuperación de confianza con reparación comprobable.
10. **Cross-Enterprise Relationship Brain:** colaboración de especialistas bajo contratos de autoridad, sin duplicar envíos ni revelar datos entre empresas.

## 2. Atlas de frontera: industria, investigación y open source

### 2.1 Referentes de industria
El repositorio ya investiga **Salesforce Agentforce/Service, Fin/Intercom, Zendesk, HubSpot Service Hub, Gainsight y Sierra**. Son referentes de distintos ángulos: CRM, atención con agentes, gobierno, customer success, conocimiento y resolución. Ampliar el mapa a **Freshworks/Freshdesk, ServiceNow Customer Service Management, Genesys Cloud CX, NICE CXone, Kustomer, Gladly, Pipedrive, Zoho Desk/CRM, Front, Help Scout, ChurnZero, Planhat y Totango**, verificando ediciones, condiciones, capacidades reales y APIs antes de afirmar equivalencia. No asumir que dos productos comerciales mantienen independencia corporativa o una API fusionada sin comprobarlo.

### 2.2 Investigación científica y evaluación de agentes
- **tau-bench / tau2-bench:** interacción entre agente, usuario y herramientas con estados y restricciones; inspiración para pruebas multi-turno y cambios concurrentes. https://github.com/sierra-research/tau2-bench
- **CRMArena / CRMArena-Pro:** tareas CRM y privacidad; revisar licencias, especialmente restricciones no comerciales antes de reutilizar datos. https://github.com/SalesforceAIResearch/CRMArena
- **CRM-Agent-Bench:** contratos ejecutables y trayectorias de agentes; la documentación interna ya lo identifica como línea de investigación. Buscar publicación y edición fijada antes de integrar.
- **AgentDojo:** evaluación de prompt injection y defensa frente a instrucciones en datos externos. https://github.com/ethz-spylab/agentdojo
- **RAG con control de acceso:** recuperación condicionada por tenant, rol, campo, documento, versión y propósito; seguridad antes y después del retrieval.
- **Causalidad en customer success:** distinguir correlación entre uso y renovación de efecto de una intervención; experimentos y cohortes cuando sean viables.
- **Graph reasoning y temporal knowledge:** hechos contradictorios, evolución de roles, contactos compartidos y cambios de contrato.
- **Human factors:** carga cognitiva, confianza calibrada, handoffs, reparación de servicio y accesibilidad.
- **Conversational evaluation:** corrección factual, política, utilidad, tono, latencia, multilingüismo y verificación del resultado real.

**No trasladar porcentajes publicados por terceros a Agntia.** Un benchmark sintético es evidencia sobre ese benchmark, no una garantía de resolución productiva.

### 2.3 Repositorios y motores candidatos
- **Chatwoot:** bandeja multicanal y conversaciones, con licencias/ediciones que requieren revisión. https://github.com/chatwoot/chatwoot
- **Twenty:** CRM extensible, con condiciones de licencia por paquete/edición. https://github.com/twentyhq/twenty
- **Frappe CRM / Helpdesk:** CRM y tickets como alternativas. https://github.com/frappe/crm · https://github.com/frappe/helpdesk
- **Zammad:** helpdesk como alternativa de backend. https://github.com/zammad/zammad
- **Rasa:** patrones de diálogo, flujos y NLU, si aporta frente al runtime propio. https://github.com/RasaHQ/rasa
- **OpenTelemetry:** trazas, métricas y correlación, con privacidad por diseño. https://opentelemetry.io/
- **OpenSearch:** búsqueda/analítica, candidato sujeto a ACL y coste operativo. https://github.com/opensearch-project/OpenSearch
- **PostgreSQL / pgvector:** datos relacionales y recuperación semántica, sin asumir que el vector store implementa permisos. https://github.com/pgvector/pgvector
- **LiveKit:** infraestructura de voz/tiempo real como candidato, no sustituto de proveedor telefónico ni permisos. https://github.com/livekit/livekit

**Selección:** uno o pocos backends por función, con adapter contract, capability discovery, licencia revisada, versión fijada, aislamiento probado, rollback y coste. No instalar cinco CRMs por aparentar amplitud.

## 3. Mapa de 84 capacidades finales

### A. Identidad y memoria relacional
**CLI01 [C/P0]** Organizaciones, contactos y roles con identidad tenant-scoped.
**CLI02 [C/P0]** Identidad por canal y conexión, sin unicidad global de email/teléfono.
**CLI03 [D/P1]** Identity Confidence Graph: verificación, alias, disputas y cambios de representación.
**CLI04 [C/P1]** Customer 360 con procedencia, frescura, campos sensibles y conflictos.
**CLI05 [D/P1]** Relationship Evidence Graph bitemporal.
**CLI06 [C/P1]** Contactos multiempresa, departamentos, cargos y jerarquías con ACL diferenciadas.
**CLI07 [D/P1]** Merge/relink reversible, revisión y no propagación automática de permisos.
**CLI08 [C/P1]** Consentimientos, bases jurídicas, preferencias y supresión por finalidad/canal.
**CLI09 [D/P2]** Customer Context Budget con minimización para cada operación.
**CLI10 [H/P2]** Memoria semántica relacional con olvido selectivo y validación de relevancia.

### B. Conversación y experiencia omnicanal
**CLI11 [C/P0]** Bandeja web y conversación bidireccional.
**CLI12 [C/P1]** Email, WhatsApp, chat y canales sociales mediante conectores autorizados.
**CLI13 [C/P1]** Telefonía entrante/saliente con grabación, aviso y base jurídica cuando proceda.
**CLI14 [C/P1]** Transcripción, resumen, traducción y continuidad entre canales.
**CLI15 [D/P1]** Conversation Continuity Graph con fuente, identidad y cambio de contexto.
**CLI16 [C/P1]** Handoff humano con contexto mínimo, ACK y continuidad de SLA.
**CLI17 [C/P1]** Respuestas ES/EN/FR y adaptación accesible.
**CLI18 [D/P2]** Session Continuity de texto a voz/avatar sin transferencia de autoridad.
**CLI19 [D/P2]** Control de interrupciones, tiempos de espera, estados y transparencia de acciones.
**CLI20 [H/P2]** Orquestación de conversaciones complejas multiagente sin sobrecargar al cliente.

### C. Tickets, SLA y resolución
**CLI21 [C/P0]** Casos/tickets con estados, prioridades, versiones y responsables.
**CLI22 [C/P0]** SLA versionado con calendarios, pausas y criterios explícitos.
**CLI23 [D/P1]** Resolution Contract con objetivo, aceptación, evidencia y pendientes.
**CLI24 [D/P1]** Commitment Ledger: promesas, vencimientos y responsables.
**CLI25 [C/P1]** Clasificación de intención y urgencia revisable.
**CLI26 [C/P1]** Detección de duplicados y relaciones entre incidentes.
**CLI27 [C/P1]** Escalado a equipos humanos y dominios especializados.
**CLI28 [D/P1]** Outcome Verification: acción ejecutada, confirmación externa y validación del cliente cuando aplique.
**CLI29 [D/P2]** Root-Cause & Recurrence Engine con análisis de causas y reincidencias.
**CLI30 [D/P2]** Trust Repair Engine para fallos, reclamaciones y reparación verificable.
**CLI31 [C/P2]** Gestión de incidentes masivos con comunicación coherente y prioridades.
**CLI32 [H/P2]** Predicción de complejidad/tiempo de resolución con intervalos y auditoría de sesgos.

### D. Conocimiento, verdad y asistencia
**CLI33 [C/P0]** Base de conocimiento versionada con fuentes y ACL.
**CLI34 [C/P0]** Recuperación con citas autorizadas y abstención ante falta de evidencia.
**CLI35 [D/P1]** Knowledge Provenance Graph: política→versión→fragmento→respuesta.
**CLI36 [C/P1]** Knowledge lifecycle: borrador, revisión, publicación, retiro y caducidad.
**CLI37 [C/P1]** Propuestas de respuesta y acciones separadas del envío.
**CLI38 [D/P1]** Contradiction Detector: políticas, tickets y documentación inconsistentes.
**CLI39 [D/P1]** Knowledge Gap Loop: problemas sin respuesta→propuesta→revisión→publicación.
**CLI40 [C/P2]** Ayuda contextual al agente humano y macros con evidencia.
**CLI41 [D/P2]** QA de conversaciones: exactitud, respeto, utilidad, política y resultado.
**CLI42 [H/P2]** Personalización responsable basada en preferencias explícitas, no inferencias sensibles.

### E. Customer success, adopción y retención
**CLI43 [C/P1]** Onboarding de cliente con hitos y criterios de aceptación.
**CLI44 [C/P1]** Success Plans con objetivos, responsables y pruebas de valor.
**CLI45 [C/P1]** Señales de uso/adopción con cobertura y frescura.
**CLI46 [D/P1]** Customer Journey Twin con eventos, hitos y fricciones.
**CLI47 [C/P1]** HealthScore explicable, sin presentarlo como verdad psicológica o causal.
**CLI48 [C/P1]** Seguimiento de renovaciones y expansión, con autoridad de Ventas/Finanzas.
**CLI49 [D/P2]** Value Realization Ledger: objetivos prometidos frente a resultados comprobados.
**CLI50 [D/P2]** Churn Risk Observatory con sesgos, incertidumbre y revisión.
**CLI51 [C/P2]** QBR/EBR y revisiones periódicas con snapshots reproducibles.
**CLI52 [D/P2]** Intervenciones proactivas basadas en necesidades reales y preferencias.
**CLI53 [H/P2]** Experimentación causal de intervenciones de customer success.
**CLI54 [D/P2]** Customer Advocacy & Feedback Loop con consentimiento y no manipulación.

### F. Inteligencia operativa y economía del servicio
**CLI55 [C/P0]** Métricas de tickets, SLA, tiempos, canales y carga con denominadores.
**CLI56 [C/P1]** CSAT/CES/NPS como señales parciales, con sesgo de respuesta declarado.
**CLI57 [D/P1]** Outcome Metrics: resolución efectiva, reaperturas, esfuerzo y confianza.
**CLI58 [D/P1]** Workload & Capacity Planner para equipos humanos/agentes.
**CLI59 [D/P2]** Service Economics Twin: coste por resultado, escalado, capacidad y valor.
**CLI60 [D/P2]** Simulador de políticas SLA, dotación y mezcla humano/IA.
**CLI61 [D/P2]** Cohort & Segment Insights con límites de privacidad.
**CLI62 [D/P2]** Continuous Improvement Ledger: hipótesis, experimentos y resultados negativos.
**CLI63 [H/P2]** Predicción de demanda de atención bajo cambios estacionales y de producto.
**CLI64 [D/P2]** Benchmark interno de calidad sin comparaciones espurias entre clientes.

### G. Agencia, automatización y colaboración
**CLI65 [D/P0]** Twin especialista vinculado a agentes canónicos y mandatos.
**CLI66 [D/P0]** WorkOrder con autoridad, propósito, coste, recursos y revocación.
**CLI67 [D/P1]** SOPs de atención con acciones nominadas y FSM determinista.
**CLI68 [D/P1]** Preview/approval/payload hash para acciones con efecto.
**CLI69 [D/P1]** Outbox/inbox, idempotencia, receipts y outcome_unknown.
**CLI70 [D/P1]** Handoff inter-repos con ACK, límites y ownership.
**CLI71 [D/P1]** Customer Advisor Office: agentes de soporte, éxito, conocimiento y QA.
**CLI72 [D/P2]** LAIA y avatar Anam en sesiones acotadas con fallback texto.
**CLI73 [D/P2]** Autonomía graduada por riesgo, tenant, tipo de acción y evidencia.
**CLI74 [H/P2]** Optimización multiagente de asignación de trabajo con evaluación de seguridad.

### H. Plataforma, confianza y experiencia final
**CLI75 [C/P0]** Tenant isolation en DB, workers, búsqueda, archivos y exportaciones.
**CLI76 [C/P0]** ACL de campo/recurso, delegación, privacidad y retención.
**CLI77 [D/P1]** ADTC: trazabilidad de trayectorias sin PII en eventos.
**CLI78 [C/P1]** Portal de cliente externo con identidad y derechos acotados.
**CLI79 [D/P1]** Relationship Cockpit para owner y equipos.
**CLI80 [D/P1]** Report Factory con snapshots y fuentes.
**CLI81 [C/P1]** Capability discovery y adaptadores de CRM/helpdesk/canales.
**CLI82 [D/P2]** Release & Evaluation Factory para agentes, conocimiento y workflows.
**CLI83 [D/P2]** Privacy Operations: acceso, rectificación, oposición, supresión y portabilidad verificables.
**CLI84 [H/P2]** Aprendizaje inter-tenant con agregación y garantías jurídicas/técnicas demostrables.

## 4. Arquitectura conceptual de destino

### 4.1 Ocho planos
1. **Identity & Rights Plane:** principal, tenant, membresías, roles, canal, representación, bases jurídicas y consentimientos.
2. **Relationship Graph Plane:** organizaciones, personas, vínculos, interacciones, hechos, compromisos y temporalidad.
3. **Conversation Plane:** inbox, mensajes, sesiones, identidad de canal, voz, handoffs y delivery receipts.
4. **Resolution Plane:** tickets, SLA, contratos de resolución, acciones, incidentes y cierre verificable.
5. **Knowledge & Reasoning Plane:** documentos, ACL, retrieval, propuestas, citas, QA y evaluación.
6. **Success & Intelligence Plane:** onboarding, adopción, health, valor, retención, experimentos y economía.
7. **Agent & Experience Plane:** LAIA, twins, especialistas, workspaces, portal y avatar.
8. **Governance & Integration Plane:** policy, mandatos, outbox, eventos, conectores, privacidad, observabilidad y auditoría.

### 4.2 Flujo canónico de atención
`ingreso → verificación de canal/identidad → tenant y permisos → clasificación de intención → recuperación autorizada → comprensión de objetivo → Resolution Contract → propuesta de respuesta/acción → validación de policy y necesidad de aprobación → ejecución nominada → receipt y reconciliación → verificación de resolución → comunicación al cliente → aprendizaje y cierre`.

No confundir `message.accepted` con `message.delivered`, ni entrega con lectura, ni respuesta con resolución, ni resolución con satisfacción. Un fallo remoto incierto exige reconciliación antes de reintento. Una respuesta textual convincente no valida una acción prohibida en la trayectoria.

### 4.3 Modelo de entidades
`Tenant, Principal, Membership, DelegationMandate, TwinBinding, ServiceAgreement, CustomerOrganization, Contact, ChannelIdentity, IdentityAssertion, VerificationEvidence, OrganizationRelation, RelationshipFact, ProcessingBasis, ConsentEvent, Preference, ExternalLink, Conversation, Message, Attachment, Case, SLAContract, ResolutionContract, Commitment, CommitmentStatus, KnowledgeArticle, KnowledgeVersion, RetrievalEvidence, AnswerProposal, ApprovalBinding, OutboundIntent, ProviderReceipt, ReconciliationCase, SuccessPlan, CustomerGoal, Milestone, HealthObservation, InterventionProposal, Experiment, CustomerOutcome, ReportSnapshot, AuditEvent`.

Cada entidad relevante incluye tenant, sourceRefs, version, ACL, purpose, timestamps, actor y provenance. Las relaciones son **bitemporales** cuando cambian derechos, roles, hechos o contratos. Las referencias entre tenants se rechazan con FK compuestas y policy, no se confía solo en prompts.

### 4.4 Motor de resolución
`ResolutionContract = {caseRef, customerStatedGoal, acceptedOutcomeCriteria[], requiredEvidence[], forbiddenActions[], responsibleActor, targetWindow, acceptanceAuthority, policyVersion, state}`.
Estados: `OPEN → TRIAGED → INVESTIGATING → ACTION_PROPOSED → AWAITING_APPROVAL → EXECUTING → VERIFYING_OUTCOME → RESOLVED_VERIFIED`; alternativas `BLOCKED, WAITING_CUSTOMER, WAITING_PROVIDER, ESCALATED, OUTCOME_UNKNOWN, REOPENED, CANCELLED`. Un caso puede resolverse administrativamente sin confirmación del cliente, pero el reporte debe distinguir `internally_closed`, `effect_verified` y `customer_confirmed`.

### 4.5 Memoria de relaciones
**Facts:** información observada con fuente. **Assertions:** declaraciones del cliente o tercero. **Inferences:** hipótesis de agentes, nunca hechos. **Commitments:** promesas vinculantes o expectativas pendientes. **Preferences:** preferencias explícitas con finalidad. **Rights:** permisos/representación. **Outcomes:** resultados comprobados. Conflictos no se sobrescriben; se versionan y revisan. Retención y acceso por finalidad: una conversación de soporte no autoriza perfilar al cliente para marketing.

## 5. Integración con el ecosistema AgntiaPro

**Padre `/agente`:** identidad canónica de agentes, LAIA, kernel, SOPs, tareas, approvals y eventos. Este servicio puede operar solo con portal y backend propios, pero al integrarse no crea otro supervisor empresarial ni otra nómina de agentes. Los twins heredan perfil y mandato, no autoridad.

**Marketing:** campañas y journeys bajo consentimiento, mientras Clientes conserva hechos de relación, preferencias y atención según AuthorityMap. **Ventas:** oportunidades, contratos, renovaciones y cobros bajo su autoridad; Clientes aporta señales y propuestas. **Redes:** comentarios, mensajes y reputación; un solo propietario de cada publicación/respuesta. **Comunicación:** crisis, quejas públicas y narrativa institucional. **Finanzas:** facturación, reembolsos y análisis económico; Clientes no ejecuta pagos. **Gestoría/Legal:** reclamaciones, facturas, privacidad y decisiones reguladas. **Vídeo:** activos y sesiones audiovisuales. **Ciberseguridad:** incidentes, accesos, fraudes y datos personales.

**Handoff contractual:** `WorkOrder → authorized scope → proposed action → approval (si aplica) → effect owner → receipt → ACK → status sync`. El dueño de una conversación no es automáticamente el dueño de un reembolso, una baja contractual o un envío por otro canal.

**Tools nominadas propuestas:** `clientes.customer.read`, `clientes.identity.verify_status`, `clientes.case.read`, `clientes.case.propose_transition`, `clientes.knowledge.search`, `clientes.answer.propose`, `clientes.commitment.read`, `clientes.handoff.prepare`, `clientes.success.plan`, `clientes.health.explain`, `clientes.report.read`. Efectos de envío, refund, merge, export masivo, borrado y administración requieren rutas y permisos independientes. No exponer URLs/SQL/métodos arbitrarios de proveedor.

## 6. Experiencia final: la empresa conversable

**Para el owner:** «¿Qué clientes están esperando una respuesta?», «¿Qué problemas se repiten?», «¿Qué compromisos hemos incumplido?», «¿Qué renovaciones están en riesgo y qué sabemos realmente?», «¿Por qué aumentó el coste de soporte?», «¿Qué casos resolvió el equipo y cuáles solo cerró?».

**Para el agente humano:** bandeja unificada, ficha de relación con permisos, contexto relevante, artículos citados, propuesta editable, acción previsualizada, estado de entrega y motivo de escalado.

**Para el cliente externo:** portal con tickets, documentos permitidos, estado real de compromisos, seguimiento, respuestas, accesibilidad, opción humana y avatar cuando esté disponible. No necesita tener cuenta en el OS empresarial de AgntiaPro para acceder al portal de servicio.

**Workspaces:** Relationship 360, Unified Inbox, Resolution Desk, Commitment Board, Knowledge Studio, Success Planner, Journey Observatory, Voice & Avatar Studio, Trust Repair Center, Service Economics, Agent Quality Lab, Privacy Console y Executive Briefing.

**UX:** distinguir «pensando», «consultando fuente», «preparando», «pendiente de aprobación», «ejecutando» y «confirmado» solo cuando sean estados reales del workflow. Una animación de progreso puede educar sobre fases, pero nunca declarar una operación completada antes de receipt. Mostrar incertidumbre, referencias y bloqueos comprensibles.

## 7. Gobernanza, seguridad y ética

- **Aislamiento fuerte:** Postgres/RLS cuando se despliegue, además de autorización de servidor; pruebas en API, workers, colas, índices vectoriales, adjuntos, realtime, backups y exportaciones.
- **Privacidad:** RGPD/LOPDGDD, bases jurídicas por finalidad, minimización, derechos, contratos con encargados y retención. No tratar consentimiento como única base posible; no inferir acceso a documentos por aparecer en una ficha.
- **Identidad:** email/teléfono no equivalen a persona autenticada; verificación por canal, controles antifraude y revisión de fusiones.
- **Seguridad agéntica:** prompt injection en emails, tickets, PDFs, artículos y mensajes; datos externos no modifican policy, tools ni autorizaciones.
- **Autonomía:** L0 lectura; L1 resumen; L2 propuesta; L3 preparación; L4 envío de bajo riesgo expresamente autorizado; L5 efectos económicos/jurídicos con controles y responsables externos.
- **Integridad de efectos:** payload hash, versión, expiración, idempotencyKey, outbox durable, receipt remoto y `outcome_unknown`; no «exactly once» mágico en HTTP.
- **Transparencia:** identificar claramente la naturaleza IA del interlocutor; avatar Anam no acredita identidad humana ni sustituye consentimiento, firma o representación.
- **Calidad:** evitar manipulación emocional, inferencias biométricas o sensibles y métricas de retención obtenidas mediante fricción artificial.
- **Seguridad operacional:** incidentes, backups, restauración, rotación de secretos, costes, rate limits, observabilidad sin PII y revisión de proveedores.

## 8. Ciencia de medición y evaluación

### 8.1 Métricas con definiciones
**Operational:** FRT, tiempo hasta respuesta útil, tiempo de resolución verificada, SLA cumplidos, backlog, transferencias, reaperturas, abandonos y duplicados. **Experience:** CES/CSAT/NPS con cobertura, no respuesta y sesgos. **Outcome:** objetivo del cliente logrado, cumplimiento de compromisos, repetición de problemas, necesidad de intervención humana y calidad del remedio. **Economic:** coste por resultado verificado, capacidad, retención y margen (con fuentes de Finanzas). **Safety:** cero fugas entre tenants, cero efectos sin autoridad, cero mensajes duplicados por reintento, cero datos sensibles en bus.

### 8.2 Evaluation Factory
**Benchmarks de referencia:** tau2-bench, CRMArena/Pro, AgentDojo y CRM-Agent-Bench, respetando licencia, dataset y versión. **Suite propia:** conversaciones originales con estados verificables, tareas multi-turno, roles y permisos, cambios de datos durante conversación, canal caído, intentos de inyección y efectos con resultado incierto.

**Casos adversariales mínimos:**
1. Dos tenants con contactos que comparten email.
2. Un mismo contacto representa organizaciones con ACL diferentes.
3. Un email contiene instrucciones para ignorar la policy.
4. Un artículo de conocimiento fue retirado antes de responder.
5. Una aprobación expira tras editar la respuesta.
6. Un proveedor acepta el mensaje pero devuelve timeout.
7. El cliente revoca su consentimiento mientras el mensaje está en cola.
8. Un reembolso se solicita desde un ticket pero pertenece a Finanzas.
9. Un cliente cambia su objetivo mientras un caso está en curso.
10. Un agente cierra el caso sin evidencia de resolución.
11. El avatar recibe una instrucción oral para exportar todos los contactos.
12. Un score de salud mejora artificialmente por ausencia de datos.
13. Un webhook llega duplicado, fuera de orden o con firma inválida.
14. Una sincronización de CRM intenta sobrescribir preferencias más recientes.
15. Se reabre un caso y debe preservarse el historial de compromiso.
16. El sistema tiene que admitir «no sé» y derivar a un humano.

**Gates:** el test debe validar tanto respuesta final como **trayectoria completa**. Registrar policy version, model config, dataset hash, escenario, eventos, expected/observed, costes, latencia, resultado y fallos. Las pruebas con fakes no se presentan como conectores reales; los tests locales no acreditan producción.

## 9. Secuencia de convergencia hacia el destino

**G0 — Concept Closure:** fichas CLI01–CLI84, atlas competitivo actualizado, ADRs, métricas, ontología, riesgos y fuentes.
**G1 — Identity & Evidence:** Supabase/Postgres/RLS probados, membresías, relaciones, permisos, consentimientos, auditoría y migraciones.
**G2 — Conversation & Case:** backend elegido, Chatwoot u otro, mensajes reales en sandbox, SLA, knowledge, tickets, receipts.
**G3 — Resolution Contracts:** objetivos verificables, commitments, handoff, reconciliación y QA.
**G4 — Customer Success:** onboarding, planes, health con cobertura, journey twin y valor realizado.
**G5 — Omnichannel:** email, WhatsApp, voz, avatar, canales sociales, portales y control de frecuencia.
**G6 — Service Economics:** costes, dotación, resultados, experimentos y decisiones.
**G7 — Agentic Relationship Office:** LAIA, twins, SOPs, bridge con padre, cooperación entre repos y experiencia audiovisual.
**G8 — Safety & Evaluation Factory:** suites de trayectorias, red teaming, privacidad, rollback, observabilidad y operación real.
**G9 — Concept V2:** revisión con evidencia de clientes, nuevos papers, cambios de canales y tecnología.

**Conservar las 42 campañas actuales.** En una revisión posterior, mapear cada CLIxx a campaña, contrato, módulo, test, gate y fuente. Los informes de implementación y los resultados NOT_VERIFIED/BLOCKED se mantienen como evidencia; este documento no los convierte en PASS.

## 10. Hipótesis y preguntas abiertas

1. ¿Qué señales predicen resolución real mejor que tiempo de respuesta? [H]
2. ¿Cómo medir satisfacción sin confundir ausencia de quejas con éxito? [H]
3. ¿Qué memoria mínima mejora servicio sin crear vigilancia comercial? [H]
4. ¿Qué procesos deben ser locales y cuáles delegarse a Chatwoot/Twenty/Frappe? [D]
5. ¿Cómo demostrar que un cierre automático produjo el resultado deseado? [D]
6. ¿Qué técnicas de identidad evitan falsos merges sin impedir experiencias fluidas? [H]
7. ¿Cómo evaluar la calidad de una conversación multimodal de forma reproducible? [H]
8. ¿Qué políticas de autonomía producen mayor valor sin aumentar errores graves? [H]
9. ¿Qué intervenciones de customer success tienen impacto incremental comprobable? [H]
10. ¿Cómo conciliar memoria histórica y derechos de supresión? [D]
11. ¿Cómo se mantienen las ACL en búsquedas semánticas, resúmenes y caches? [D]
12. ¿Qué parte del valor de una relación puede medirse sin reducirla a una cifra? [H]
13. ¿Cómo proteger al cliente de persuasión manipulativa cuando la IA conoce su historial? [D]
14. ¿Qué acuerdos de servicio hacen viable la operación híbrida humano/agente? [D]

Cada pregunta exige responsable, método, evidencia, coste, fecha y decisión versionada. Una hipótesis no es una promesa comercial.

## 11. Fuentes y límites de esta edición

### Documentación propia inspeccionada
- [README](../../README.md)
- [Producto y límites](../01-producto-y-limites.md)
- [Investigación y decisiones](../02-investigacion-y-decisiones.md)
- [Referentes y brechas](../03-referentes-y-brechas.md)
- [Repos y adaptadores](../04-repos-y-adaptadores.md)
- [Arquitectura](../architecture/01-arquitectura.md)
- [Contratos](../contracts/01-contratos.md)
- [Informe de implementación](../release/IMPLEMENTATION-REPORT.md)
- [ADTC](../../src/contracts/adtc.ts)

### Referencias públicas técnicas y científicas
- tau2-bench: https://github.com/sierra-research/tau2-bench
- CRMArena: https://github.com/SalesforceAIResearch/CRMArena
- AgentDojo: https://github.com/ethz-spylab/agentdojo
- Chatwoot: https://github.com/chatwoot/chatwoot
- Twenty: https://github.com/twentyhq/twenty
- Frappe CRM: https://github.com/frappe/crm
- Frappe Helpdesk: https://github.com/frappe/helpdesk
- Zammad: https://github.com/zammad/zammad
- OpenTelemetry: https://opentelemetry.io/
- RGPD: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Reglamento IA: https://eur-lex.europa.eu/eli/reg/2024/1689/oj

**Límite explícito:** síntesis conceptual profunda apoyada en investigación previa del repositorio y documentación de arquitectura/código inspeccionada. No se ha ejecutado un benchmark externo, auditado cada proveedor, validado sus APIs en vivo ni realizado una revisión sistemática de todos los papers. Las capacidades de terceros deben verificarse por fecha, edición, contrato y licencia antes de integrarse. La ambición conceptual no es evidencia de implementación.

## 12. Política de evolución

Esta V1.0 es un mapa maestro, **no un techo definitivo**. Las V1.x pueden ampliar investigación, fichas y evidencias; la V2 podrá cambiar la ontología y el producto tras aprendizaje real. El diseño no debe ajustarse a las limitaciones del código actual: las brechas se registran, se priorizan y se resuelven con pruebas. La continuidad del concepto exige preservar historia, decisiones y fuentes.
