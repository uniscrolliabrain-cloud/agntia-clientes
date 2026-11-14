# CLI-C37 · Costes, cuotas y backpressure

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia37/42. Dependencia: CLI-C36.

## Objetivo e invariante

Aplicar presupuesto transaccional sin degradar aislamiento.

Invariante: Las bolsas Lite/L/XL son hipótesis hasta medir tarifas/volumen; nunca gasto implícito.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/budget/`
- `packages/quotas/`
- `tests/budget-concurrency.test.ts`

## Tareas, en orden

### CLI-C37-T01

Verificar precios/versiones de proveedores elegidos sin contratar.

Aceptación: Cotización/moneda/IVA/minimos documentados; unknown bloquea gasto no aprobado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C37-T02

Definir reservas por tenant/operación/modelo/canal y reconciliación.

Aceptación: Concurrentes no gastan dos veces el mismo saldo.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C37-T03

Instrumentar tokens, retrieval, minutosAV, egress y costes fijos.

Aceptación: Coste por éxito estricto y por caso abierto, no solo por token.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C37-T04

Aplicar rate-limit separado de budget y prioridad de colas.

Aceptación: Ruido de un cliente no paraliza tenants restantes.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C37-T05

Crear modelo de routing barato/escalado con región/retención/política.

Aceptación: Fallback no traslada datos a proveedor no aprobado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C37-T06

Aplicar límites de Anam/canales y fallback texto o bloqueo.

Aceptación: Plan insuficiente no activa cargo o suscripción automática.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C37-T07

Probar agotamiento, factura tardía y ajuste de reserva.

Aceptación: Receipts/coste observado reconciliables y aviso de desviación real.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C37-G01 — NOT_EXECUTED:** Dos workers reservan el último saldo simultáneamente: uno queda bloqueado.
- **CLI-C37-G02 — NOT_EXECUTED:** Precio/plan mínimo supera bolsa30: función optativa se deshabilita o propone cambio.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, N01, A07. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C37](reports/C37.md) · estado del gate: **PASS** · CLI-C37.
