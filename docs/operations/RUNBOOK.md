# Runbook diseñado para la implementación futura

Estado NOT_IMPLEMENTED/NOT_EXECUTED. No ejecutar estos procesos contra clientes reales como parte de esta entrega. Cada procedimiento necesita comando concreto, versión, responsable, prueba y evidencia antes de operar. Feature flags y tablas se describen como contratos de diseño, no utilidades ya instaladas.

## Arranque y configuración

Staging aislado con fixtures sintéticos, Supabase proyecto/issuer/audience/JWKS aprobados, provisioning de miembros, Postgres y roles revisados. Secret manager con refs por conexión, URLs aprobadas y egress limitado. Inicialmente deshabilitar writes, conectores sin capability report y sesiones AV pagadas. Vincular canónico/twin/mandato sin modificar padre; si el bridge real no existe, anunciar HOST_BRIDGE_NOT_VERIFIED. Verificar migraciones, RLS, backup, restore y health semántico antes de cargar datos.

No usar claves administrativas en navegador o tools LLM. Probar revocación de membresía y mandato. Rotar claves/JWKS con caché controlada y prueba de tokens nuevos/retirados. Sin conexión al proveedor de identidad, fallar cerrado conforme a vigencia/caché aceptadas, no caer a default.

## Proveedor caído o degradado

Confirmar categoría de error y alcance tenant/conexión/capacidad. Suspender nuevos dispatches de esa capacidad; mantener lectura del snapshot con freshness visible. No rotar el canal a otro emisor para «arreglar» un envío incierto. Guardar intent/receipt/correlación y reconciliar cuando vuelva. Lecturas tienen backoff finito; escrituras inciertas requieren lookup seguro o intervención humana. Registrar qué mensaje no se puede confirmar sin exponer contenido privado.

## Recuperación de jobs

Listar jobs scoped y leases, comprobar fencing y vencimiento. Antes de takeover revalidar tenant, actor delegado, mandato, approval, handoff y budget. DLQ con causa clasificada; repetir solo tras revisión de efecto remoto/idempotency window. ACK posterior al commit local. Una cancelación local no demuestra que el proveedor canceló lo que ya aceptó.

## Incidente de seguridad

Cortar capacidades del tenant/conexión afectados y mandatos comprometidos; preservar evidencia minimizada de intentos y accesos. Evaluar alcance humano/técnico, datos expuestos, recuperación y obligaciones de notificación aplicables con responsables reales. No destruir logs para ocultar fuga; no conservar PII innecesaria indefinidamente. Preparar reporte sanitizado y verificación negativa antes de reabrir. No anunciar cumplimiento/certificaciones por cerrar un incidente.

## Backup, restore y rollback

Backups cifrados con claves separadas, acceso mínimo, retención y restauración periódica en entorno aislado. Comparar datos, links, audit, cursores, intents e índices; reaplicar supresiones/restricciones aprobadas desde el backup. Restaurar no reenvía outbox confirmada ni reutiliza mandatos caducados. El rollback de release detiene nuevos efectos conservando historia; migraciones aditivas compatibles y plan manual si hay cambio de estructura. No borrar mensajes remotos para simular reversión.

## Operación ordinaria y release

Dashboard de lag, errores, outcome_unknown, cola de revisión, SLA real, costes y freshness. Alertas con umbrales calibrados en pruebas, no promesas de disponibilidad inventadas. Rota empresarial en agente; tareas técnicas y plazos del servicio no crean otro empleado ficticio. Policy/KB/modelo con versión candidata, evaluación, revisión, rollout canario y rollback. Después de cada cinco campañas entregar SHA, resultados, riesgos y siguiente gate. Producción requiere aceptación explícita del owner en un encargo posterior.
