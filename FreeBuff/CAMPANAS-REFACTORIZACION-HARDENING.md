# FreeBuff — 12 campañas ultragranulares de refactorización y construcción

Repositorio `uniscrolliabrain-cloud/agntia-clientes`; baseline observado: **DOCUMENTATION_ONLY, 42 campañas no ejecutadas**. Estado: PLANIFICADO, NO EJECUTADO. Este repo no debe considerarse hardenizado por existir esta documentación. Primera vertical: ticket → evidencia → borrador → aprobación → sink → cierre. No editar /agente, gestoría, otros repos ni servicios externos. El objetivo es un middleware interno probado, no producción.

## Lectura obligatoria

README, AGENTS si existe, docs/campaigns/README.md, campaign.json, arquitectura, contratos, seguridad, investigación, releases, pruebas, CI, package manifests y HEAD. Las rutas propuestas a continuación son orientativas: antes de escribir registrar archivos existentes, crear un patchset de rutas reales y mantener el historial. En DOCUMENTATION_ONLY, comenzar por código mínimo funcional, no refactorizar código imaginario.

## Secuencia de 12 campañas (gates independientes)

### FB-01 — Baseline y matriz 42 fases

**Objetivo:** Leer árbol, README, campaign.json, estado real, scripts, pruebas; ejecutar baseline sin editar; identificar gaps.

**Dominio:** contactos. **Amenaza a ensayar:** PII.

1. Crear rama `freebuff/fb-01` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **contactos** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **PII**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-01-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** contactos verificable con fixture sintético, negativa PII bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-02 — Toolchain y paquete

**Objetivo:** Crear package.json/tsconfig/lock/pnpm workspace según realidad; Hono/Zod, lint strict, test, CI, sin dependencias innecesarias.

**Dominio:** inbox. **Amenaza a ensayar:** cross-tenant.

1. Crear rama `freebuff/fb-02` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **inbox** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **cross-tenant**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-02-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** inbox verificable con fixture sintético, negativa cross-tenant bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-03 — Identidad y Supabase

**Objetivo:** Verificar JWT con JWKS/issuer/audience/exp; membresías ACL/RLS; twins vinculados a agente canónico; dos tenants.

**Dominio:** tickets. **Amenaza a ensayar:** RAG leakage.

1. Crear rama `freebuff/fb-03` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **tickets** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **RAG leakage**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-03-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** tickets verificable con fixture sintético, negativa RAG leakage bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-04 — Persistencia y contratos

**Objetivo:** SchemaVersion, migrations, tenant keys, unique idempotency, transactional outbox, audit append-only, backup.

**Dominio:** SLA. **Amenaza a ensayar:** envíos.

1. Crear rama `freebuff/fb-04` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **SLA** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **envíos**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-04-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** SLA verificable con fixture sintético, negativa envíos bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-05 — SOP executor

**Objetivo:** Policy deny-by-default, approvals, retries, leases/fencing, DLQ, snapshots, replay, receipts y correlación.

**Dominio:** KB/RAG ACL. **Amenaza a ensayar:** SLA ficticios.

1. Crear rama `freebuff/fb-05` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **KB/RAG ACL** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **SLA ficticios**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-05-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** KB/RAG ACL verificable con fixture sintético, negativa SLA ficticios bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-06 — Vertical dominio

**Objetivo:** Implementar entidades, estados y transición del flujo real del negocio con fixtures sintéticos.

**Dominio:** respuestas. **Amenaza a ensayar:** PII.

1. Crear rama `freebuff/fb-06` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **respuestas** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **PII**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-06-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** respuestas verificable con fixture sintético, negativa PII bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-07 — Adaptadores

**Objetivo:** Ports mocks primero, provider allowlist, timeout, circuit breaker, cuotas, rate limit y error taxonomy.

**Dominio:** onboarding. **Amenaza a ensayar:** cross-tenant.

1. Crear rama `freebuff/fb-07` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **onboarding** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **cross-tenant**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-07-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** onboarding verificable con fixture sintético, negativa cross-tenant bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-08 — SDK y Hono

**Objetivo:** Cliente TS, API cerrada, herramientas agénticas read/propose con grants one-use; sin proxy genérico.

**Dominio:** CSAT. **Amenaza a ensayar:** RAG leakage.

1. Crear rama `freebuff/fb-08` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **CSAT** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **RAG leakage**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-08-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** CSAT verificable con fixture sintético, negativa RAG leakage bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-09 — UX y observabilidad

**Objetivo:** Portal responsive accesible, approval inbox, estados de error, OTel, métricas, redacción PII.

**Dominio:** contactos. **Amenaza a ensayar:** envíos.

