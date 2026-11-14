# FreeBuff — handoff reconciliado con código real de Agntia Clientes

**Fecha:** 2026-11-14 · **Estado:** PLAN DE REVISIÓN Y REFACCIÓN / NO EJECUTADO POR ESTE DOCUMENTO.

## Estado Git y fuentes de verdad

La rama `freebuff/e328a674df54fe15e5536cde` está **contenida en main** (comparación ahead=0, behind=1). Las PR #1 y #2 incorporaron factory prep y programa completo; la PR #3 fue abierta para código Freebuff y el usuario ha resuelto el conflicto posteriormente. **No reabrir ni re-fusionar esta rama, no resetear main, no reconstruir scaffolding.** Fijar SHA de main y confirmar PR #3/CI en GitHub al iniciar.

El repositorio contiene `package.json`, `src/app/http.ts` (Hono), `src/contracts/adtc.ts`, `src/auth/`, `src/domain/`, `src/jobs/`, `src/ports/`, `src/bridge/`, `src/observability/`, `test/`, migraciones, SDK, portal y `docs/campaigns/reports/C01..C42.md`. **El código existe**. No confundir el manifest original (todas las tareas NOT_STARTED) con los anexos posteriores de ejecución. Fuente de implementación: `docs/release/IMPLEMENTATION-REPORT.md`, `docs/implementation/FACTORY-RECONCILIATION.md`, `docs/implementation/CAPABILITY-MATRIX.md`, `docs/campaigns/reports/README.md`, código real y pruebas. Fuente de alcance: 42 campañas originales, `docs/campaigns/campaign.json`, `docs/execution-program/campaigns/001..042/CAMPAIGN.md`, arquitectura y contratos.

**Evidencia declarada por Freebuff, no reejecutada aquí:** `npm run typecheck` OK; `npm test` 96/96; `npm run eval` 9/9; 42 anexos. Anexo README dice 87/87 y README principal 87 tests, discrepancia documental frente al informe 96/96: comprobar tests en HEAD y corregir solo tras medir. 30 fases PASS (tests locales), 8 NOT_VERIFIED y 4 BLOCKED. Ninguna integración con Postgres real, proveedor real, bridge padre ni browser validada; CI GitHub no verificada en el informe. No declarar production-ready.

## Prioridades: preservar 30 fases PASS y resolver 12 pendientes

### CLI-C01 — Baseline y perímetro de solo lectura · PASS

