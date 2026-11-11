# Aceptación del piloto: checklist pendiente

Estado de todos los puntos: **NOT_EXECUTED**. Este archivo no acredita producto funcional ni aceptación del owner.

| Gate | Evidencia mínima |
|---|---|
| Baseline | SHAs propio/padre/upstreams, licencias, instrucciones y discrepancias |
| Identidad | JWT Supabase verificado, membership, actor nativo y scope; negativos de issuer/alg/exp |
| Twin | Binding canónico, revisión/mandato y revocación; origen/tenant objetivo explícitos |
| Datos | FKs/RLS/roles reales, ACL de contacto y campo, búsquedas/Storage/Realtime/export/jobs aislados |
| Directorio | Contactos/organizaciones/identidades de canal; homónimos sin merge automático |
| Casos | FSM/CAS, ResolutionContract, SLA versionado y handoff con ACK |
| Conocimiento | Versiones/ACL/citas; revocación e información insuficiente |
| Efectos | Preview, aprobación humana del payload final, key/hash y ledger; un solo emisor |
| Fallos | Crash antes/después de HTTP y ACK; incertidumbre bloqueada y reconciliable |
| Portal/AV | Roles/móvil/accesibilidad y ES/EN/FR; Anam acotado o disabled con fallback útil |
| Reportes | Snapshot/fuentes/cobertura, FRT/CSAT honestos y coste real |
| Operación | Restauración/rollback sin reenvío, retención/supresión, rotación y runbooks |
| Integración | Contratos SDK/Hono/host; fake claramente separado de conexión real |

Objetivo cuantitativo crítico:0 fugas tenant/contacto,0 secretos centinela,0 approvals fabricadas,0 envíos duplicados por replay,0 pagos/refunds/firma ejecutados fuera de alcance. Cada prueba crítica debe pasar realmente; cualquiera fallida bloquea. No inventar objetivos de p95, cobertura o resolución alcanzados: medirlos con carga/configuración registradas.

Ejecutar E2E A–I de [evaluación](../09-evaluacion-y-fixtures.md). Un conector optativo no probado queda deshabilitado y fuera de la oferta del piloto. Publicar matriz por versión/edición y permisos. No se exige activar todos los CRMs alternativos para demostrar la primera vertical; sí se exige honestidad sobre sus gates.

El owner evalúa un resultado concreto con demo sintética reproducible, reporte de resultados y riesgos. Hasta autorización de implementación no hay pruebas de producto. Hasta aprobación de producción no se despliega ni importa data real. No se modifica `/agente` en esta entrega; su eventual wiring requiere un encargo distinto.
