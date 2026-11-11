# CLI-C27 · Jobs, outbox y reconciliación

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia27/42. Dependencia: CLI-C26.

## Objetivo e invariante

Hacer recuperables operaciones sin prometer exactly-once HTTP.

Invariante: No reintentar una escritura incierta sin resolver su estado remoto.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/jobs/`
- `packages/outbox/`
- `packages/reconcile/`

## Tareas, en orden

### CLI-C27-T01

Persistir intent, audit, key y outbox en transacción local.

Aceptación: Crash previo a commit no deja effect huérfano ni cursor avanzado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C27-T02

Implementar leases/fencing, estados y takeover con límites.

Aceptación: Worker viejo no confirma estado local después de perder lease.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C27-T03

Revalidar actor delegado, handoff, scope, approval y budget antes de HTTP.

Aceptación: Una cola durable no conserva permisos revocados.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C27-T04

Clasificar pre-dispatch, rejected, accepted y outcome_unknown.

Aceptación: Error genérico no se transforma automáticamente en failed seguro para retry.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C27-T05

Implementar reconciliador por proveedor y referencias verificables.

Aceptación: Sin lookup suficiente se crea tarea humana y bloqueo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C27-T06

Definir retry de lecturas, backoff,429, DLQ y cancelación.

Aceptación: Presupuesto de reintentos finito; cancel no dice que remoto se deshizo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C27-T07

Inyectar fallos antes/después de HTTP/ACK y jobs duplicados.

Aceptación: Efecto único o incertidumbre visible, con evidencia de cada intento.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C27-G01 — NOT_EXECUTED:** Proveedor aceptó, crash antes de ACK: replay no crea segundo mensaje.
- **CLI-C27-G02 — NOT_EXECUTED:** Worker recupera lease de otro tras suspensión de tenant: deniega sin HTTP.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, A01, A07. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