**Documentos obligatorios:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/execution-program/campaigns/001/CAMPAIGN.md`, `docs/campaigns/reports/C01.md`. **Dependencias:** ninguna. **Invariante:** No cambiar agente; ninguna capacidad documental cuenta como implementada..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C01-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C02 — Modelo de dominio y autoridad · PASS

**Documentos obligatorios:** `docs/campaigns/02-modelo-de-dominio-y-autoridad.md`, `docs/execution-program/campaigns/002/CAMPAIGN.md`, `docs/campaigns/reports/C02.md`. **Dependencias:** CLI-C01. **Invariante:** Contact, CustomerOrganization, tenant y User no son equivalentes..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C02-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C03 — Autenticación Supabase y principal · PASS

**Documentos obligatorios:** `docs/campaigns/03-autenticacion-supabase-y-principal.md`, `docs/execution-program/campaigns/003/CAMPAIGN.md`, `docs/campaigns/reports/C03.md`. **Dependencias:** CLI-C02. **Invariante:** Un JWT válido no concede acceso sin membresía y scope del recurso..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C03-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C04 — Twin y trazabilidad nativa · PASS

**Documentos obligatorios:** `docs/campaigns/04-twin-y-trazabilidad-nativa.md`, `docs/execution-program/campaigns/004/CAMPAIGN.md`, `docs/campaigns/reports/C04.md`. **Dependencias:** CLI-C03. **Invariante:** Persona, rol y runtime conservan identidades distintas; ningún twin se autoautoriza..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C04-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C05 — DTOs y contratos runtime · PASS

**Documentos obligatorios:** `docs/campaigns/05-dtos-y-contratos-runtime.md`, `docs/execution-program/campaigns/005/CAMPAIGN.md`, `docs/campaigns/reports/C05.md`. **Dependencias:** CLI-C04. **Invariante:** DTO del servicio y tipo nativo del padre se versionan y mapean explícitamente..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C05-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C06 — Postgres, RLS y migraciones · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/06-postgres-rls-y-migraciones.md`, `docs/execution-program/campaigns/006/CAMPAIGN.md`, `docs/campaigns/reports/C06.md`. **Dependencias:** CLI-C05. **Invariante:** Toda relación y operación persistida conserva scope; un rol privilegiado no elude policy..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/db/`, `src/auth/`, `migrations/`, `test/`.

**Delta técnico específico:** Provisionar Postgres/Supabase de laboratorio solo tras autorización; ejecutar migrations/rollback, políticas RLS con roles reales y FKs compuestas; test de SELECT/INSERT/UPDATE/DELETE, storage, jobs, cross-tenant y pool reuse; guardar EXPLAIN y evidencia.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C06-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C07 — Finalidades, preferencias y permisos de comunicación · PASS

**Documentos obligatorios:** `docs/campaigns/07-finalidades-preferencias-y-permisos-de-comunicacion.md`, `docs/execution-program/campaigns/007/CAMPAIGN.md`, `docs/campaigns/reports/C07.md`. **Dependencias:** CLI-C06. **Invariante:** Un ticket o consentimiento AV no autoriza marketing ni entrenamiento..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C07-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C08 — Acuerdos, entitlements y encargos · PASS

**Documentos obligatorios:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/execution-program/campaigns/008/CAMPAIGN.md`, `docs/campaigns/reports/C08.md`. **Dependencias:** CLI-C07. **Invariante:** Contrato comercial, aprobación editorial y permiso de datos son hechos diferentes..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C08-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C09 — Registro de proveedores, OAuth y secretos · PASS

**Documentos obligatorios:** `docs/campaigns/09-registro-de-proveedores-oauth-y-secretos.md`, `docs/execution-program/campaigns/009/CAMPAIGN.md`, `docs/campaigns/reports/C09.md`. **Dependencias:** CLI-C08. **Invariante:** El agente nunca elige baseURL, token, método o workspace remoto libremente..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C09-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C10 — Discovery y capacidades verificadas · PASS

**Documentos obligatorios:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/execution-program/campaigns/010/CAMPAIGN.md`, `docs/campaigns/reports/C10.md`. **Dependencias:** CLI-C09. **Invariante:** Documented no equivale a supported_runtime; unknown permanece deshabilitado..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C10-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C11 — Directorio y resolución de identidad · BLOCKED

**Documentos obligatorios:** `docs/campaigns/11-directorio-y-resolucion-de-identidad.md`, `docs/execution-program/campaigns/011/CAMPAIGN.md`, `docs/campaigns/reports/C11.md`. **Dependencias:** CLI-C10. **Invariante:** Coincidencia de nombre, email o teléfono no prueba identidad/autorización..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/domain/`, `src/contacts/`, `src/app/`, `test/`.

**Delta técnico específico:** Implementar resolución de identidad con alias por canal, homónimos, normalización y merge reversible con aprobación, auditoría y CAS; tests de falsos positivos y reconstrucción. No fusionar personas reales.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C11-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C12 — Importación, staging y sync · BLOCKED

