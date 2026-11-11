# CLI-C24 · Conocimiento versionado y RAG autorizado

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia24/42. Dependencia: CLI-C23.

## Objetivo e invariante

Responder desde artículos vigentes con ACL y evidencia.

Invariante: No se recuperan chunks de otro tenant ni se publica conocimiento por inferencia.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/knowledge/`
- `packages/retrieval/`
- `tests/rag-acl.test.ts`

## Tareas, en orden

### CLI-C24-T01

Definir lifecycle draft/reviewed/published/retired y vigencia por versión.

Aceptación: Aprobación humana y fuente verificables para conocimiento utilizable.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C24-T02

Ingerir documentos con hash/origen/licencia y sanitización.

Aceptación: Página externa no se convierte automáticamente en política del negocio.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C24-T03

Indexar chunks tenant-scoped con ACL/purpose/locale.

Aceptación: Reindexación conserva linaje y no abre permisos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C24-T04

Implementar retrieval filtrado antes y después de búsqueda.

Aceptación: Score alto no supera falta de autorización documental.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C24-T05

Crear citas a versión/fragmento y detectar contradicciones.

Aceptación: Dato ausente/obsoleto conduce abstención o revisión, no relleno inventado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C24-T06

Definir publicación de help center separado de KB privada.

Aceptación: No se sirve una nota interna por marcar público un snippet.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C24-T07

Probar revocación, borrado, caché y ataques dentro de documentos.

Aceptación: Contenido retirado deja de responder en sesiones/jobs posteriores.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C24-G01 — NOT_EXECUTED:** ArtículoB con palabras idénticas a consultaA nunca llega al modeloA.
- **CLI-C24-G02 — NOT_EXECUTED:** Cambiar artículo después de aprobar respuesta invalida o exige revisión según contrato.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: P04, P05, V03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