1. Crear rama `freebuff/fb-09` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **contactos** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **envíos**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-09-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** contactos verificable con fixture sintético, negativa envíos bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-10 — Hardening adversarial

**Objetivo:** Cross-tenant, prompt injection, SSRF, XSS, race, replay, fuzz, caída y revocación.

**Dominio:** inbox. **Amenaza a ensayar:** SLA ficticios.

1. Crear rama `freebuff/fb-10` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **inbox** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **SLA ficticios**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-10-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** inbox verificable con fixture sintético, negativa SLA ficticios bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-11 — Doppler-ready

**Objetivo:** Inventario variables sin valores, config.example, secret-provider server-side, fail-closed, rotación.

**Dominio:** tickets. **Amenaza a ensayar:** PII.

1. Crear rama `freebuff/fb-11` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **tickets** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **PII**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-11-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** tickets verificable con fixture sintético, negativa PII bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

### FB-12 — Release y handoff

**Objetivo:** SBOM/licencias, CI, runbook, restore, E2E, paquete y propuesta integración /agente no aplicada.

**Dominio:** SLA. **Amenaza a ensayar:** cross-tenant.

1. Crear rama `freebuff/fb-12` desde HEAD main limpio; registrar SHA y comprobar que la fase no está ya implementada.
2. Leer código y contratos pertinentes; preparar tabla de capacidades PRESENTE/PARCIAL/AUSENTE, con paths y pruebas, y cotejar con las 42 campañas antiguas.
3. Definir contratos Zod de entrada/salida, actor, tenant, resource, schemaVersion, correlationId, causationId, approvalId, idempotencyKey; los campos de identidad se derivan de sesión verificada, nunca del modelo.
4. Escribir o modificar el mínimo patchset coherente en módulos reales `src/contracts`, `src/domain`, `src/runtime`, `src/adapters`, `src/api`, `tests` (crear solo lo necesario). Separar ports/implementations y denegar por defecto.
5. Implementar caso válido de **SLA** y cinco negativos: credencial inválida, otro tenant, recurso no autorizado, replay, input malformado; añadir caso especial **cross-tenant**.
6. Añadir prueba de caída de proveedor, timeout, retry concurrente, rollback y duplicación de eventos/efectos; no publicar ni enviar a terceros.
7. Ejecutar scripts reales de lint, typecheck, build, unit, integration, contract y E2E disponibles; registrar comandos, exit codes, tests pasados/fallidos/omitidos y SHA.
8. Actualizar README/ADR/contratos/runbook, añadir `FreeBuff/reportes/FB-12-REPORT.md` con archivos exactos, pruebas, riesgos, decisiones, rollback, bloqueos y estado PASS/PARTIAL/FAIL/BLOCKED; solicitar revisión Codex y gate antes de continuar.

**Gate:** SLA verificable con fixture sintético, negativa cross-tenant bloqueada, dos tenants aislados, sin side effects reales; no avanzar con fallo crítico.

## Vertical E2E obligatoria

ticket → evidencia → borrador → aprobación → sink → cierre. Usar dos tenants, dos actores humanos y twins delegados; ningún envío real. Mantener estado, audit log, idempotencia, approval, receipt y outbox con consumidor que tolera reentregas.

## Contratos de referencia

```ts
import { z } from 'zod';
export const Command = z.object({schemaVersion:z.literal(1), tenantId:z.string(), actorId:z.string(), resourceId:z.string(), correlationId:z.string().uuid(), idempotencyKey:z.string().min(8), capability:z.string(), payload:z.unknown()}).strict();
// tenantId/actorId de Command se comparan con principal verificado; nunca autorizan por sí solos.
// UNIQUE(tenant_id, capability, idempotency_key); RLS USING/WITH CHECK; outbox en misma transacción.
```

## Preinstalación Doppler / padre

Crear `FreeBuff/DOPPLER-READY.md` con variables (nombre, owner, uso, sensibilidad, entorno dev/stg/prod, rotación, validación, fallback), sin valores secretos; `.env.example` inocuo, secret-provider server-only y arranque fail-closed. Crear `FreeBuff/INTEGRATION-AGENTE-PROPOSAL.md` con paquete, SDK/Hono, tools, JWT, twins, schemas, outbox, tests y rollback. No instalar Doppler ni tocar /agente sin aprobación.

## Reporte final

`FreeBuff/FOUNDER-FINAL-REPORT.md`: 12 reportes, SHAs/PRs, correspondencia 42 campañas, matriz de capacidades y pruebas, deuda P0/P1/P2, SBOM, licencias, costes, restore y recomendación de gate de integración. No declarar producción ni hardening completo si no se ha verificado.
