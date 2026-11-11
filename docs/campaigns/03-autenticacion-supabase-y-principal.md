# CLI-C03 · Autenticación Supabase y principal

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia3/42. Dependencia: CLI-C02.

## Objetivo e invariante

Resolver identidad y tenant desde prueba verificable, sin fallback.

Invariante: Un JWT válido no concede acceso sin membresía y scope del recurso.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/auth/`
- `tests/security/jwt.test.ts`
- `docs/auth-contract.md`

## Tareas, en orden

### CLI-C03-T01

Fijar proyecto, issuer, audience, JWKS y algoritmos permitidos por servidor.

Aceptación: Token de otro proyecto no elige endpoint ni algoritmo de validación.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C03-T02

Implementar verificación de firma, exp, nbf, tolerancia y rotación de claves.

Aceptación: Firma inválida/alg none/caducado fallan; JWKS caído no habilita legacy.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C03-T03

Resolver sub a usuario activo y tenant claim a membresía provisionada.

Aceptación: user_metadata editable y primer login sin autoridad no crean acceso.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C03-T04

Mantener tenantId opaco y roles empresariales de servidor.

Aceptación: authenticated no implica owner; IDs arbitrarios del body no cambian principal.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C03-T05

Definir sesiones de portal y cambio de tenant con invalidación de caché.

Aceptación: Dos pestañas no heredan contexto privado tras cambiar/revocar tenant.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C03-T06

Crear credencial de servicio y mandato de ejecución desde contexto autorizado.

Aceptación: Worker no suplanta JWT humano ni guarda access token indefinidamente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C03-T07

Probar matriz negativa de claims, suspensión, roles y acceso externo.

Aceptación: 401/403/404 son consistentes y sin metadatos de otro cliente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C03-G01 — NOT_EXECUTED:** Token de A con tenant_id B y user_metadata owner no autoriza B.
- **CLI-C03-G02 — NOT_EXECUTED:** Revocar membresía con job pendiente: el efecto queda denegado antes de HTTP.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, S01, S02. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
