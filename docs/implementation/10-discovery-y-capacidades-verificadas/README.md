# CLI-C10 — Discovery y capacidades verificadas

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/10-discovery-y-capacidades-verificadas.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Habilitar cada operación solo según despliegue y permisos comprobados.

## Artefactos previstos
- `packages/integrations/discovery/`
- `docs/capability-matrix.md`
- `tests/discovery.test.ts`

## Invariante
Documented no equivale a supported_runtime; unknown permanece deshabilitado.

## Dependencias y contrato
Dependencias: CLI-C09. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: A01, A02, A03, A04, A06.

## Tareas originales, sin granularizar
- **CLI-C10-T01:** Definir estado documented/verified/unsupported/forbidden/unknown por operación. **Aceptación prevista:** Una página de marketing no habilita una escritura.
- **CLI-C10-T02:** Consultar versión/esquema/edición/ACL con credencial de mínimo privilegio. **Aceptación prevista:** Guardar timestamp y evidencia mínima sin enumerar datos de otro tenant.
- **CLI-C10-T03:** Validar binding tenant a cuenta/workspace/sitio de proveedor. **Aceptación prevista:** No mapear por nombre visible ni primer resultado.
- **CLI-C10-T04:** Comprobar campos requeridos y semántica de paginación/errores. **Aceptación prevista:** Un200 con HTML o campos ausentes no se declara healthy.
- **CLI-C10-T05:** Persistir report versionado y caché con caducidad/invalidation. **Aceptación prevista:** Cambio de módulo/rol/schema obliga nueva verificación.
- **CLI-C10-T06:** Separar probes de lectura de operaciones con efecto/coste. **Aceptación prevista:** Discovery no crea tickets o manda mensajes para probarse sin autorización.
- **CLI-C10-T07:** Publicar health con causas sanitizadas y plan de recuperación. **Aceptación prevista:** Sin account/module/permiso aparece unsupported o forbidden, no falso éxito.

## Gates previstos, NO ejecutados
- CLI-C10-G01: Retirar permiso de mensajes mantiene lectura pero deshabilita envío.
- CLI-C10-G02: Cambiar schema de workspace invalida mapper/report previo antes de importar.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
