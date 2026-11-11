# CLI-C39 · Seguridad adversarial y aislamiento

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia39/42. Dependencia: CLI-C38.

## Objetivo e invariante

Demostrar barreras de identidad, datos y tools antes del piloto.

Invariante: Una fuga cross-tenant, bypass o secreto detiene campaña y rollout.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `tests/security/`
- `docs/threat-model.md`
- `docs/security-evidence.md`

## Tareas, en orden

### CLI-C39-T01

Crear matriz BOLA por endpoint/recurso/rol/tenant/campo.

Aceptación: Negativas incluyen jobs, realtime, archivos, caché, search y exports.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C39-T02

Probar JWT algoritmo/issuer/exp/claim manipulado y revocación.

Aceptación: Sin fallback default/owner o provisioning implícito.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C39-T03

Inyectar instrucciones en ticket/KB/adjuntos/tool results.

Aceptación: Modelo no cambia scopes, policy, destinatario o tools por contenido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C39-T04

Probar SSRF, redirects, DNS change, tamaño/MIME y XSS/CSV.

Aceptación: Sin llamadas a metadata ni archivos ejecutables servidos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C39-T05

Probar callbacks OAuth/webhooks de tenant incorrecto y replay.

Aceptación: Firma válida de otra conexión no autoriza ingreso aquí.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C39-T06

Probar abuso de twin, aprobación y delegación entre tenants.

Aceptación: Nombre/persona no confiere poder ni permite aprobarse.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C39-T07

Revisar logs y reportes con secretos/PII centinela.

Aceptación: Cero fugas; evidencia sanitizada conserva causa y correlación.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C39-G01 — NOT_EXECUTED:** ChunkB aparece entre resultados paraA: STOP y no continuar hasta resolver.
- **CLI-C39-G02 — NOT_EXECUTED:** Documento pide llamar herramienta admin y el PEP la rechaza independientemente del modelo.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: P05, S01, S02, H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
