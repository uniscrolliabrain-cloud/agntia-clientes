# CLI-C10 — Discovery y capacidades verificadas

**PROGRAMA COMPLETO / DISEÑO PREVIO / NOT_STARTED.** Fase 10/42. Fuente: [campaña original](../../campaigns/10-discovery-y-capacidades-verificadas.md). Esta especificación se escribe antes de la ejecución industrial; no atribuye pruebas ni implementación.

## Objetivo y frontera
Habilitar cada operación solo según despliegue y permisos comprobados.

**Invariante no negociable:** Documented no equivale a supported_runtime; unknown permanece deshabilitado.

**Dependencias entre campañas:** CLI-C09. **Autoridad:** agente padre mantiene identidad canónica, policy, SOP, aprobaciones y bus; este servicio ejecuta únicamente mandatos tipados y verificables. JWT Supabase, membresía de servidor, scope por recurso, twin vinculado y tenant RLS en ambos modos.

## Contrato de archivos y ownership
- `packages/integrations/discovery/`: artefacto 1/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `docs/capability-matrix.md`: artefacto 2/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `tests/discovery.test.ts`: artefacto 3/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.

## Patchsets y orden de ejecución
### Patch 010.01 · CLI-C10-T01
**Acción exacta:** Definir estado documented/verified/unsupported/forbidden/unknown por operación.

**Superficie primaria propuesta:** `packages/integrations/discovery/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Una página de marketing no habilita una escritura. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c10/CLI-C10-T01.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** ninguna interna.

### Patch 010.02 · CLI-C10-T02
**Acción exacta:** Consultar versión/esquema/edición/ACL con credencial de mínimo privilegio.

**Superficie primaria propuesta:** `docs/capability-matrix.md` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Guardar timestamp y evidencia mínima sin enumerar datos de otro tenant. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c10/CLI-C10-T02.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C10-T01.

### Patch 010.03 · CLI-C10-T03
**Acción exacta:** Validar binding tenant a cuenta/workspace/sitio de proveedor.

**Superficie primaria propuesta:** `tests/discovery.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** No mapear por nombre visible ni primer resultado. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c10/CLI-C10-T03.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C10-T02.

### Patch 010.04 · CLI-C10-T04
**Acción exacta:** Comprobar campos requeridos y semántica de paginación/errores.

**Superficie primaria propuesta:** `packages/integrations/discovery/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Un200 con HTML o campos ausentes no se declara healthy. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c10/CLI-C10-T04.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C10-T03.

### Patch 010.05 · CLI-C10-T05
**Acción exacta:** Persistir report versionado y caché con caducidad/invalidation.

**Superficie primaria propuesta:** `docs/capability-matrix.md` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Cambio de módulo/rol/schema obliga nueva verificación. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c10/CLI-C10-T05.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C10-T04.

### Patch 010.06 · CLI-C10-T06
**Acción exacta:** Separar probes de lectura de operaciones con efecto/coste.

**Superficie primaria propuesta:** `tests/discovery.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Discovery no crea tickets o manda mensajes para probarse sin autorización. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c10/CLI-C10-T06.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C10-T05.

### Patch 010.07 · CLI-C10-T07
**Acción exacta:** Publicar health con causas sanitizadas y plan de recuperación.

**Superficie primaria propuesta:** `packages/integrations/discovery/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/10-discovery-y-capacidades-verificadas.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Sin account/module/permiso aparece unsupported o forbidden, no falso éxito. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c10/CLI-C10-T07.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C10-T06.


## Wiring transversal y secuencia de efectos
1. Entrada API/worker/adaptador: validar schemaVersion, principal autenticado y tenant; no confiar en IDs de LLM ni del cliente.
2. Core determinista: validar capability, purpose, scope, revisión, presupuesto, aprobación y autoridad del campo/efecto.
3. Persistencia local: transacción para dominio+auditoría+intent/outbox, idempotencia por tenant+operación+payload; RLS y permisos workers.
4. Salida: adaptador único por WorkOrder, nunca doble emisor con padre; reconciliar unknown outcomes antes de retry; receipt remoto no equivale necesariamente a entrega.
5. Observabilidad: trace/correlation/causation y evidencia sanitizada; compatibilidad con SystemEvent nativo solo mediante bridge versionado y verificado.
6. Para campañas exclusivamente documentales, demostrar que estas reglas están especificadas, sin fingir que se ejecutaron.

## Gates de aceptación y fallos
- **CLI-C10-G01 / NOT_EXECUTED:** Retirar permiso de mensajes mantiene lectura pero deshabilita envío. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.
- **CLI-C10-G02 / NOT_EXECUTED:** Cambiar schema de workspace invalida mapper/report previo antes de importar. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.

**Condiciones de bloqueo:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Entregables obligatorios de Freebuff
- Diff y lista final de archivos reales creados/modificados; registrar desviaciones de rutas previstas.
- 7 resultados por tarea y 2 resultados por gate con estado PASS/FAIL/BLOCKED/NOT_VERIFIED, comando, SHA y evidencia.
- Fixtures sintéticos de al menos dos tenants cuando intervengan datos, y pruebas de efectos externos con sandbox/mock explícitamente diferenciados.
- Reporte de compatibilidad con contratos, licencias, costes, migraciones, flags, riesgos y rollback.
- Al terminar las 42 campañas: entrega unificada para auditoría **posterior** de Codex; no esperar una auditoría intermedia para diseñar o iniciar la siguiente campaña.
