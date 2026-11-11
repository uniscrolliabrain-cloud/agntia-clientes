# CLI-C28 · Handoff humano y coordinación

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia28/42. Dependencia: CLI-C27.

## Objetivo e invariante

Pausar autonomía y transferir contexto mínimo con aceptación real.

Invariante: Emitir un evento no acredita recepción ni trabajo realizado.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/handoffs/`
- `docs/handoff-protocol.md`
- `tests/handoffs.test.ts`

## Tareas, en orden

### CLI-C28-T01

Definir motivos de escalado por identidad, riesgo, incertidumbre y petición de humano.

Aceptación: Cliente puede pedir humano sin que el modelo lo disuada para mejorar métricas.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C28-T02

Crear paquete mínimo con fuentes, acción pendiente y permisos.

Aceptación: Receptor no obtiene export de todo el tenant.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C28-T03

Implementar offered/acknowledged/working/completed/returned.

Aceptación: Cada transición tiene responsable y evidencia, no nombre decorativo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C28-T04

Pausar mensajes autónomos al tomar control humano.

Aceptación: Job ya en cola revalida antes de enviar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C28-T05

Crear timeout de aceptación y fallback operacional declarado.

Aceptación: No afirmar que un humano está trabajando sin ACK real.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C28-T06

Coordinar derivación a ventas/legal/redes mediante contrato de datos.

Aceptación: Servicios solapados no ejecutan dos veces el mismo efecto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C28-T07

Probar devolución al twin, receptor sin permiso y handoff duplicado.

Aceptación: Contexto/presupuesto/mandato se revalidan al retomar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C28-G01 — NOT_EXECUTED:** Humano toma caso mientras twin termina borrador: no hay envío autónomo tardío.
- **CLI-C28-G02 — NOT_EXECUTED:** Handoff al repo hermano sin ACL/contrato válido queda pendiente y minimizado.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, V02, V07. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
