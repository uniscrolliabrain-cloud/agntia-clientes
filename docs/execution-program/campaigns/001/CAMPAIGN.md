# CLI-C01 — Baseline y perímetro de solo lectura

**PROGRAMA COMPLETO / DISEÑO PREVIO / NOT_STARTED.** Fase 1/42. Fuente: [campaña original](../../campaigns/01-baseline-y-perimetro-de-solo-lectura.md). Esta especificación se escribe antes de la ejecución industrial; no atribuye pruebas ni implementación.

## Objetivo y frontera
Congelar estado propio, padre y fuentes antes de implementar.

**Invariante no negociable:** No cambiar agente; ninguna capacidad documental cuenta como implementada.

**Dependencias entre campañas:** ninguna. **Autoridad:** agente padre mantiene identidad canónica, policy, SOP, aprobaciones y bus; este servicio ejecuta únicamente mandatos tipados y verificables. JWT Supabase, membresía de servidor, scope por recurso, twin vinculado y tenant RLS en ambos modos.

## Contrato de archivos y ownership
- `docs/baseline.md`: artefacto 1/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `docs/host-diff.md`: artefacto 2/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `docs/evidence/c01/`: artefacto 3/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.

## Patchsets y orden de ejecución
### Patch 001.01 · CLI-C01-T01
**Acción exacta:** Anotar SHA propio/padre, fecha, árbol, instrucciones aplicables y límites de acceso.

**Superficie primaria propuesta:** `docs/baseline.md` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Registro reproducible con ausencia o existencia de checkout/credenciales explícita. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c01/CLI-C01-T01.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** ninguna interna.

### Patch 001.02 · CLI-C01-T02
**Acción exacta:** Inventariar rutas, paquetes y tipos relevantes del padre, sin ejecutar mutaciones.

**Superficie primaria propuesta:** `docs/host-diff.md` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Mapa de nombres con ruta, blob y alcance de lectura; ningún símbolo supuesto como real. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c01/CLI-C01-T02.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C01-T01.

### Patch 001.03 · CLI-C01-T03
**Acción exacta:** Cotejar catálogo base y personas default, diferenciando plantilla de ejecución.

**Superficie primaria propuesta:** `docs/evidence/c01/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Discrepancia12/16 registrada y resolución pendiente; no crear nuevos agentes para compensarla. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c01/CLI-C01-T03.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C01-T02.

### Patch 001.04 · CLI-C01-T04
**Acción exacta:** Comprobar que la entrega inicial solo tiene documentación y registrar su manifest.

**Superficie primaria propuesta:** `docs/baseline.md` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Conteos y hashes de archivos; no atribuir a baseline tests de producto inexistentes. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c01/CLI-C01-T04.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C01-T03.

### Patch 001.05 · CLI-C01-T05
**Acción exacta:** Definir matriz de herramientas disponibles y bloqueos de Docker, red y sandbox.

**Superficie primaria propuesta:** `docs/host-diff.md` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Cada gate real tiene responsable, entorno requerido y estado NOT_VERIFIED si falta. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c01/CLI-C01-T05.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C01-T04.

### Patch 001.06 · CLI-C01-T06
**Acción exacta:** Revalidar términos/licencias/fechas de las fuentes que se usarán en la primera vertical.

**Superficie primaria propuesta:** `docs/evidence/c01/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Fuente primaria y versión; incertidumbre no se transforma en permiso. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c01/CLI-C01-T06.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C01-T05.

### Patch 001.07 · CLI-C01-T07
**Acción exacta:** Preparar bitácora de evidencia y checkpoint con riesgos preexistentes.

**Superficie primaria propuesta:** `docs/baseline.md` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/01-baseline-y-perimetro-de-solo-lectura.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Informe distingue evidencia previa, verificación propia y cambios propuestos. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c01/CLI-C01-T07.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C01-T06.


## Wiring transversal y secuencia de efectos
1. Entrada API/worker/adaptador: validar schemaVersion, principal autenticado y tenant; no confiar en IDs de LLM ni del cliente.
2. Core determinista: validar capability, purpose, scope, revisión, presupuesto, aprobación y autoridad del campo/efecto.
3. Persistencia local: transacción para dominio+auditoría+intent/outbox, idempotencia por tenant+operación+payload; RLS y permisos workers.
4. Salida: adaptador único por WorkOrder, nunca doble emisor con padre; reconciliar unknown outcomes antes de retry; receipt remoto no equivale necesariamente a entrega.
5. Observabilidad: trace/correlation/causation y evidencia sanitizada; compatibilidad con SystemEvent nativo solo mediante bridge versionado y verificado.
6. Para campañas exclusivamente documentales, demostrar que estas reglas están especificadas, sin fingir que se ejecutaron.

## Gates de aceptación y fallos
- **CLI-C01-G01 / NOT_EXECUTED:** Cambiar el padre entre dos lecturas: detener compatibilidad hasta cotejar SHAs. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.
- **CLI-C01-G02 / NOT_EXECUTED:** Intentar declarar un conector listo sin ejecutar nada: gate rechaza la afirmación. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.

**Condiciones de bloqueo:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Entregables obligatorios de Freebuff
- Diff y lista final de archivos reales creados/modificados; registrar desviaciones de rutas previstas.
- 7 resultados por tarea y 2 resultados por gate con estado PASS/FAIL/BLOCKED/NOT_VERIFIED, comando, SHA y evidencia.
- Fixtures sintéticos de al menos dos tenants cuando intervengan datos, y pruebas de efectos externos con sandbox/mock explícitamente diferenciados.
- Reporte de compatibilidad con contratos, licencias, costes, migraciones, flags, riesgos y rollback.
- Al terminar las 42 campañas: entrega unificada para auditoría **posterior** de Codex; no esperar una auditoría intermedia para diseñar o iniciar la siguiente campaña.
