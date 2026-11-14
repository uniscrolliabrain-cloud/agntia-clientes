# CLI-C12 · Importación, staging y sync

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia12/42. Dependencia: CLI-C11.

## Objetivo e invariante

Importar datos con validación, procedencia y reconciliación.

Invariante: Importar no crea membresía, consentimiento ni estado revisado automáticamente.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/imports/`
- `packages/sync/`
- `tests/import-replay.test.ts`

## Tareas, en orden

### CLI-C12-T01

Crear preview CSV/JSON con límites, encoding y protección de fórmulas.

Aceptación: Filas inválidas tienen causa y ubicación sin ejecutar contenido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C12-T02

Definir mapping versionado y staging con hashes/campos sin resolver.

Aceptación: Fuente y transformación recuperables; no inferir permiso de contacto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C12-T03

Persistir ExternalLink e idempotencia por tenant/conexión/modelo.

Aceptación: Mismo objeto repetido no duplica; colisión entre proveedores no pisa otro.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C12-T04

Implementar aceptación de lote y transacción/chunks con progreso explícito.

Aceptación: Fallo parcial no aparece como importación completa.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C12-T05

Definir cursores estables, overlap y watermark posterior a commit.

Aceptación: Empates de write_date y cambios de página no pierden objetos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C12-T06

Crear conflicto ante remoto cambiado/archivado y políticas de resync.

Aceptación: Dato revisado local no se sobrescribe ni historia desaparece.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C12-T07

Probar1000+ contactos sintéticos, replay, cancelación y recuperación.

Aceptación: Conteos/hash reconciliados por fuente y no solo por cantidad total.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C12-G01 — NOT_EXECUTED:** Caída entre fetch y commit no avanza cursor ni duplica tras reanudar.
- **CLI-C12-G02 — NOT_EXECUTED:** CSV incluye fórmula y permiso=owner: se trata como dato rechazado, no configuración.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, A01, A02, A03. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C12](reports/C12.md) · estado del gate: **BLOCKED** · CLI-C12.
