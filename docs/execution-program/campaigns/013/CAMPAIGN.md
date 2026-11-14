# CLI-C13 — Chatwoot lectura y bindings

**PROGRAMA COMPLETO / DISEÑO PREVIO / NOT_STARTED.** Fase 13/42. Fuente: [campaña original](../../campaigns/13-chatwoot-lectura-y-bindings.md). Esta especificación se escribe antes de la ejecución industrial; no atribuye pruebas ni implementación.

## Objetivo y frontera
Leer conversaciones de cuenta/inbox explícitamente autorizado.

**Invariante no negociable:** account_id/inbox_id no se equiparan con tenantId del servicio.

**Dependencias entre campañas:** CLI-C12. **Autoridad:** agente padre mantiene identidad canónica, policy, SOP, aprobaciones y bus; este servicio ejecuta únicamente mandatos tipados y verificables. JWT Supabase, membresía de servidor, scope por recurso, twin vinculado y tenant RLS en ambos modos.

## Contrato de archivos y ownership
- `packages/adapters/chatwoot/read.ts`: artefacto 1/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `packages/adapters/chatwoot/mappers.ts`: artefacto 2/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `tests/integration/chatwoot-read.test.ts`: artefacto 3/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.

## Patchsets y orden de ejecución
### Patch 013.01 · CLI-C13-T01
**Acción exacta:** Fijar versión/imagen/licencia y cuenta bot de laboratorio.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/read.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Reportar si la edición no incluye una capacidad requerida. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c13/CLI-C13-T01.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** ninguna interna.

### Patch 013.02 · CLI-C13-T02
**Acción exacta:** Validar binding tenant→account→inbox y permisos del bot.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/mappers.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Cuenta de otro tenant no se prueba con lectura para adivinar correspondencia. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c13/CLI-C13-T02.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C13-T01.

### Patch 013.03 · CLI-C13-T03
**Acción exacta:** Leer contactos/conversaciones/mensajes con fields y paginación cerrados.

**Superficie primaria propuesta:** `tests/integration/chatwoot-read.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** 1000+ mensajes sintéticos sin omisiones/duplicados por criterio definido. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c13/CLI-C13-T03.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C13-T02.

### Patch 013.04 · CLI-C13-T04
**Acción exacta:** Mapear estados/visibilidad/fechas e IDs opacos.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/read.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** display_id no se usa solo como identidad global de conversación. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c13/CLI-C13-T04.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C13-T03.

### Patch 013.05 · CLI-C13-T05
**Acción exacta:** Preservar mensajes internos, borrados y adjuntos como categorías distintas.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/mappers.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Nota privada no se expone a contacto o contexto de respuesta pública. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c13/CLI-C13-T05.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C13-T04.

### Patch 013.06 · CLI-C13-T06
**Acción exacta:** Crear preview y links con sourceHash y revisión remota.

**Superficie primaria propuesta:** `tests/integration/chatwoot-read.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Cambio remoto genera actualización/conflicto según AuthorityMap. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c13/CLI-C13-T06.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C13-T05.

### Patch 013.07 · CLI-C13-T07
**Acción exacta:** Ejecutar contrato con credencial sin permiso y dos cuentas de test.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/read.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/13-chatwoot-lectura-y-bindings.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** 403/404 sin fuga; mock no sustituye test de instalación real. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c13/CLI-C13-T07.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C13-T06.


## Wiring transversal y secuencia de efectos
1. Entrada API/worker/adaptador: validar schemaVersion, principal autenticado y tenant; no confiar en IDs de LLM ni del cliente.
2. Core determinista: validar capability, purpose, scope, revisión, presupuesto, aprobación y autoridad del campo/efecto.
3. Persistencia local: transacción para dominio+auditoría+intent/outbox, idempotencia por tenant+operación+payload; RLS y permisos workers.
4. Salida: adaptador único por WorkOrder, nunca doble emisor con padre; reconciliar unknown outcomes antes de retry; receipt remoto no equivale necesariamente a entrega.
5. Observabilidad: trace/correlation/causation y evidencia sanitizada; compatibilidad con SystemEvent nativo solo mediante bridge versionado y verificado.
6. Para campañas exclusivamente documentales, demostrar que estas reglas están especificadas, sin fingir que se ejecutaron.

## Gates de aceptación y fallos
- **CLI-C13-G01 / NOT_EXECUTED:** Binding de inboxB con accountA falla antes de listar mensajes. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.
- **CLI-C13-G02 / NOT_EXECUTED:** Mensaje interno o eliminado no se usa como texto público sin revisión explícita. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.

**Condiciones de bloqueo:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Entregables obligatorios de Freebuff
- Diff y lista final de archivos reales creados/modificados; registrar desviaciones de rutas previstas.
- 7 resultados por tarea y 2 resultados por gate con estado PASS/FAIL/BLOCKED/NOT_VERIFIED, comando, SHA y evidencia.
- Fixtures sintéticos de al menos dos tenants cuando intervengan datos, y pruebas de efectos externos con sandbox/mock explícitamente diferenciados.
- Reporte de compatibilidad con contratos, licencias, costes, migraciones, flags, riesgos y rollback.
- Al terminar las 42 campañas: entrega unificada para auditoría **posterior** de Codex; no esperar una auditoría intermedia para diseñar o iniciar la siguiente campaña.
