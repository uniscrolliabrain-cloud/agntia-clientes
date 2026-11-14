# CLI-C08 — Acuerdos, entitlements y encargos

**PROGRAMA COMPLETO / DISEÑO PREVIO / NOT_STARTED.** Fase 8/42. Fuente: [campaña original](../../campaigns/08-acuerdos-entitlements-y-encargos.md). Esta especificación se escribe antes de la ejecución industrial; no atribuye pruebas ni implementación.

## Objetivo y frontera
Materializar la frontera comercial y de responsabilidad del SaaS.

**Invariante no negociable:** Contrato comercial, aprobación editorial y permiso de datos son hechos diferentes.

**Dependencias entre campañas:** CLI-C07. **Autoridad:** agente padre mantiene identidad canónica, policy, SOP, aprobaciones y bus; este servicio ejecuta únicamente mandatos tipados y verificables. JWT Supabase, membresía de servidor, scope por recurso, twin vinculado y tenant RLS en ambos modos.

## Contrato de archivos y ownership
- `packages/service-agreements/`: artefacto 1/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `packages/work-orders/`: artefacto 2/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.
- `tests/entitlements.test.ts`: artefacto 3/3; **ruta prevista**, no afirmar existencia. Freebuff puede crear/modificar únicamente rutas de esta campaña y sus tests/fixtures/evidencias derivados. Cualquier dependencia compartida exige cambio de contrato documentado.

## Patchsets y orden de ejecución
### Patch 008.01 · CLI-C08-T01
**Acción exacta:** Definir acuerdos con operador, tenant, servicios, SLA, horario y responsables.

**Superficie primaria propuesta:** `packages/service-agreements/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** No se promete atención humana24/7 sin cobertura real. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c08/CLI-C08-T01.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** ninguna interna.

### Patch 008.02 · CLI-C08-T02
**Acción exacta:** Definir entitlements y límites de volumen/canal/AV por plan.

**Superficie primaria propuesta:** `packages/work-orders/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Plan barato mantiene seguridad; una función no contratada devuelve estado explícito. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c08/CLI-C08-T02.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C08-T01.

### Patch 008.03 · CLI-C08-T03
**Acción exacta:** Definir WorkOrder y aceptación de entregable con fuentes y alcance.

**Superficie primaria propuesta:** `tests/entitlements.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Se distingue quien pide, ejecuta, revisa y acepta. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c08/CLI-C08-T03.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C08-T02.

### Patch 008.04 · CLI-C08-T04
**Acción exacta:** Asignar un único responsable por envío/actualización compartida con otro servicio.

**Superficie primaria propuesta:** `packages/service-agreements/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Dos rutas de entrada generan el mismo intent o conflicto, nunca doble dispatch. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c08/CLI-C08-T04.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C08-T03.

### Patch 008.05 · CLI-C08-T05
**Acción exacta:** Implementar alta de tenant/miembros solo por provisioning autorizado.

**Superficie primaria propuesta:** `packages/work-orders/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Contactos importados no se convierten en usuarios ni reciben invitación automática. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c08/CLI-C08-T05.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C08-T04.

### Patch 008.06 · CLI-C08-T06
**Acción exacta:** Definir suspensión, salida, exportación y conservación revisadas.

**Superficie primaria propuesta:** `tests/entitlements.test.ts` (crear o modificar tras verificar checkout). **Lecturas obligatorias:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Impago no desencadena borrado/efectos sensibles decididos por modelo. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c08/CLI-C08-T06.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C08-T05.

### Patch 008.07 · CLI-C08-T07
**Acción exacta:** Probar cliente externo con portal y binding canónico backend.

**Superficie primaria propuesta:** `packages/service-agreements/` (directorio de artefactos; crear archivos concretos al ejecutar). **Lecturas obligatorias:** `docs/campaigns/08-acuerdos-entitlements-y-encargos.md`, `docs/contracts/01-contratos.md`, `docs/architecture/02-supabase-twins.md` y el contrato de cualquier dependencia. No tocar código del padre. Si el archivo no existe, crearlo solo si corresponde al artefacto aprobado; registrar cualquier nueva ruta en el inventario de campaña.

**Wiring:** validar entrada Zod en frontera, resolver tenant/principal en servidor, aplicar policy/AuthorityMap, persistir estado+audit+outbox atómicamente cuando exista efecto, emitir refs de correlación; los adaptadores externos solo mediante puertos tipados. Para documentación pura, marcar wiring NO_APLICA y documentar comprobación, no crear componentes ficticios.

**Prueba y aceptación:** Misma policy que integrado sin requerir UI AgntiaPro al cliente. Añadir caso positivo, caso de acceso denegado, fallo de proveedor o estado incierto según aplique; evidencia en `docs/evidence/c08/CLI-C08-T07.md` con SHA, comando, entorno, resultado y redacción de secretos. Estado inicial NOT_EXECUTED; nunca convertir ausencia de ejecución en PASS.

**Dependencia de tarea:** CLI-C08-T06.


## Wiring transversal y secuencia de efectos
1. Entrada API/worker/adaptador: validar schemaVersion, principal autenticado y tenant; no confiar en IDs de LLM ni del cliente.
2. Core determinista: validar capability, purpose, scope, revisión, presupuesto, aprobación y autoridad del campo/efecto.
3. Persistencia local: transacción para dominio+auditoría+intent/outbox, idempotencia por tenant+operación+payload; RLS y permisos workers.
4. Salida: adaptador único por WorkOrder, nunca doble emisor con padre; reconciliar unknown outcomes antes de retry; receipt remoto no equivale necesariamente a entrega.
5. Observabilidad: trace/correlation/causation y evidencia sanitizada; compatibilidad con SystemEvent nativo solo mediante bridge versionado y verificado.
6. Para campañas exclusivamente documentales, demostrar que estas reglas están especificadas, sin fingir que se ejecutaron.

## Gates de aceptación y fallos
- **CLI-C08-G01 / NOT_EXECUTED:** Cliente externo compra servicio y trata de acceder a otro tenant con su entitlement. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.
- **CLI-C08-G02 / NOT_EXECUTED:** Cambio de plan con job pendiente revalida alcance/coste y conserva receipt. Requiere fixture, comando reproducible y evidencia sobre SHA exacto.

**Condiciones de bloqueo:** Fuga cross-tenant o secreto expuesto; Bypass de aprobación/delegación o escritura fuera de alcance; Doble envío/resultado incierto sin reconciliación; Pérdida de auditoría o prueba crítica sin ejecutar.

**Rollback:** Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

## Entregables obligatorios de Freebuff
- Diff y lista final de archivos reales creados/modificados; registrar desviaciones de rutas previstas.
- 7 resultados por tarea y 2 resultados por gate con estado PASS/FAIL/BLOCKED/NOT_VERIFIED, comando, SHA y evidencia.
- Fixtures sintéticos de al menos dos tenants cuando intervengan datos, y pruebas de efectos externos con sandbox/mock explícitamente diferenciados.
- Reporte de compatibilidad con contratos, licencias, costes, migraciones, flags, riesgos y rollback.
- Al terminar las 42 campañas: entrega unificada para auditoría **posterior** de Codex; no esperar una auditoría intermedia para diseñar o iniciar la siguiente campaña.