**Documentos obligatorios:** `docs/campaigns/12-importacion-staging-y-sync.md`, `docs/execution-program/campaigns/012/CAMPAIGN.md`, `docs/campaigns/reports/C12.md`. **Dependencias:** CLI-C11. **Invariante:** Importar no crea membresía, consentimiento ni estado revisado automáticamente..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/import/`, `src/jobs/`, `src/ports/`, `test/`.

**Delta técnico específico:** Staging CSV/JSON, validación Zod por fila, preview/dry-run, dedupe, cursor/checkpoint, rollback, reintentos, cuarentena y permisos; fixtures maliciosos y 2 tenants; no importar clientes reales.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C12-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C13 — Chatwoot lectura y bindings · PASS

**Documentos obligatorios:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/execution-program/campaigns/013/CAMPAIGN.md`, `docs/campaigns/reports/C13.md`. **Dependencias:** CLI-C12. **Invariante:** account_id/inbox_id no se equiparan con tenantId del servicio..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C13-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C14 — Chatwoot writeback seguro · PASS

**Documentos obligatorios:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/execution-program/campaigns/014/CAMPAIGN.md`, `docs/campaigns/reports/C14.md`. **Dependencias:** CLI-C13. **Invariante:** Crear una fila de mensaje no prueba entrega ni autoriza retry..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C14-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C15 — CRM Twenty opcional · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/15-crm-twenty-opcional.md`, `docs/execution-program/campaigns/015/CAMPAIGN.md`, `docs/campaigns/reports/C15.md`. **Dependencias:** CLI-C14. **Invariante:** No hay un schema Twenty universal ni permiso para Metadata API del agente..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/adapters/`, `src/ports/`, `test/`.

**Delta técnico específico:** Discovery de versión/esquema Twenty y workspace, mappings y CAS If-Match; capability gating y fixtures; live probe solo en sandbox aprobado.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C15-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C16 — Frappe CRM y Helpdesk alternativos · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`, `docs/execution-program/campaigns/016/CAMPAIGN.md`, `docs/campaigns/reports/C16.md`. **Dependencias:** CLI-C15. **Invariante:** Un solo responsable del estado y reloj SLA por caso..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/adapters/`, `src/ports/`, `test/`.

**Delta técnico específico:** Discovery de Frappe CRM/Helpdesk, DocTypes y permisos; read/write explícitos, no RPC genérico, version pinning y fixtures.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C16-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C17 — Zammad y portabilidad de helpdesk · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/17-zammad-y-portabilidad-de-helpdesk.md`, `docs/execution-program/campaigns/017/CAMPAIGN.md`, `docs/campaigns/reports/C17.md`. **Dependencias:** CLI-C16. **Invariante:** Grupos de helpdesk no demuestran aislamiento tenant fuerte sin pruebas..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/adapters/`, `src/ports/`, `test/`.

**Delta técnico específico:** Zammad por instancia/tenant, scopes, attachment ACL, reconciliación, drift de schema y capability report.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C17-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C18 — Canal web y sesiones de contacto · PASS

**Documentos obligatorios:** `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`, `docs/execution-program/campaigns/018/CAMPAIGN.md`, `docs/campaigns/reports/C18.md`. **Dependencias:** CLI-C17. **Invariante:** Ingreso público acotado no crea membership ni identidad verificada del cliente..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C18-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C19 — Correo transaccional y threading · PASS

**Documentos obligatorios:** `docs/campaigns/19-correo-transaccional-y-threading.md`, `docs/execution-program/campaigns/019/CAMPAIGN.md`, `docs/campaigns/reports/C19.md`. **Dependencias:** CLI-C18. **Invariante:** accepted, delivered, bounced y resolved son estados diferentes..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C19-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C20 — WhatsApp oficial bajo capacidad confirmada · BLOCKED

**Documentos obligatorios:** `docs/campaigns/20-whatsapp-oficial-bajo-capacidad-confirmada.md`, `docs/execution-program/campaigns/020/CAMPAIGN.md`, `docs/campaigns/reports/C20.md`. **Dependencias:** CLI-C19. **Invariante:** No usar versión heredada o regla de ventana recordada sin revalidación actual..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/adapters/`, `src/ports/`, `test/`.

