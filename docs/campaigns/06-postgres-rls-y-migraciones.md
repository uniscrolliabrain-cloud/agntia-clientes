# CLI-C06 · Postgres, RLS y migraciones

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia6/42. Dependencia: CLI-C05.

## Objetivo e invariante

Persistir entidades, relaciones, auditoría y colas sin fuga ni pérdida.

Invariante: Toda relación y operación persistida conserva scope; un rol privilegiado no elude policy.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/storage/`
- `migrations/`
- `tests/integration/storage.test.ts`

## Tareas, en orden

### CLI-C06-T01

Diseñar tablas tenant-scoped y FKs compuestas para contactos/casos/artefactos.

Aceptación: FK de un caso A a contacto B falla también por SQL directo autorizado de prueba.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C06-T02

Implementar migraciones versionadas con transacción y backup previo.

Aceptación: Fresh/upgrade y fallo parcial mantienen datos/auditoría preexistentes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C06-T03

Configurar RLS USING/WITH CHECK y roles reales de API/workers.

Aceptación: Probar owner/BYPASSRLS/service_role sin asumir aislamiento automático.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C06-T04

Implementar índices compuestos de links, webhook dedup e idempotency.

Aceptación: Replay concurrente no genera dos filas lógicas del mismo efecto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C06-T05

Persistir audit append-only con payload separado y retención definida.

Aceptación: Mutaciones/denegaciones tienen correlación; datos personales pueden gestionarse sin falsificar historia.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C06-T06

Probar concurrencia CAS, bloqueos, leases y transacciones outbox.

Aceptación: Crash revierte estado/outbox juntos y no deja intención parcial invisible.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C06-T07

Probar backup/restore, permisos y configuración de conexión por entorno.

Aceptación: Restauración sintética verificable; no claves ni DSN en evidencias.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C06-G01 — NOT_EXECUTED:** INSERT/UPDATE/DELETE intentan referencia cross-tenant por distintos roles de DB.
- **CLI-C06-G02 — NOT_EXECUTED:** Caída en migración o commit: restaurar y comparar hashes/conteos antes de avanzar.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: S01, S02, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C06](reports/C06.md) · estado del gate: **NOT_VERIFIED** · CLI-C06.
