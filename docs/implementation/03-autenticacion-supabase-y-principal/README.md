# CLI-C03 — Autenticación Supabase y principal

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/03-autenticacion-supabase-y-principal.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Resolver identidad y tenant desde prueba verificable, sin fallback.

## Artefactos previstos
- `packages/auth/`
- `tests/security/jwt.test.ts`
- `docs/auth-contract.md`

## Invariante
Un JWT válido no concede acceso sin membresía y scope del recurso.

## Dependencias y contrato
Dependencias: CLI-C02. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, S01, S02.

## Tareas originales, sin granularizar
- **CLI-C03-T01:** Fijar proyecto, issuer, audience, JWKS y algoritmos permitidos por servidor. **Aceptación prevista:** Token de otro proyecto no elige endpoint ni algoritmo de validación.
- **CLI-C03-T02:** Implementar verificación de firma, exp, nbf, tolerancia y rotación de claves. **Aceptación prevista:** Firma inválida/alg none/caducado fallan; JWKS caído no habilita legacy.
- **CLI-C03-T03:** Resolver sub a usuario activo y tenant claim a membresía provisionada. **Aceptación prevista:** user_metadata editable y primer login sin autoridad no crean acceso.
- **CLI-C03-T04:** Mantener tenantId opaco y roles empresariales de servidor. **Aceptación prevista:** authenticated no implica owner; IDs arbitrarios del body no cambian principal.
- **CLI-C03-T05:** Definir sesiones de portal y cambio de tenant con invalidación de caché. **Aceptación prevista:** Dos pestañas no heredan contexto privado tras cambiar/revocar tenant.
- **CLI-C03-T06:** Crear credencial de servicio y mandato de ejecución desde contexto autorizado. **Aceptación prevista:** Worker no suplanta JWT humano ni guarda access token indefinidamente.
- **CLI-C03-T07:** Probar matriz negativa de claims, suspensión, roles y acceso externo. **Aceptación prevista:** 401/403/404 son consistentes y sin metadatos de otro cliente.

## Gates previstos, NO ejecutados
- CLI-C03-G01: Token de A con tenant_id B y user_metadata owner no autoriza B.
- CLI-C03-G02: Revocar membresía con job pendiente: el efecto queda denegado antes de HTTP.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
