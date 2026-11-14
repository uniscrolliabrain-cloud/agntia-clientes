# CLI-C41 — Operaciones, CI y release controlada

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/41-operaciones-ci-y-release-controlada.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Preparar despliegue reversible y recuperación probada.

## Artefactos previstos
- `docs/operations/`
- `.github/workflows/ci.yml`
- `infra/`

## Invariante
No desplegar producción ni comprar servicios sin aprobación específica del owner.

## Dependencias y contrato
Dependencias: CLI-C40. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: S01, S02, H01, V03.

## Tareas originales, sin granularizar
- **CLI-C41-T01:** Definir CI lint/typecheck/unit/contract/security/browser e integración por entorno. **Aceptación prevista:** No jobs verdes que omiten pruebas críticas sin declarar skip.
- **CLI-C41-T02:** Fijar dependencias/imágenes/digests y secrets externos en staging. **Aceptación prevista:** No latest móvil o credenciales reales en ejemplos/evidencias.
- **CLI-C41-T03:** Crear runbooks outage, rotación, DLQ, reconciliación e incidente. **Aceptación prevista:** Cada uno tiene señal, responsable, pasos y verificación de salida.
- **CLI-C41-T04:** Probar backup/restore y feature flags por conector/tenant. **Aceptación prevista:** Rollback detiene nuevos efectos sin borrar links/audit/receipts.
- **CLI-C41-T05:** Definir release de policy/KB/modelos con eval y rollout canario. **Aceptación prevista:** Cambio de prompt no va directo a todos los clientes.
- **CLI-C41-T06:** Medir capacidad/alertas y coste con carga sintética declarada. **Aceptación prevista:** SLA comercial no se inventa a partir de un benchmark local.
- **CLI-C41-T07:** Preparar paquete instalable y guía de staging/producción revisable. **Aceptación prevista:** Build/instalación probados; artefactos, límites y gates pendientes visibles.

## Gates previstos, NO ejecutados
- CLI-C41-G01: Apagar proveedor a mitad de dispatch mantiene intent reconciliable tras rollback.
- CLI-C41-G02: Restore completo preserva aislamiento, supresiones y estado de mensajes sin reenvío.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