**Delta técnico específico:** Revalidar Meta Cloud API, versión, permisos, templates, opt-in, ventanas, 429, webhook signature, receipts, rate limit y sandbox; no habilitar envíos sin cuenta autorizada.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C20-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C21 — Inbox, webhooks y evidencia adjunta · PASS

**Documentos obligatorios:** `docs/campaigns/21-inbox-webhooks-y-evidencia-adjunta.md`, `docs/execution-program/campaigns/021/CAMPAIGN.md`, `docs/campaigns/reports/C21.md`. **Dependencias:** CLI-C20. **Invariante:** Contenido entrante nunca altera identidad, policy o catálogo de tools..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C21-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C22 — Casos y contrato de resolución · PASS

**Documentos obligatorios:** `docs/campaigns/22-casos-y-contrato-de-resolucion.md`, `docs/execution-program/campaigns/022/CAMPAIGN.md`, `docs/campaigns/reports/C22.md`. **Dependencias:** CLI-C21. **Invariante:** Responder, cerrar por silencio y resolver con evidencia no son equivalentes..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C22-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C23 — SLA, calendario y routing determinista · PASS

**Documentos obligatorios:** `docs/campaigns/23-sla-calendario-y-routing-determinista.md`, `docs/execution-program/campaigns/023/CAMPAIGN.md`, `docs/campaigns/reports/C23.md`. **Dependencias:** CLI-C22. **Invariante:** El LLM no inventa fechas de vencimiento ni cobertura humana..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C23-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C24 — Conocimiento versionado y RAG autorizado · PASS

**Documentos obligatorios:** `docs/campaigns/24-conocimiento-versionado-y-rag-autorizado.md`, `docs/execution-program/campaigns/024/CAMPAIGN.md`, `docs/campaigns/reports/C24.md`. **Dependencias:** CLI-C23. **Invariante:** No se recuperan chunks de otro tenant ni se publica conocimiento por inferencia..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C24-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C25 — Propuestas IA, idiomas y verificación · PASS

**Documentos obligatorios:** `docs/campaigns/25-propuestas-ia-idiomas-y-verificacion.md`, `docs/execution-program/campaigns/025/CAMPAIGN.md`, `docs/campaigns/reports/C25.md`. **Dependencias:** CLI-C24. **Invariante:** Verificación LLM no firma ni autoriza el efecto..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C25-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C26 — Preview y aprobaciones de efecto · PASS

**Documentos obligatorios:** `docs/campaigns/26-preview-y-aprobaciones-de-efecto.md`, `docs/execution-program/campaigns/026/CAMPAIGN.md`, `docs/campaigns/reports/C26.md`. **Dependencias:** CLI-C25. **Invariante:** El actor proponente no puede fabricar aprobación o ampliar el alcance aprobado..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C26-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C27 — Jobs, outbox y reconciliación · PASS

**Documentos obligatorios:** `docs/campaigns/27-jobs-outbox-y-reconciliacion.md`, `docs/execution-program/campaigns/027/CAMPAIGN.md`, `docs/campaigns/reports/C27.md`. **Dependencias:** CLI-C26. **Invariante:** No reintentar una escritura incierta sin resolver su estado remoto..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C27-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C28 — Handoff humano y coordinación · PASS

**Documentos obligatorios:** `docs/campaigns/28-handoff-humano-y-coordinacion.md`, `docs/execution-program/campaigns/028/CAMPAIGN.md`, `docs/campaigns/reports/C28.md`. **Dependencias:** CLI-C27. **Invariante:** Emitir un evento no acredita recepción ni trabajo realizado..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C28-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C29 — Onboarding y playbooks de servicio · PASS

**Documentos obligatorios:** `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`, `docs/execution-program/campaigns/029/CAMPAIGN.md`, `docs/campaigns/reports/C29.md`. **Dependencias:** CLI-C28. **Invariante:** Un hito se completa con evidencia/aceptación, no por una frase del agente..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C29-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C30 — Customer success y señales explicables · PASS

