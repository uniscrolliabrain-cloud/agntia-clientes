# Campaña de42 fases: agntia-clientes

Diseño ejecutable por otra IA, pendiente de implementación. **42 campañas,294 tareas,84 escenarios de gate; NOT_STARTED/NOT_EXECUTED.** Avanzar secuencialmente tras verificar cada gate. Checkpoints después de cada cinco y de las dos finales. No se promete que42 fases se terminen en siete días.

El [manifest](campaign.json) contiene IDs/dependencias, tareas/aceptación, fuentes, artefactos propuestos y riesgos. Cada documento aporta trabajo específico; las reglas transversales no reemplazan sus pruebas. Supabase, twin canónico y trazabilidad son obligatorios en todas las fases. No modificar agente.

| Fase | Campaña | Estado | Checkpoint |
|---|---|---|---|
| 01 | [Baseline y perímetro de solo lectura](01-baseline-y-perimetro-de-solo-lectura.md) | NOT_STARTED | — |
| 02 | [Modelo de dominio y autoridad](02-modelo-de-dominio-y-autoridad.md) | NOT_STARTED | — |
| 03 | [Autenticación Supabase y principal](03-autenticacion-supabase-y-principal.md) | NOT_STARTED | — |
| 04 | [Twin y trazabilidad nativa](04-twin-y-trazabilidad-nativa.md) | NOT_STARTED | — |
| 05 | [DTOs y contratos runtime](05-dtos-y-contratos-runtime.md) | NOT_STARTED | Informe |
| 06 | [Postgres, RLS y migraciones](06-postgres-rls-y-migraciones.md) | NOT_STARTED | — |
| 07 | [Finalidades, preferencias y permisos de comunicación](07-finalidades-preferencias-y-permisos-de-comunicacion.md) | NOT_STARTED | — |
| 08 | [Acuerdos, entitlements y encargos](08-acuerdos-entitlements-y-encargos.md) | NOT_STARTED | — |
| 09 | [Registro de proveedores, OAuth y secretos](09-registro-de-proveedores-oauth-y-secretos.md) | NOT_STARTED | — |
| 10 | [Discovery y capacidades verificadas](10-discovery-y-capacidades-verificadas.md) | NOT_STARTED | Informe |
| 11 | [Directorio y resolución de identidad](11-directorio-y-resolucion-de-identidad.md) | NOT_STARTED | — |
| 12 | [Importación, staging y sync](12-importacion-staging-y-sync.md) | NOT_STARTED | — |
| 13 | [Chatwoot lectura y bindings](13-chatwoot-lectura-y-bindings.md) | NOT_STARTED | — |
| 14 | [Chatwoot writeback seguro](14-chatwoot-writeback-seguro.md) | NOT_STARTED | — |
| 15 | [CRM Twenty opcional](15-crm-twenty-opcional.md) | NOT_STARTED | Informe |
| 16 | [Frappe CRM y Helpdesk alternativos](16-frappe-crm-y-helpdesk-alternativos.md) | NOT_STARTED | — |
| 17 | [Zammad y portabilidad de helpdesk](17-zammad-y-portabilidad-de-helpdesk.md) | NOT_STARTED | — |
| 18 | [Canal web y sesiones de contacto](18-canal-web-y-sesiones-de-contacto.md) | NOT_STARTED | — |
| 19 | [Correo transaccional y threading](19-correo-transaccional-y-threading.md) | NOT_STARTED | — |
| 20 | [WhatsApp oficial bajo capacidad confirmada](20-whatsapp-oficial-bajo-capacidad-confirmada.md) | NOT_STARTED | Informe |
| 21 | [Inbox, webhooks y evidencia adjunta](21-inbox-webhooks-y-evidencia-adjunta.md) | NOT_STARTED | — |
| 22 | [Casos y contrato de resolución](22-casos-y-contrato-de-resolucion.md) | NOT_STARTED | — |
| 23 | [SLA, calendario y routing determinista](23-sla-calendario-y-routing-determinista.md) | NOT_STARTED | — |
| 24 | [Conocimiento versionado y RAG autorizado](24-conocimiento-versionado-y-rag-autorizado.md) | NOT_STARTED | — |
| 25 | [Propuestas IA, idiomas y verificación](25-propuestas-ia-idiomas-y-verificacion.md) | NOT_STARTED | Informe |
| 26 | [Preview y aprobaciones de efecto](26-preview-y-aprobaciones-de-efecto.md) | NOT_STARTED | — |
| 27 | [Jobs, outbox y reconciliación](27-jobs-outbox-y-reconciliacion.md) | NOT_STARTED | — |
| 28 | [Handoff humano y coordinación](28-handoff-humano-y-coordinacion.md) | NOT_STARTED | — |
| 29 | [Onboarding y playbooks de servicio](29-onboarding-y-playbooks-de-servicio.md) | NOT_STARTED | — |
| 30 | [Customer success y señales explicables](30-customer-success-y-senales-explicables.md) | NOT_STARTED | Informe |
| 31 | [Renovaciones, reclamaciones y propuestas comerciales](31-renovaciones-reclamaciones-y-propuestas-comerciales.md) | NOT_STARTED | — |
| 32 | [Anam como presencia del twin](32-anam-como-presencia-del-twin.md) | NOT_STARTED | — |
| 33 | [Portal responsive y revisión humana](33-portal-responsive-y-revision-humana.md) | NOT_STARTED | — |
| 34 | [SDK TypeScript, Hono y tools nominadas](34-sdk-typescript-hono-y-tools-nominadas.md) | NOT_STARTED | — |
| 35 | [Bridge del padre y eventos interoperables](35-bridge-del-padre-y-eventos-interoperables.md) | NOT_STARTED | Informe |
| 36 | [Observabilidad, métricas y reportes](36-observabilidad-metricas-y-reportes.md) | NOT_STARTED | — |
| 37 | [Costes, cuotas y backpressure](37-costes-cuotas-y-backpressure.md) | NOT_STARTED | — |
| 38 | [Derechos, retención y salida del servicio](38-derechos-retencion-y-salida-del-servicio.md) | NOT_STARTED | — |
| 39 | [Seguridad adversarial y aislamiento](39-seguridad-adversarial-y-aislamiento.md) | NOT_STARTED | — |
| 40 | [Evaluaciones y vertical E2E reproducible](40-evaluaciones-y-vertical-e2e-reproducible.md) | NOT_STARTED | Informe |
| 41 | [Operaciones, CI y release controlada](41-operaciones-ci-y-release-controlada.md) | NOT_STARTED | — |
| 42 | [Aceptación, informe y entrega a otra IA](42-aceptacion-informe-y-entrega-a-otra-ia.md) | NOT_STARTED | Informe |

## Orden y disciplina

C01–C10 fijan baseline, dominio, Supabase/twins, contratos, almacenamiento, permisos y conexiones. C11–C20 construyen directorio, sincronización y canales con autoridad única. C21–C30 desarrollan evidencia, casos, SLA, conocimiento, propuestas y customer success. C31–C40 completan procesos sensibles como propuestas, presencia/UI, interfaces, observabilidad, coste, privacidad, seguridad y E2E. C41–C42 preparan operación y aceptación.

Todas las rutas de artefactos son propuestas para la implementación futura. Si un proveedor no puede probarse, documentar el bloqueo y no habilitarlo; el trabajo documental actual sigue siendo una entrega válida sin afirmar que el producto existe. Una suite fake no convierte un gate real en PASS.

El reporte de checkpoint contiene: SHA/diff, fases PASS/BLOCKED/NOT_VERIFIED, tests realmente ejecutados/pasados/fallidos/skipped, capacidades habilitadas y prohibidas, fallos preexistentes, costes, evidencias sanitizadas, riesgos y siguiente dependencia. Nunca borrar historia para aparentar rollback o consultar datos de clientes reales para demostrar cobertura.
