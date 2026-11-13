# CLI-C27 — Jobs, outbox y reconciliación

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/27-jobs-outbox-y-reconciliacion.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Hacer recuperables operaciones sin prometer exactly-once HTTP.

## Artefactos previstos
- `packages/jobs/`
- `packages/outbox/`
- `packages/reconcile/`

## Invariante
No reintentar una escritura incierta sin resolver su estado remoto.

## Dependencias y contrato
Dependencias: CLI-C26. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, A01, A07.

## Tareas originales, sin granularizar
- **CLI-C27-T01:** Persistir intent, audit, key y outbox en transacción local. **Aceptación prevista:** Crash previo a commit no deja effect huérfano ni cursor avanzado.
- **CLI-C27-T02:** Implementar leases/fencing, estados y takeover con límites. **Aceptación prevista:** Worker viejo no confirma estado local después de perder lease.
- **CLI-C27-T03:** Revalidar actor delegado, handoff, scope, approval y budget antes de HTTP. **Aceptación prevista:** Una cola durable no conserva permisos revocados.
- **CLI-C27-T04:** Clasificar pre-dispatch, rejected, accepted y outcome_unknown. **Aceptación prevista:** Error genérico no se transforma automáticamente en failed seguro para retry.
- **CLI-C27-T05:** Implementar reconciliador por proveedor y referencias verificables. **Aceptación prevista:** Sin lookup suficiente se crea tarea humana y bloqueo.
- **CLI-C27-T06:** Definir retry de lecturas, backoff,429, DLQ y cancelación. **Aceptación prevista:** Presupuesto de reintentos finito; cancel no dice que remoto se deshizo.
- **CLI-C27-T07:** Inyectar fallos antes/después de HTTP/ACK y jobs duplicados. **Aceptación prevista:** Efecto único o incertidumbre visible, con evidencia de cada intento.

## Gates previstos, NO ejecutados
- CLI-C27-G01: Proveedor aceptó, crash antes de ACK: replay no crea segundo mensaje.
- CLI-C27-G02: Worker recupera lease de otro tras suspensión de tenant: deniega sin HTTP.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
