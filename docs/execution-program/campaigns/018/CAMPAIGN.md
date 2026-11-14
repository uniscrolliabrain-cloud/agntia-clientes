# CLI-C18 — Canal web y sesiones de contacto

**PROGRAMA INTEGRAL PREVIO / NOT_STARTED** · 18/42 · [fuente original](../../campaigns/18-canal-web-y-sesiones-de-contacto.md). Objetivo: Atender desde portal/widget sin conceder acceso a datos internos.

**Invariante:** Ingreso público acotado no crea membership ni identidad verificada del cliente.. Dependencias: CLI-C17. Padre inmutable, twin vinculado, JWT Supabase+membresía y scope, sin efectos sin policy/aprobación.

## Mapa de superficies y ownership
- **F1:** `apps/portal/intake/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F2:** `packages/channels/web/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F3:** `tests/web-channel.test.ts` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.

## Patchsets ultr granulares
### 018.01 — CLI-C18-T01

**Operación:** Definir sesión Supabase de portal y flujo opcional anónimo restringido.

**Archivo primario:** `apps/portal/intake/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** inicio.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Visitante solo puede iniciar/seguir su intake según prueba de servidor. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c18/CLI-C18-T01.md`. **Estado inicial:** NOT_EXECUTED.

### 018.02 — CLI-C18-T02

**Operación:** Provisionar binding formulario/inbox/tenant por configuración.

**Archivo primario:** `packages/channels/web/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C18-T01.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Campo tenantId del widget no dirige datos a otro cliente. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c18/CLI-C18-T02.md`. **Estado inicial:** NOT_EXECUTED.

### 018.03 — CLI-C18-T03

**Operación:** Implementar rate-limit, antiabuso y límites de texto/adjuntos.

**Archivo primario:** `tests/web-channel.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C18-T02.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Spam no agota presupuesto de inferencia ni rellena contexto de otros tenants. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c18/CLI-C18-T03.md`. **Estado inicial:** NOT_EXECUTED.

### 018.04 — CLI-C18-T04

**Operación:** Definir vinculación explícita al Contact tras verificación/invitación.

**Archivo primario:** `apps/portal/intake/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C18-T03.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Compartir email no da acceso al historial ya existente. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c18/CLI-C18-T04.md`. **Estado inicial:** NOT_EXECUTED.

### 018.05 — CLI-C18-T05

**Operación:** Persistir mensajes y sesiones con ACK, reconexión y dedup.

**Archivo primario:** `packages/channels/web/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C18-T04.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Refrescar o reenviar mismo evento no duplica ticket. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c18/CLI-C18-T05.md`. **Estado inicial:** NOT_EXECUTED.

### 018.06 — CLI-C18-T06

**Operación:** Aplicar ACL a Realtime y cierre/revocación de sesión.

**Archivo primario:** `tests/web-channel.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C18-T05.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Un canal suscrito a A no recibe evento de B ni al cambiar de tenant. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c18/CLI-C18-T06.md`. **Estado inicial:** NOT_EXECUTED.

### 018.07 — CLI-C18-T07

**Operación:** Probar teclado/móvil, pérdida de conexión y contacto sin cuenta.

**Archivo primario:** `apps/portal/intake/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/18-canal-web-y-sesiones-de-contacto.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C18-T06.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Hay fallback útil sin revelar información privada. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c18/CLI-C18-T07.md`. **Estado inicial:** NOT_EXECUTED.


## Wiring transversal
Entrada autenticada → principal+membership → tenant+resource ACL → contrato Zod → policy/FSM → transacción estado+audit+outbox → worker delegado → adaptador tipado → receipt/reconciliación → bridge de eventos padre versionado. Sin SQL/HTTP/shell genéricos expuestos al modelo. Si esta fase no requiere efectos, anotar NO_APLICA por cada puerto.

## Gates
- **CLI-C18-G01 (NOT_EXECUTED):** Usuario altera tenant en JS o identificador de conversación: no accede a otro hilo. Registrar fixture, comando, SHA, resultado y límites.
- **CLI-C18-G02 (NOT_EXECUTED):** Visitante anónimo intenta knowledge privado o export: capacidad denegada. Registrar fixture, comando, SHA, resultado y límites.

**Bloqueos:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Handoff de esta campaña
Freebuff registra archivos creados/modificados, SHA, decisiones de contratos, migraciones, tests ejecutados, PASS/FAIL/BLOCKED, evidencia, riesgos, feature flags y rollback. Continuar automáticamente con siguiente campaña cuando los prerrequisitos técnicos locales estén satisfechos; no esperar meta-auditoría o diseño adicional. Auditoría independiente de Codex solo al concluir la pasada completa de Freebuff.