**Documentos obligatorios:** `docs/campaigns/30-customer-success-y-senales-explicables.md`, `docs/execution-program/campaigns/030/CAMPAIGN.md`, `docs/campaigns/reports/C30.md`. **Dependencias:** CLI-C29. **Invariante:** Missing no es cero; un score es una ayuda explicable, no una decisión significativa autónoma..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C30-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C31 — Renovaciones, reclamaciones y propuestas comerciales · BLOCKED

**Documentos obligatorios:** `docs/campaigns/31-renovaciones-reclamaciones-y-propuestas-comerciales.md`, `docs/execution-program/campaigns/031/CAMPAIGN.md`, `docs/campaigns/reports/C31.md`. **Dependencias:** CLI-C30. **Invariante:** Proponer renovación/reembolso no equivale a contratar/pagar/aceptar responsabilidad..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/domain/`, `src/contracts/`, `src/ports/`, `test/`.

**Delta técnico específico:** Renovación/reclamación/propuesta comercial: contratos no vinculantes, estado, expiración, pricing fuente, approvals, operador externo y no pagos/firmas; pruebas negativas.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C31-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C32 — Anam como presencia del twin · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/32-anam-como-presencia-del-twin.md`, `docs/execution-program/campaigns/032/CAMPAIGN.md`, `docs/campaigns/reports/C32.md`. **Dependencias:** CLI-C31. **Invariante:** Token Anam no es JWT Supabase ni prueba de aprobación humana..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/presence/`, `src/app/`, `test/`.

**Delta técnico específico:** Anam: capability y token server-only, coste y cuotas, consentimiento, fallback texto, desconexión y expiración; test 503 no configurado, integración real solo con autorización.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C32-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C33 — Portal responsive y revisión humana · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/33-portal-responsive-y-revision-humana.md`, `docs/execution-program/campaigns/033/CAMPAIGN.md`, `docs/campaigns/reports/C33.md`. **Dependencias:** CLI-C32. **Invariante:** La UI nunca convierte loading, accepted o closed en resolución verificada..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/app/ui.ts`, `src/app/http.ts`, `test/`.

**Delta técnico específico:** Playwright navegador real desktop/mobile, accesibilidad teclado/WCAG, escape HTML/XSS, roles, estados 403/404/409, approvals, i18n ES/EN/FR; no confundir render HTML con QA visual.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C33-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C34 — SDK TypeScript, Hono y tools nominadas · PASS

**Documentos obligatorios:** `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`, `docs/execution-program/campaigns/034/CAMPAIGN.md`, `docs/campaigns/reports/C34.md`. **Dependencias:** CLI-C33. **Invariante:** Todas las interfaces usan el mismo PEP y scopes; ninguna tool genérica aumenta autonomía..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C34-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C35 — Bridge del padre y eventos interoperables · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/35-bridge-del-padre-y-eventos-interoperables.md`, `docs/execution-program/campaigns/035/CAMPAIGN.md`, `docs/campaigns/reports/C35.md`. **Dependencias:** CLI-C34. **Invariante:** No aplicar wiring, cambios de enums o claims en agente sin otra autorización..

**Superficies a inventariar (no afirmar existencia sin inspección):** `src/bridge/host.ts`, `src/contracts/adtc.ts`, `src/auth/`, `test/`.

**Delta técnico específico:** Resolver discrepancia catálogo padre 12/16, congelar versión canónica, handshake JWT/mandato, revocación twin, correlation/causation ADTC, outbox, ack y replay; propuesta patchset padre SIN aplicar.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C35-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C36 — Observabilidad, métricas y reportes · PASS

**Documentos obligatorios:** `docs/campaigns/36-observabilidad-metricas-y-reportes.md`, `docs/execution-program/campaigns/036/CAMPAIGN.md`, `docs/campaigns/reports/C36.md`. **Dependencias:** CLI-C35. **Invariante:** Un dashboard no completa datos ausentes ni atribuye trabajo ficticio..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C36-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C37 — Costes, cuotas y backpressure · PASS

