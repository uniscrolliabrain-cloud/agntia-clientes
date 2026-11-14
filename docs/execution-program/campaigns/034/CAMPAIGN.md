# CLI-C34 — SDK TypeScript, Hono y tools nominadas

**PROGRAMA INTEGRAL PREVIO / NOT_STARTED** · 34/42 · [fuente original](../../campaigns/34-sdk-typescript-hono-y-tools-nominadas.md). Objetivo: Exponer capacidades internas tipadas sin proxy universal.

**Invariante:** Todas las interfaces usan el mismo PEP y scopes; ninguna tool genérica aumenta autonomía.. Dependencias: CLI-C33. Padre inmutable, twin vinculado, JWT Supabase+membresía y scope, sin efectos sin policy/aprobación.

## Mapa de superficies y ownership
- **F1:** `packages/sdk/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F2:** `packages/hono/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F3:** `packages/agent-tools/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.

## Patchsets ultr granulares
### 034.01 — CLI-C34-T01

**Operación:** Crear cliente servidor con DTOs, timeout y errores discriminados.

**Archivo primario:** `packages/sdk/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** inicio.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No unknown general o respuestas sensibles sin validación runtime. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c34/CLI-C34-T01.md`. **Estado inicial:** NOT_EXECUTED.

### 034.02 — CLI-C34-T02

**Operación:** Implementar configuración privada y bloqueo de URL/path injection.

**Archivo primario:** `packages/hono/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C34-T01.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** BaseURL aprobada, rutas nominadas y sin credenciales en navegador. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c34/CLI-C34-T02.md`. **Estado inicial:** NOT_EXECUTED.

### 034.03 — CLI-C34-T03

**Operación:** Crear proxy Hono allowlist exacta método/ruta y tamaño.

**Archivo primario:** `packages/agent-tools/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C34-T02.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No prefijo que habilite automáticamente nuevos endpoints sensibles. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c34/CLI-C34-T03.md`. **Estado inicial:** NOT_EXECUTED.

### 034.04 — CLI-C34-T04

**Operación:** Definir tools de lectura/propuesta con input mínimo.

**Archivo primario:** `packages/sdk/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C34-T03.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Actor, tenant, capabilities y destinatario autorizado se resuelven fuera del modelo. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c34/CLI-C34-T04.md`. **Estado inicial:** NOT_EXECUTED.

### 034.05 — CLI-C34-T05

**Operación:** Crear adaptador MCP opcional con mismo contrato/PEP.

**Archivo primario:** `packages/hono/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C34-T04.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Instalar MCP no añade admin/send/refund/export_all. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c34/CLI-C34-T05.md`. **Estado inicial:** NOT_EXECUTED.

### 034.06 — CLI-C34-T06

**Operación:** Publicar tipos y schema fixtures compatibles con nomenclatura padre.

**Archivo primario:** `packages/agent-tools/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C34-T05.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** schemaVersion propio no se confunde con tipos nativos. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c34/CLI-C34-T06.md`. **Estado inicial:** NOT_EXECUTED.

### 034.07 — CLI-C34-T07

**Operación:** Ejecutar node tests/build y contratos extremo API↔SDK.

**Archivo primario:** `packages/sdk/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/34-sdk-typescript-hono-y-tools-nominadas.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C34-T06.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No declarar npm instalable si solo existe diseño o no pasó build. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c34/CLI-C34-T07.md`. **Estado inicial:** NOT_EXECUTED.


## Wiring transversal
Entrada autenticada → principal+membership → tenant+resource ACL → contrato Zod → policy/FSM → transacción estado+audit+outbox → worker delegado → adaptador tipado → receipt/reconciliación → bridge de eventos padre versionado. Sin SQL/HTTP/shell genéricos expuestos al modelo. Si esta fase no requiere efectos, anotar NO_APLICA por cada puerto.

## Gates
- **CLI-C34-G01 (NOT_EXECUTED):** Tool llama /provider/method o cambia origin mediante URL absoluta: rechazado. Registrar fixture, comando, SHA, resultado y límites.
- **CLI-C34-G02 (NOT_EXECUTED):** Agent solicita approve su propio proposal:403 sin fallback a humano. Registrar fixture, comando, SHA, resultado y límites.

**Bloqueos:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Handoff de esta campaña
Freebuff registra archivos creados/modificados, SHA, decisiones de contratos, migraciones, tests ejecutados, PASS/FAIL/BLOCKED, evidencia, riesgos, feature flags y rollback. Continuar automáticamente con siguiente campaña cuando los prerrequisitos técnicos locales estén satisfechos; no esperar meta-auditoría o diseño adicional. Auditoría independiente de Codex solo al concluir la pasada completa de Freebuff.
