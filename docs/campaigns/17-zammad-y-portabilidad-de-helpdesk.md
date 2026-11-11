# CLI-C17 · Zammad y portabilidad de helpdesk

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia17/42. Dependencia: CLI-C16.

## Objetivo e invariante

Permitir alternativa operativa con API y permisos probados.

Invariante: Grupos de helpdesk no demuestran aislamiento tenant fuerte sin pruebas.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/adapters/zammad/`
- `docs/adapters/zammad.md`
- `tests/integration/zammad.test.ts`

## Tareas, en orden

### CLI-C17-T01

Fijar versión/licencia y laboratorio con permisos mínimos.

Aceptación: Instalación/roles/grupos documentados, sin respaldo de superusuario.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C17-T02

Validar capacidad de aislamiento del despliegue elegido.

Aceptación: Si grupos no bastan, exigir instancia separada o deshabilitar modo compartido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C17-T03

Descubrir lectura de usuarios/tickets/artículos y ACL reales.

Aceptación: No usar export/search global con token administrativo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C17-T04

Mapear cliente, artículo interno/público y estados.

Aceptación: Visibilidad y autor no se pierden al normalizar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C17-T05

Implementar sync y conflictos con ExternalLinks.

Aceptación: Cambio/borrado remoto conserva historia y frescura.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C17-T06

Proponer writes de caso/artículo con aprobación e incertidumbre.

Aceptación: Sin borrar historial ni reenviar conversación al migrar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C17-T07

Probar export/import de salida entre backend fake y Zammad.

Aceptación: Totales/links reconciliados; replay no provoca mensajes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C17-G01 — NOT_EXECUTED:** Token limitado intenta buscar tickets de grupo/instancia ajena y queda bloqueado.
- **CLI-C17-G02 — NOT_EXECUTED:** Migración de helpdesk conserva mensajes como histórico, no como envíos nuevos.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: R05, A04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
