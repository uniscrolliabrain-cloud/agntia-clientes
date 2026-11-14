# CLI-C29 — Onboarding y playbooks de servicio

**PROGRAMA INTEGRAL PREVIO / NOT_STARTED** · 29/42 · [fuente original](../../campaigns/29-onboarding-y-playbooks-de-servicio.md). Objetivo: Gestionar hitos y documentos sin crear scheduler empresarial alternativo.

**Invariante:** Un hito se completa con evidencia/aceptación, no por una frase del agente.. Dependencias: CLI-C28. Padre inmutable, twin vinculado, JWT Supabase+membresía y scope, sin efectos sin policy/aprobación.

## Mapa de superficies y ownership
- **F1:** `packages/onboarding/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F2:** `packages/playbooks/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F3:** `tests/onboarding.test.ts` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.

## Patchsets ultr granulares
### 029.01 — CLI-C29-T01

**Operación:** Definir plantillas versionadas por tipo de servicio y cliente.

**Archivo primario:** `packages/onboarding/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** inicio.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Requisitos opcionales no se vuelven obligatorios por heurística. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c29/CLI-C29-T01.md`. **Estado inicial:** NOT_EXECUTED.

### 029.02 — CLI-C29-T02

**Operación:** Crear plan con objetivos, assignedBy/To y dependencias.

**Archivo primario:** `packages/playbooks/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C29-T01.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Se puede explicar por qué un paso espera y quién debe actuar. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c29/CLI-C29-T02.md`. **Estado inicial:** NOT_EXECUTED.

### 029.03 — CLI-C29-T03

**Operación:** Solicitar documentos mínimos mediante portal y permisos.

**Archivo primario:** `tests/onboarding.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C29-T02.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No pedir credenciales, tarjetas o datos ajenos innecesarios. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c29/CLI-C29-T03.md`. **Estado inicial:** NOT_EXECUTED.

### 029.04 — CLI-C29-T04

**Operación:** Validar entregas con evidencia, revisión y decisiones humanas.

**Archivo primario:** `packages/onboarding/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C29-T03.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Documento recibido no equivale automáticamente a correcto/aceptado. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c29/CLI-C29-T04.md`. **Estado inicial:** NOT_EXECUTED.

### 029.05 — CLI-C29-T05

**Operación:** Integrar tareas del padre por puerto con dedup y ACK.

**Archivo primario:** `packages/playbooks/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C29-T04.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No inventar segundo runtime de objetivos/rota. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c29/CLI-C29-T05.md`. **Estado inicial:** NOT_EXECUTED.

### 029.06 — CLI-C29-T06

**Operación:** Crear recordatorios acotados a finalidad, horario y supresión.

**Archivo primario:** `tests/onboarding.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C29-T05.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No hostigar ni convertir onboarding en campaña comercial sin permiso. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c29/CLI-C29-T06.md`. **Estado inicial:** NOT_EXECUTED.

### 029.07 — CLI-C29-T07

**Operación:** Probar nueva versión de playbook durante ejecución y suspensión.

**Archivo primario:** `packages/onboarding/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/29-onboarding-y-playbooks-de-servicio.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C29-T06.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Mantener plan original/revisión o migración explícita, sin perder historia. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c29/CLI-C29-T07.md`. **Estado inicial:** NOT_EXECUTED.


## Wiring transversal
Entrada autenticada → principal+membership → tenant+resource ACL → contrato Zod → policy/FSM → transacción estado+audit+outbox → worker delegado → adaptador tipado → receipt/reconciliación → bridge de eventos padre versionado. Sin SQL/HTTP/shell genéricos expuestos al modelo. Si esta fase no requiere efectos, anotar NO_APLICA por cada puerto.

## Gates
- **CLI-C29-G01 (NOT_EXECUTED):** Cambio de plantilla no marca pasos antiguos como cumplidos ni reinicia comunicaciones. Registrar fixture, comando, SHA, resultado y límites.
- **CLI-C29-G02 (NOT_EXECUTED):** Documento malicioso o de otro tenant no se vincula al plan. Registrar fixture, comando, SHA, resultado y límites.

**Bloqueos:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Handoff de esta campaña
Freebuff registra archivos creados/modificados, SHA, decisiones de contratos, migraciones, tests ejecutados, PASS/FAIL/BLOCKED, evidencia, riesgos, feature flags y rollback. Continuar automáticamente con siguiente campaña cuando los prerrequisitos técnicos locales estén satisfechos; no esperar meta-auditoría o diseño adicional. Auditoría independiente de Codex solo al concluir la pasada completa de Freebuff.
