# CLI-C24 — Conocimiento versionado y RAG autorizado

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/24-conocimiento-versionado-y-rag-autorizado.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Responder desde artículos vigentes con ACL y evidencia.

## Artefactos previstos
- `packages/knowledge/`
- `packages/retrieval/`
- `tests/rag-acl.test.ts`

## Invariante
No se recuperan chunks de otro tenant ni se publica conocimiento por inferencia.

## Dependencias y contrato
Dependencias: CLI-C23. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: P04, P05, V03.

## Tareas originales, sin granularizar
- **CLI-C24-T01:** Definir lifecycle draft/reviewed/published/retired y vigencia por versión. **Aceptación prevista:** Aprobación humana y fuente verificables para conocimiento utilizable.
- **CLI-C24-T02:** Ingerir documentos con hash/origen/licencia y sanitización. **Aceptación prevista:** Página externa no se convierte automáticamente en política del negocio.
- **CLI-C24-T03:** Indexar chunks tenant-scoped con ACL/purpose/locale. **Aceptación prevista:** Reindexación conserva linaje y no abre permisos.
- **CLI-C24-T04:** Implementar retrieval filtrado antes y después de búsqueda. **Aceptación prevista:** Score alto no supera falta de autorización documental.
- **CLI-C24-T05:** Crear citas a versión/fragmento y detectar contradicciones. **Aceptación prevista:** Dato ausente/obsoleto conduce abstención o revisión, no relleno inventado.
- **CLI-C24-T06:** Definir publicación de help center separado de KB privada. **Aceptación prevista:** No se sirve una nota interna por marcar público un snippet.
- **CLI-C24-T07:** Probar revocación, borrado, caché y ataques dentro de documentos. **Aceptación prevista:** Contenido retirado deja de responder en sesiones/jobs posteriores.

## Gates previstos, NO ejecutados
- CLI-C24-G01: ArtículoB con palabras idénticas a consultaA nunca llega al modeloA.
- CLI-C24-G02: Cambiar artículo después de aprobar respuesta invalida o exige revisión según contrato.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
