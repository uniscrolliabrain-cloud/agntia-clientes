# CLI-C01 · Baseline y perímetro de solo lectura

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia1/42. Dependencia: ninguna.

## Objetivo e invariante

Congelar estado propio, padre y fuentes antes de implementar.

Invariante: No cambiar agente; ninguna capacidad documental cuenta como implementada.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `docs/baseline.md`
- `docs/host-diff.md`
- `docs/evidence/c01/`

## Tareas, en orden

### CLI-C01-T01

Anotar SHA propio/padre, fecha, árbol, instrucciones aplicables y límites de acceso.

Aceptación: Registro reproducible con ausencia o existencia de checkout/credenciales explícita.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C01-T02

Inventariar rutas, paquetes y tipos relevantes del padre, sin ejecutar mutaciones.

Aceptación: Mapa de nombres con ruta, blob y alcance de lectura; ningún símbolo supuesto como real.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C01-T03

Cotejar catálogo base y personas default, diferenciando plantilla de ejecución.

Aceptación: Discrepancia12/16 registrada y resolución pendiente; no crear nuevos agentes para compensarla.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C01-T04

Comprobar que la entrega inicial solo tiene documentación y registrar su manifest.

Aceptación: Conteos y hashes de archivos; no atribuir a baseline tests de producto inexistentes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C01-T05

Definir matriz de herramientas disponibles y bloqueos de Docker, red y sandbox.

Aceptación: Cada gate real tiene responsable, entorno requerido y estado NOT_VERIFIED si falta.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C01-T06

Revalidar términos/licencias/fechas de las fuentes que se usarán en la primera vertical.

Aceptación: Fuente primaria y versión; incertidumbre no se transforma en permiso.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C01-T07

Preparar bitácora de evidencia y checkpoint con riesgos preexistentes.

Aceptación: Informe distingue evidencia previa, verificación propia y cambios propuestos.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C01-G01 — NOT_EXECUTED:** Cambiar el padre entre dos lecturas: detener compatibilidad hasta cotejar SHAs.
- **CLI-C01-G02 — NOT_EXECUTED:** Intentar declarar un conector listo sin ejecutar nada: gate rechaza la afirmación.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
