# CLI-C12 — Importación, staging y sync

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/12-importacion-staging-y-sync.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Importar datos con validación, procedencia y reconciliación.

## Artefactos previstos
- `packages/imports/`
- `packages/sync/`
- `tests/import-replay.test.ts`

## Invariante
Importar no crea membresía, consentimiento ni estado revisado automáticamente.

## Dependencias y contrato
Dependencias: CLI-C11. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, A01, A02, A03.

## Tareas originales, sin granularizar
- **CLI-C12-T01:** Crear preview CSV/JSON con límites, encoding y protección de fórmulas. **Aceptación prevista:** Filas inválidas tienen causa y ubicación sin ejecutar contenido.
- **CLI-C12-T02:** Definir mapping versionado y staging con hashes/campos sin resolver. **Aceptación prevista:** Fuente y transformación recuperables; no inferir permiso de contacto.
- **CLI-C12-T03:** Persistir ExternalLink e idempotencia por tenant/conexión/modelo. **Aceptación prevista:** Mismo objeto repetido no duplica; colisión entre proveedores no pisa otro.
- **CLI-C12-T04:** Implementar aceptación de lote y transacción/chunks con progreso explícito. **Aceptación prevista:** Fallo parcial no aparece como importación completa.
- **CLI-C12-T05:** Definir cursores estables, overlap y watermark posterior a commit. **Aceptación prevista:** Empates de write_date y cambios de página no pierden objetos.
- **CLI-C12-T06:** Crear conflicto ante remoto cambiado/archivado y políticas de resync. **Aceptación prevista:** Dato revisado local no se sobrescribe ni historia desaparece.
- **CLI-C12-T07:** Probar1000+ contactos sintéticos, replay, cancelación y recuperación. **Aceptación prevista:** Conteos/hash reconciliados por fuente y no solo por cantidad total.

## Gates previstos, NO ejecutados
- CLI-C12-G01: Caída entre fetch y commit no avanza cursor ni duplica tras reanudar.
- CLI-C12-G02: CSV incluye fórmula y permiso=owner: se trata como dato rechazado, no configuración.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
