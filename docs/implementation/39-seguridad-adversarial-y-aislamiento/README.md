# CLI-C39 — Seguridad adversarial y aislamiento

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/39-seguridad-adversarial-y-aislamiento.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Demostrar barreras de identidad, datos y tools antes del piloto.

## Artefactos previstos
- `tests/security/`
- `docs/threat-model.md`
- `docs/security-evidence.md`

## Invariante
Una fuga cross-tenant, bypass o secreto detiene campaña y rollout.

## Dependencias y contrato
Dependencias: CLI-C38. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: P05, S01, S02, H01.

## Tareas originales, sin granularizar
- **CLI-C39-T01:** Crear matriz BOLA por endpoint/recurso/rol/tenant/campo. **Aceptación prevista:** Negativas incluyen jobs, realtime, archivos, caché, search y exports.
- **CLI-C39-T02:** Probar JWT algoritmo/issuer/exp/claim manipulado y revocación. **Aceptación prevista:** Sin fallback default/owner o provisioning implícito.
- **CLI-C39-T03:** Inyectar instrucciones en ticket/KB/adjuntos/tool results. **Aceptación prevista:** Modelo no cambia scopes, policy, destinatario o tools por contenido.
- **CLI-C39-T04:** Probar SSRF, redirects, DNS change, tamaño/MIME y XSS/CSV. **Aceptación prevista:** Sin llamadas a metadata ni archivos ejecutables servidos.
- **CLI-C39-T05:** Probar callbacks OAuth/webhooks de tenant incorrecto y replay. **Aceptación prevista:** Firma válida de otra conexión no autoriza ingreso aquí.
- **CLI-C39-T06:** Probar abuso de twin, aprobación y delegación entre tenants. **Aceptación prevista:** Nombre/persona no confiere poder ni permite aprobarse.
- **CLI-C39-T07:** Revisar logs y reportes con secretos/PII centinela. **Aceptación prevista:** Cero fugas; evidencia sanitizada conserva causa y correlación.

## Gates previstos, NO ejecutados
- CLI-C39-G01: ChunkB aparece entre resultados paraA: STOP y no continuar hasta resolver.
- CLI-C39-G02: Documento pide llamar herramienta admin y el PEP la rechaza independientemente del modelo.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
