# CLI-C14 — Chatwoot writeback seguro

**PROGRAMA COMPLETO / DISEÑO PREVIO / NOT_STARTED.** Fase 14/42. Fuente: [campaña original](../../campaigns/14-chatwoot-writeback-seguro.md). Esta especificación se escribe antes de la ejecución industrial; no atribuye pruebas ni implementación.

## Objetivo y frontera
Crear mensajes y cambios de caso mediante intents controlados.

**Invariante no negociable:** Crear una fila de mensaje no prueba entrega ni autoriza retry.

**Dependencias entre campañas:** CLI-C13. **Autoridad:** agente padre mantiene identidad canónica, policy, SOP, aprobaciones y bus; este servicio ejecuta únicamente mandatos tipados y verificables. JWT Supabase, membresía de servidor, scope por recurso, twin vinculado y tenant RLS en ambos modos.

## Contrato de archivos y ownership
- `packages/adapters/chatwoot/write.ts`: artefacto 1/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `packages/reconcile/chatwoot.ts`: artefacto 2/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `tests/chatwoot-write.test.ts`: artefacto 3/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.

## Patchsets y orden de ejecución
### Patch 014.01 · CLI-C14-T01
**Acción exacta:** Confirmar create/status/receipt disponibles en instalación real.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/write.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Contrato distingue persistencia del mensaje y envío asíncrono. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c14/CLI-C14-T01.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** ninguna interna.

### Patch 014.02 · CLI-C14-T02
**Acción exacta:** Implementar dry-run de respuesta con receptor, visibility y adjuntos.

**Superficie primaria propuesta:** `packages/reconcile/chatwoot.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Sin publicación, job remoto ni gasto inesperado. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c14/CLI-C14-T02.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C14-T01.

### Patch 014.03 · CLI-C14-T03
**Acción exacta:** Vincular aprobación y autoridad única de dispatch.

**Superficie primaria propuesta:** `tests/chatwoot-write.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Padre y backend no mandan el mismo reply por rutas distintas. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c14/CLI-C14-T03.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C14-T02.

### Patch 014.04 · CLI-C14-T04
**Acción exacta:** Persistir intent/outbox antes de HTTP con key/hash/revisión.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/write.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Replay devuelve el intent sin crear otro mensaje lógico. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c14/CLI-C14-T04.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C14-T03.

### Patch 014.05 · CLI-C14-T05
**Acción exacta:** Reconciliar timeout por IDs/ref verificables del backend.

**Superficie primaria propuesta:** `packages/reconcile/chatwoot.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Si no hay búsqueda fiable se bloquea retry y se escala. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c14/CLI-C14-T05.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C14-T04.

### Patch 014.06 · CLI-C14-T06
**Acción exacta:** Aplicar límites de create/update permitidos; excluir delete/retry arbitrario.

**Superficie primaria propuesta:** `tests/chatwoot-write.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Tools no acceden a métodos de administración o pipeline interno. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c14/CLI-C14-T06.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C14-T05.

### Patch 014.07 · CLI-C14-T07
**Acción exacta:** Probar crash tras create, doble click y handoff concurrente.

**Superficie primaria propuesta:** `packages/adapters/chatwoot/write.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/14-chatwoot-writeback-seguro.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Un mensaje o estado incierto bloqueado; ninguna duplicación encubierta. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c14/CLI-C14-T07.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C14-T06.


## Wiring transversal y secuencia de efectos
1. Entrada API/worker/adaptador: validar schemaVersion, principal autenticado y tenant; no confiar en IDs de LLM ni del cliente.
2. Core determinista: validar capability, purpose, scope, revisión, presupuesto, aprobación y autoridad del campo/efecto.
3. Persistencia local: transacción para dominio+auditoría+intent/outbox, idempotencia por tenant+operación+payload; RLS y permisos workers.
4. Salida: adaptador único por WorkOrder, nunca doble emisor con padre; reconciliar unknown outcomes antes de retry; receipt remoto no equivale necesariamente a entrega.
5. Observabilidad: trace/correlation/causation y evidencia sanitizada; compatibilidad con SystemEvent nativo solo mediante bridge versionado y verificado.
6. Para campañas exclusivamente documentales, demostrar que estas reglas están especificadas, sin fingir que se ejecutaron.

## Gates de aceptación y fallos
- **CLI-C14-G01 / NOT_EXECUTED:** Backend acepta mensaje pero se pierde respuesta: no se llama retry automáticamente. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.
- **CLI-C14-G02 / NOT_EXECUTED:** Se aprueba nota interna y luego cambia visibility a pública: hash/revisión invalida. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.

**Condiciones de bloqueo:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Entregables obligatorios de Freebuff
- Diff y lista final de archivos reales creados/modificados; registrar desviaciones de rutas previstas.
- 7 resultados por tarea y 2 resultados por gate con estado PASS/FAIL/BLOCKED/NOT_VERIFIED, comando, SHA y evidencia.
- Fixtures sintéticos de al menos dos tenants cuando intervengan datos, y pruebas de efectos externos con sandbox/mock explícitamente diferenciados.
- Reporte de compatibilidad con contratos, licencias, costes, migraciones, flags, riesgos y rollback.
- Al terminar las 42 campañas: entrega unificada para auditoría **posterior** de Codex; no esperar una auditoría intermedia para diseñar o iniciar la siguiente campaña.