**Documentos obligatorios:** `docs/campaigns/37-costes-cuotas-y-backpressure.md`, `docs/execution-program/campaigns/037/CAMPAIGN.md`, `docs/campaigns/reports/C37.md`. **Dependencias:** CLI-C36. **Invariante:** Las bolsas Lite/L/XL son hipótesis hasta medir tarifas/volumen; nunca gasto implícito..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C37-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C38 — Derechos, retención y salida del servicio · PASS

**Documentos obligatorios:** `docs/campaigns/38-derechos-retencion-y-salida-del-servicio.md`, `docs/execution-program/campaigns/038/CAMPAIGN.md`, `docs/campaigns/reports/C38.md`. **Dependencias:** CLI-C37. **Invariante:** No se borra/exporta por una instrucción de chat sin identidad, alcance y revisión..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C38-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C39 — Seguridad adversarial y aislamiento · PASS

**Documentos obligatorios:** `docs/campaigns/39-seguridad-adversarial-y-aislamiento.md`, `docs/execution-program/campaigns/039/CAMPAIGN.md`, `docs/campaigns/reports/C39.md`. **Dependencias:** CLI-C38. **Invariante:** Una fuga cross-tenant, bypass o secreto detiene campaña y rollout..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C39-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C40 — Evaluaciones y vertical E2E reproducible · PASS

