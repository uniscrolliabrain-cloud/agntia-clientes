# Presupuesto y coste por tenant

Escenarios de diseño, no precios contratados ni cotización de proveedores. Se toman como envolventes exploratorias Lite30€, L70€ y XL300€ al mes por tenant, coherentes con la preferencia previa de controlar gasto. No se promete que esos importes incluyan cualquier volumen, todo Anam, personal humano, IVA o margen. El owner decidirá precio comercial y pooling. No se ha comprado ningún plan ni ejecutado gasto.

| Bolsa mensual ilustrativa | Lite30 | L70 | XL300 |
|---|---:|---:|---:|
| Infra/DB/backups asignados | 10 | 20 | 70 |
| Inferencia y embeddings | 8 | 20 | 80 |
| Canales/proveedores de mensaje | 4 | 10 | 40 |
| Visio/voz opcional | 0 | 5 | 50 |
| Observabilidad y almacenamiento | 3 | 5 | 25 |
| Reserva de variación | 5 | 10 | 35 |
| Total hipótesis | 30 | 70 | 300 |

Cada número es una asignación propuesta, no una tarifa observada. Si un mínimo de Anam, cloud o canal supera la bolsa, desactivar ese extra o presentar nueva propuesta al owner; no excederla silenciosamente. La demo local evita una factura de hosting pero no elimina electricidad, hardware, APIs pagadas o tiempo de operación. Software libre no equivale a mantenimiento gratuito. No asumir que los planes enterprise de referentes caben en estos escenarios.

Modelo económico: coste fijo asignado + tokens de entrada/salida + retrieval/reranking + minutos AV/voz + mensajes por país/categoría + storage/egress + ejecuciones/jobs + soporte y operación. La tarifa de canal se versiona y vincula a cotización/fuente verificada; no se codifican precios de memoria. El piloto mide workload sintético y reporta supuestos, volumen y sensibilidad.

Ejemplo de hoja de cálculo propuesta:1000 propuestas con1800 tokens de entrada y300 de salida generan1.8M de entrada y0.3M de salida antes de retries, tools y cache. Multiplicar por las tarifas aprobadas del modelo; no afirmar una cifra monetaria sin ellas.50 sesiones de5 minutos son250 minutos AV; con precio/minuto y mínimo de plan reales puede romper el presupuesto Lite. Registrar p50/p95 y coste de éxito estricto, no solo coste medio por respuesta generada.

## Control determinista

BudgetReservation por tenant/servicio/operationKey y moneda; reserva antes de gasto, consumo observado, liberación/reconciliación y umbrales. Concurrencia transaccional impide doble gastar. El LLM puede elegir entre modelos aprobados para el tipo de tarea, nunca libremente un endpoint o plan. Modelo económico para clasificación/resumen; escalado a otro verificado cuando la tarea lo requiere y hay saldo. Si cambia región/retención/calidad, no activar fallback automáticamente sin cumplir política.

Visio tiene límite de duración, concurrencia y recarga; canal externo límites de velocidad, horario y destinatarios. Rate-limit y budget son controles distintos. Al agotar presupuesto conservar lectura y estado, ofrecer borrador/fallback texto cuando permitido y escalar; no marcar mensajes como enviados o tareas como hechas para evitar mostrar el bloqueo. El cumplimiento y aislamiento no se degradan con el plan barato.
