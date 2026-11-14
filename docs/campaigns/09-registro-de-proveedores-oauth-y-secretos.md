# CLI-C09 · Registro de proveedores, OAuth y secretos

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia9/42. Dependencia: CLI-C08.

## Objetivo e invariante

Restringir endpoints y credenciales a configuración administrativa verificada.

Invariante: El agente nunca elige baseURL, token, método o workspace remoto libremente.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/integrations/registry.ts`
- `packages/secrets/`
- `tests/security/egress.test.ts`

## Tareas, en orden

### CLI-C09-T01

Definir conexiones aprobadas por tenant con endpointRef y secretRef.

Aceptación: No se serializan claves o nombres internos innecesarios al portal.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C09-T02

Aplicar allowlist TLS/host/puerto y egress resistente a SSRF.

Aceptación: IP metadata, credenciales en URL, redirect y DNS rebinding están contemplados.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C09-T03

Implementar OAuth por proveedor con state/PKCE y callback bound al tenant.

Aceptación: Callback de otra sesión no conecta la cuenta equivocada.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C09-T04

Crear scopes mínimos y rotación/revocación sin perder links.

Aceptación: Revocar secreto degrada conexión y detiene nuevos efectos sin fallback admin.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C09-T05

Normalizar errores y límites de respuesta, archivo y timeout.

Aceptación: HTML/oversize/traceback remoto no pasan al usuario o logs sin sanitizar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C09-T06

Definir modo dev con secretos ficticios y producción con gestor externo.

Aceptación: Entorno sin secreto devuelve not_configured y no envía a cuenta demo ajena.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C09-T07

Probar centinelas en logs, reportes, frontend y eventos.

Aceptación: Cero apariciones de API keys, JWT y DSN en salidas observables.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C09-G01 — NOT_EXECUTED:** URL169.254.169.254 o endpoint de otro tenant rechazado antes de HTTP.
- **CLI-C09-G02 — NOT_EXECUTED:** Rotar credencial durante una lease invalida ejecución y conserva reconciliación pendiente.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: A01, A02, A03, A04. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C09](reports/C09.md) · estado del gate: **PASS** · CLI-C09.