**Documentos obligatorios:** `docs/campaigns/40-evaluaciones-y-vertical-e2e-reproducible.md`, `docs/execution-program/campaigns/040/CAMPAIGN.md`, `docs/campaigns/reports/C40.md`. **Dependencias:** CLI-C39. **Invariante:** Mock y juez de lenguaje no sustituyen contrato de estado ni integración real..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C40-REGRESSION.md` con SHA, comandos, evidencia y rollback.

### CLI-C41 — Operaciones, CI y release controlada · NOT_VERIFIED

**Documentos obligatorios:** `docs/campaigns/41-operaciones-ci-y-release-controlada.md`, `docs/execution-program/campaigns/041/CAMPAIGN.md`, `docs/campaigns/reports/C41.md`. **Dependencias:** CLI-C40. **Invariante:** No desplegar producción ni comprar servicios sin aprobación específica del owner..

**Superficies a inventariar (no afirmar existencia sin inspección):** `.github/workflows/`, `package.json`, `docs/release/`, `test/`.

**Delta técnico específico:** Ejecutar GitHub Actions en SHA main, npm ci, typecheck, 96 tests, 9 E2E y negative suites; SBOM, licencias, escáner secretos, reproducibilidad, runbook restore/rollback, no afirmar CI por tests locales.

**Secuencia:** 1) fijar SHA y ejecutar test previo; 2) leer 7 tareas y 2 gates originales y anexo; 3) matriz code/contract/test/provider; 4) patchset mínimo en rutas verificadas, sin sobrescribir implementación; 5) test positivo, negativo cross-tenant y fallo/retry; 6) prueba del proveedor/infra solo si autorizado, sino NOT_VERIFIED/BLOCKED; 7) reporte `FreeBuff/reportes/CLI-C41-DELTA.md` con paths, diffs, comandos, exit codes, fixtures, gates y rollback; 8) revisión Codex y aceptación founder de efectos externos.

### CLI-C42 — Aceptación, informe y entrega a otra IA · PASS

**Documentos obligatorios:** `docs/campaigns/42-aceptacion-informe-y-entrega-a-otra-ia.md`, `docs/execution-program/campaigns/042/CAMPAIGN.md`, `docs/campaigns/reports/C42.md`. **Dependencias:** CLI-C41. **Invariante:** No llamar terminado a lo no implementado/probado ni ocultar gates bloqueados..

**Preservación:** código y tests locales marcados PASS por el anexo. Antes de modificar, comprobar regresión y correspondencia exacta de siete tareas y dos gates. No reescribir ni duplicar. Si aparece un fallo real, crear patchset de corrección acotado y `FreeBuff/reportes/CLI-C42-REGRESSION.md` con SHA, comandos, evidencia y rollback.

## Prompt maestro para Freebuff Cloud

> Trabajas en el **scaffolding integral ya implementado** de `uniscrolliabrain-cloud/agntia-clientes`. La rama de código está contenida en main: NO repetir las 42 fases desde cero, NO crear un MVP ni un nuevo framework paralelo. Primero lee el código, los 42 anexos, las 42 campañas originales, el programa de ejecución y la reconciliación factory. Ejecuta `git fetch --all --prune`, `git status`, `git rev-parse HEAD`, `npm ci`, `npm run typecheck`, `npm test`, `npm run eval` y `npm run reports` en entorno controlado; guarda SHA y logs. Reconcilia el desfase 87/96 tests con conteo real. Después trabaja prioritariamente en C06/C11/C12/C15/C16/C17/C20/C31/C32/C33/C35/C41, sin destruir las 30 fases PASS. Para cada fase, especifica archivos exactos, contratos, migraciones, pruebas negativas, gates y rollback, implementa en rama aislada, genera reporte, revisa con Codex y avanza solo con seguridad comprobada. Si faltan Supabase, credenciales, permisos o aceptación humana, mantén NOT_VERIFIED/BLOCKED y avanza únicamente tareas independientes. No cambiar `/agente`, gestoría ni otros repos; no enviar comunicaciones, publicar, desplegar, instalar proveedores ni crear Doppler sin aprobación. Al cerrar, entregar matriz 42×7 y 84 gates con evidencias, informe final, propuesta de integración al padre y preparación Doppler.

## Orden de ejecución diferencial

1. **Baseline y reconciliación**: HEAD, PR #3, CI, conteos de tests, 42 anexos, 42 campañas, versiones de Node y lockfile, security scan; `FreeBuff/reportes/00-BASELINE.md`.
2. **C06 y C03**: Postgres/RLS real en entorno aislado aprobado, JWT/JWKS/membership, roles y tenant isolation, migraciones y restore.
3. **C11 y C12**: resolver identidad, staging de importación, cursors y rollback; sin datos reales.
4. **C15/C16/C17/C20/C32**: discovery de proveedores por capacidades y pruebas sandbox; dejar deshabilitado lo no autorizado.
5. **C31**: contratos comerciales y reclamaciones sin ejecución financiera/jurídica.
6. **C33/C41**: Playwright accesibilidad, CI GitHub, supply chain, restore, runbooks y reportes.
7. **C35**: propuesta de binding canónico 12/16, puente de eventos y mandato, **sin editar el padre**.
8. **Regresión total**: 30 fases PASS + 12 pendientes, pruebas de dos tenants, no replay, no PII, no credenciales, no envíos, approval binding y audit.

## Doppler y propuesta de instalación

Crear `FreeBuff/DOPPLER-READY.md` con **solo nombres** de variables y propietarios, scopes, separación dev/stg/prod, referencias de secretos, política de rotación y validación fail-closed; no insertar valores ni crear proyecto. Crear `FreeBuff/INTEGRATION-AGENTE-PROPOSAL.md` con SDK/Hono, JWT, membership, twins, mandatos, AuthorityMap, ADTC `adtc/0.1`, outbox, receipts, health, tests y rollback; **no aplicar al padre**. Crear `FreeBuff/FOUNDER-FINAL-REPORT.md` con SHAs/PRs, CI real, cobertura de 42 campañas y 84 gates, bloqueos, coste, SBOM/licencias, restore, riesgos y recomendación de aceptación.

**Prohibición:** jamás degradar un bloqueo a PASS por mocks; nunca afirmar producción o despliegue. Esta revisión es documental y estática, no ha ejecutado CI ni proveedores.
