# CLI-C09 — Registro de proveedores, OAuth y secretos

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/09-registro-de-proveedores-oauth-y-secretos.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Restringir endpoints y credenciales a configuración administrativa verificada.

## Artefactos previstos
- `packages/integrations/registry.ts`
- `packages/secrets/`
- `tests/security/egress.test.ts`

## Invariante
El agente nunca elige baseURL, token, método o workspace remoto libremente.

## Dependencias y contrato
Dependencias: CLI-C08. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: A01, A02, A03, A04.

## Tareas originales, sin granularizar
- **CLI-C09-T01:** Definir conexiones aprobadas por tenant con endpointRef y secretRef. **Aceptación prevista:** No se serializan claves o nombres internos innecesarios al portal.
- **CLI-C09-T02:** Aplicar allowlist TLS/host/puerto y egress resistente a SSRF. **Aceptación prevista:** IP metadata, credenciales en URL, redirect y DNS rebinding están contemplados.
- **CLI-C09-T03:** Implementar OAuth por proveedor con state/PKCE y callback bound al tenant. **Aceptación prevista:** Callback de otra sesión no conecta la cuenta equivocada.
- **CLI-C09-T04:** Crear scopes mínimos y rotación/revocación sin perder links. **Aceptación prevista:** Revocar secreto degrada conexión y detiene nuevos efectos sin fallback admin.
- **CLI-C09-T05:** Normalizar errores y límites de respuesta, archivo y timeout. **Aceptación prevista:** HTML/oversize/traceback remoto no pasan al usuario o logs sin sanitizar.
- **CLI-C09-T06:** Definir modo dev con secretos ficticios y producción con gestor externo. **Aceptación prevista:** Entorno sin secreto devuelve not_configured y no envía a cuenta demo ajena.
- **CLI-C09-T07:** Probar centinelas en logs, reportes, frontend y eventos. **Aceptación prevista:** Cero apariciones de API keys, JWT y DSN en salidas observables.

## Gates previstos, NO ejecutados
- CLI-C09-G01: URL169.254.169.254 o endpoint de otro tenant rechazado antes de HTTP.
- CLI-C09-G02: Rotar credencial durante una lease invalida ejecución y conserva reconciliación pendiente.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
