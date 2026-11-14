# CLI-C16 — Frappe CRM y Helpdesk alternativos

**PROGRAMA INTEGRAL PREVIO / NOT_STARTED** · 16/42 · [fuente original](../../campaigns/16-frappe-crm-y-helpdesk-alternativos.md). Objetivo: Diseñar un adaptador por DocTypes/roles sin duplicar el motor de casos.

**Invariante:** Un solo responsable del estado y reloj SLA por caso.. Dependencias: CLI-C15. Padre inmutable, twin vinculado, JWT Supabase+membresía y scope, sin efectos sin policy/aprobación.

## Mapa de superficies y ownership
- **F1:** `packages/adapters/frappe/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F2:** `docs/adapters/frappe.md` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F3:** `tests/integration/frappe.test.ts` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.

## Patchsets ultr granulares
### 016.01 — CLI-C16-T01

**Operación:** Fijar sitios/apps/versiones, revisar AGPL y permisos del bot.

**Archivo primario:** `packages/adapters/frappe/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** inicio.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No asumir que CRM y Helpdesk están instalados juntos. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c16/CLI-C16-T01.md`. **Estado inicial:** NOT_EXECUTED.

### 016.02 — CLI-C16-T02

**Operación:** Descubrir DocTypes/campos y métodos nominados necesarios.

**Archivo primario:** `docs/adapters/frappe.md`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C16-T01.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Sin exposición de execute/RPC genérico a agentes. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c16/CLI-C16-T02.md`. **Estado inicial:** NOT_EXECUTED.

### 016.03 — CLI-C16-T03

**Operación:** Validar tenant→sitio y compañía/contexto aplicable por contrato.

**Archivo primario:** `tests/integration/frappe.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C16-T02.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Nombre similar o dominio de email no decide binding. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c16/CLI-C16-T03.md`. **Estado inicial:** NOT_EXECUTED.

### 016.04 — CLI-C16-T04

**Operación:** Mapear contactos/empresas/tickets y campos SLA existentes.

**Archivo primario:** `packages/adapters/frappe/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C16-T03.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No activar doble cálculo local/remoto del mismo vencimiento. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c16/CLI-C16-T04.md`. **Estado inicial:** NOT_EXECUTED.

### 016.05 — CLI-C16-T05

**Operación:** Implementar lectura y staging con links/fechas/hash.

**Archivo primario:** `docs/adapters/frappe.md`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C16-T04.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Estado remoto no se equipara con aprobación humana del middleware. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c16/CLI-C16-T05.md`. **Estado inicial:** NOT_EXECUTED.

### 016.06 — CLI-C16-T06

**Operación:** Definir writes limitados con dry-run, revisión y semántica incierta.

**Archivo primario:** `tests/integration/frappe.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C16-T05.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No delete ni submit/document methods fuera del alcance. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c16/CLI-C16-T06.md`. **Estado inicial:** NOT_EXECUTED.

### 016.07 — CLI-C16-T07

**Operación:** Probar instalación sin módulo, rol reducido y dos sitios.

**Archivo primario:** `packages/adapters/frappe/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/16-frappe-crm-y-helpdesk-alternativos.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C16-T06.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Unsupported honesto; integración real separada de mocks. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c16/CLI-C16-T07.md`. **Estado inicial:** NOT_EXECUTED.


## Wiring transversal
Entrada autenticada → principal+membership → tenant+resource ACL → contrato Zod → policy/FSM → transacción estado+audit+outbox → worker delegado → adaptador tipado → receipt/reconciliación → bridge de eventos padre versionado. Sin SQL/HTTP/shell genéricos expuestos al modelo. Si esta fase no requiere efectos, anotar NO_APLICA por cada puerto.

## Gates
- **CLI-C16-G01 (NOT_EXECUTED):** Helpdesk instalado sin CRM no habilita operaciones de ventas por suposición. Registrar fixture, comando, SHA, resultado y límites.
- **CLI-C16-G02 (NOT_EXECUTED):** Dos motores SLA discrepan: bloquear cambio hasta decidir AuthorityMap. Registrar fixture, comando, SHA, resultado y límites.

**Bloqueos:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Handoff de esta campaña
Freebuff registra archivos creados/modificados, SHA, decisiones de contratos, migraciones, tests ejecutados, PASS/FAIL/BLOCKED, evidencia, riesgos, feature flags y rollback. Continuar automáticamente con siguiente campaña cuando los prerrequisitos técnicos locales estén satisfechos; no esperar meta-auditoría o diseño adicional. Auditoría independiente de Codex solo al concluir la pasada completa de Freebuff.
