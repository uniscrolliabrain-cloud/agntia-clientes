# CLI-C19 — Correo transaccional y threading

**PROGRAMA INTEGRAL PREVIO / NOT_STARTED** · 19/42 · [fuente original](../../campaigns/19-correo-transaccional-y-threading.md). Objetivo: Conectar entrada/salida de email con límites y receipts verificables.

**Invariante:** accepted, delivered, bounced y resolved son estados diferentes.. Dependencias: CLI-C18. Padre inmutable, twin vinculado, JWT Supabase+membresía y scope, sin efectos sin policy/aprobación.

## Mapa de superficies y ownership
- **F1:** `packages/channels/email/` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F2:** `docs/email-delivery.md` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.
- **F3:** `tests/email.test.ts` — ruta propuesta, no asumir que ya existe; Freebuff crea/modifica solo bajo esta superficie y sus fixtures/tests/evidencias.

## Patchsets ultr granulares
### 019.01 — CLI-C19-T01

**Operación:** Asignar autoridad de envío entre padre, Chatwoot y proveedor email.

**Archivo primario:** `packages/channels/email/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/19-correo-transaccional-y-threading.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** inicio.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Misma operación solo tiene un dispatch autorizado. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c19/CLI-C19-T01.md`. **Estado inicial:** NOT_EXECUTED.

### 019.02 — CLI-C19-T02

**Operación:** Configurar dominio/remitente verificados y secretos backend.

**Archivo primario:** `docs/email-delivery.md`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/19-correo-transaccional-y-threading.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C19-T01.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** No From/Reply-To arbitrario del modelo o cabeceras con CRLF. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c19/CLI-C19-T02.md`. **Estado inicial:** NOT_EXECUTED.

### 019.03 — CLI-C19-T03

**Operación:** Verificar webhook/ingreso y resolver thread sin confiar solo en asunto.

**Archivo primario:** `tests/email.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/19-correo-transaccional-y-threading.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C19-T02.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Message-ID/References y binding limitan el hilo correcto. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c19/CLI-C19-T03.md`. **Estado inicial:** NOT_EXECUTED.

### 019.04 — CLI-C19-T04

**Operación:** Normalizar recipients, cc/bcc, adjuntos y supresión.

**Archivo primario:** `packages/channels/email/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/19-correo-transaccional-y-threading.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C19-T03.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Preview muestra todos destinatarios; datos no se filtran por copia oculta inadvertida. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c19/CLI-C19-T04.md`. **Estado inicial:** NOT_EXECUTED.

### 019.05 — CLI-C19-T05

**Operación:** Implementar clave de idempotencia y ledger local durable.

**Archivo primario:** `docs/email-delivery.md`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/19-correo-transaccional-y-threading.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C19-T04.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Ventana24h documentada de Resend no se convierte en dedup eterno remoto. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c19/CLI-C19-T05.md`. **Estado inicial:** NOT_EXECUTED.

### 019.06 — CLI-C19-T06

**Operación:** Procesar accepted/delivery/bounce/complaint con orden y replay.

**Archivo primario:** `tests/email.test.ts`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/19-correo-transaccional-y-threading.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C19-T05.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Webhook repetido o tardío no retrocede estado confirmado sin regla. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c19/CLI-C19-T06.md`. **Estado inicial:** NOT_EXECUTED.

### 019.07 — CLI-C19-T07

**Operación:** Probar fallo de red, expiración de dedup y reply a buzón compartido.

**Archivo primario:** `packages/channels/email/`; **contratos a leer:** `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/campaigns/19-correo-transaccional-y-threading.md`. Verificar ruta real antes de editar; registrar nuevos archivos, funciones y exportaciones en diff. **Secuencia:** CLI-C19-T06.

**Implementación:** separar handler/API, dominio, persistencia y adaptador; Zod en fronteras; tenant y actor resueltos en servidor; RLS; autoridad única por efecto; revisión+idempotencia; outbox y conciliación si hay remoto. Si tarea es de investigación/documentación, registrar evidencia y decisiones sin inventar código.

**Tests específicos:** Resultado incierto se reconcilia o bloquea antes de reenviar. Comprobar caso válido, principal ajeno, scope ausente, repetición de solicitud y caída/timeout cuando aplique. Escribir prueba al lado del paquete afectado o bajo `tests/` con fixture sintético y evidencia `docs/evidence/c19/CLI-C19-T07.md`. **Estado inicial:** NOT_EXECUTED.


## Wiring transversal
Entrada autenticada → principal+membership → tenant+resource ACL → contrato Zod → policy/FSM → transacción estado+audit+outbox → worker delegado → adaptador tipado → receipt/reconciliación → bridge de eventos padre versionado. Sin SQL/HTTP/shell genéricos expuestos al modelo. Si esta fase no requiere efectos, anotar NO_APLICA por cada puerto.

## Gates
- **CLI-C19-G01 (NOT_EXECUTED):** Timeout tras aceptación y retry al día siguiente no crea otro correo por nueva key. Registrar fixture, comando, SHA, resultado y límites.
- **CLI-C19-G02 (NOT_EXECUTED):** Email spoofed pide cambiar datos bancarios o entregar documentos: identidad insuficiente. Registrar fixture, comando, SHA, resultado y límites.

**Bloqueos:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Handoff de esta campaña
Freebuff registra archivos creados/modificados, SHA, decisiones de contratos, migraciones, tests ejecutados, PASS/FAIL/BLOCKED, evidencia, riesgos, feature flags y rollback. Continuar automáticamente con siguiente campaña cuando los prerrequisitos técnicos locales estén satisfechos; no esperar meta-auditoría o diseño adicional. Auditoría independiente de Codex solo al concluir la pasada completa de Freebuff.
