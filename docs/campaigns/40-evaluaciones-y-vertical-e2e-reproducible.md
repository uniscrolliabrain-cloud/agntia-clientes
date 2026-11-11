# CLI-C40 · Evaluaciones y vertical E2E reproducible

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia40/42. Dependencia: CLI-C39.

## Objetivo e invariante

Validar negocios, estado protegido y recuperación con fixtures.

Invariante: Mock y juez de lenguaje no sustituyen contrato de estado ni integración real.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `tests/e2e/`
- `tests/evals/`
- `docs/e2e-evidence.md`

## Tareas, en orden

### CLI-C40-T01

Crear fixtures propios A/B/P, roles humanos y twins con mandatos.

Aceptación: Sin datos/cuentas ajenas ni material no comercial copiado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C40-T02

Ejecutar casos A–I del plan, reseteando backend y seeds.

Aceptación: Estado inicial/final, llamadas permitidas/prohibidas y receipts registrados.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C40-T03

Combinar assertions deterministas con juez lingüístico calibrado.

Aceptación: Un tono perfecto no compensa fallo de confidencialidad/acción.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C40-T04

Probar varias seeds/turnos ES/EN/FR y cliente que actúa concurrentemente.

Aceptación: No trasladar score de benchmark o idioma distinto al producto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C40-T05

Inyectar caídas de proveedor/DB/worker y revocaciones.

Aceptación: Sin doble envío, pérdida de audit o avance de cursor indebido.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C40-T06

Medir cobertura/latencia/coste y diferenciar fake frente a real.

Aceptación: Cada conector sin laboratorio queda NOT_VERIFIED/deshabilitado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C40-T07

Preparar demo reproducible de portal externo e integrado por contrato.

Aceptación: Sin tocar padre; host real solo si otro encargo autoriza el wiring.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C40-G01 — NOT_EXECUTED:** Respuesta final correcta con acción prohibida intermedia falla la evaluación.
- **CLI-C40-G02 — NOT_EXECUTED:** E2E parece pasar pero no hay recibo del proveedor: no se acredita entrega.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: P01, P02, P03, P04, P06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
