# CLI-C15 · CRM Twenty opcional

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia15/42. Dependencia: CLI-C14.

## Objetivo e invariante

Adaptar personas/empresas según esquema del workspace.

Invariante: No hay un schema Twenty universal ni permiso para Metadata API del agente.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/twenty/`
- `docs/adapters/twenty.md`
- `tests/integration/twenty.test.ts`

## Tareas, en orden

### CLI-C15-T01

Revisar licencia completa por módulo y fijar versión usada.

Aceptación: Archivos Enterprise/paquetes MIT/AGPL no se clasifican por una sola etiqueta.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C15-T02

Descubrir schema REST/GraphQL del workspace y role scoped API key.

Aceptación: Campo custom se mapea solo si está confirmado y permitido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C15-T03

Validar workspace binding y seleccionar objetos/campos nominados.

Aceptación: No query GraphQL o metadata mutation libre del modelo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C15-T04

Implementar lectura/paginación de personas/empresas y relaciones.

Aceptación: IDs/sourceHash/local link mantienen cardinalidad sin dedup por nombre.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C15-T05

Proponer create/update con diff y expectedRemoteVersion verificable.

Aceptación: Campo sensible y cambio remoto exigen revisión o conflicto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C15-T06

Implementar commit autorizado solo para alcance comprobado.

Aceptación: Timeout incierto se reconcilia o bloquea, sin upsert que multiplique contactos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C15-T07

Probar esquema distinto, revocación y conflicto de fuente.

Aceptación: Adaptador reporta unsupported ante campo requerido ausente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C15-G01 — NOT_EXECUTED:** Workspace con campo distinto no recibe escritura al campo aproximado por LLM.
- **CLI-C15-G02 — NOT_EXECUTED:** CredencialB intercambiada en conexiónA falla el binding y no filtra datos.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: R02, A02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
