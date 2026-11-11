# Handoff para la IA implementadora

Entrega documental 2/9, 2026-11-11. Trabajar solo en `uniscrolliabrain-cloud/agntia-clientes`. **El propietario prohíbe modificar agente.** Se ha leído su código como referencia selectiva; no se ha aplicado integración allí. El repositorio local documental está en `/workspace/agntia-clientes`; otras máquinas deben obtener su propio checkout desde GitHub.

## Intención del propietario

Construir una familia de empresas SaaS especialistas para el OS empresarial multiagéntico: cada una puede servir a clientes del padre o externos, ofrecer interfaz humana profesional con Anam y ejecutar trabajo determinista asistido por agentes. Se permite duplicar servicios. El agente que opera el servicio ya vive en `/agente` y tiene un twin vinculado en este repo. Todos los servicios son multitenant con JWT de Supabase y aislamiento probado, con nomenclatura/linaje del padre. No crear otra autoridad canónica ni reducir portal externo a una demo.

Esta entrega no autoriza escribir implementación: diseña el trabajo para otra IA. Cuando el owner lo autorice, seguir [campaña](../campaigns/README.md) y [manifest](../campaigns/campaign.json). Hay42 fases,294 tareas y84 escenarios pendientes. No considerar documentos, rutas propuestas o tests especificados como código existente. Los checks de esta entrega son documentales.

## Antes de codificar

Leer producto, arquitectura, Supabase/twins, contratos, fuentes y mapas. Congelar main propio y padre; cotejar cambios desde54b8d5407a8576459448c4d059a877297d18ca7a. El mapa de lectura no es auditoría completa; repetir lecturas pertinentes si cambia el host. Investigar instrucciones locales aplicables. Resolver índice default12 frente a catálogo base16 antes de vincular roles, sin crear agentes aquí. No usar credenciales publicadas por terceros para benchmarks ni llamar a sus demos.

Elegir stack TypeScript/Hono/pnpm de este diseño o justificar ADR compatible. Postgres/Supabase y jobs transaccionales, no confundir service_role con RLS seguro. Mantener Actor, provenance, Task y SystemEvent nativos por mapeo explícito; no modificar parent enum/claims para que el test propio pase. Documentar un patch propuesto si es necesario y dejar gate real bloqueado.

## Orden de construcción

C01–C10 fundaciones y seguridad. C11–C20 directorio/conectores/canales. C21–C30 inbox/evidencia/casos/SLA/KB/propuestas/approvals/jobs/handoff/onboarding/success. C31–C40 procesos sensibles como propuestas, Anam/portal/SDK/bridge/reportes/costes/privacidad/seguridad/E2E. C41–C42 operaciones y aceptación. La dependencia secuencial exige cerrar gates; un módulo no probado no se habilita por existir sus archivos.

El primer camino real puede usar solo Chatwoot+núcleo local. Twenty/Frappe/Zammad son alternativas, no dependencias obligatorias simultáneas. Si no hay Docker/red/permisos, ejecutar unit/contratos locales y registrar integración real NOT_VERIFIED; no maquillar con mocks. Los costes variables y los planes AV se miden, no se contratan para forzar un gate.

## Invariantes críticas

No acceso a otro tenant ni a otro contacto sin ACL. No tenant elegido por LLM o por user_metadata. No twin con autoridad propia o memoria global de clientes. No efecto sin policy y autorización de payload/alcance; humano inicialmente. No refund/pago/firma ni decisión jurídica en el piloto. No doble envío tras timeout, cambio de canal o restauración. No secrets/PII en Git/logs/reportes/eventos. No respuesta enviada igual a resolución verificada. No tareas ficticias o recepciones sin ACK.

## Reporte cada cinco fases

Informar después de5,10,15,20,25,30,35,40 y42. Para cada una: PASS/BLOCKED/NOT_VERIFIED, commit/PR SHA, cambios, pruebas realmente ejecutadas/pasadas/fallidas/skipped, ambiente/versiones, fixture initial/final, receipts, capacidades/limitaciones, coste e incidentes. Mantener diff pequeño y no avanzar tras fallo crítico. El check documental actual no representa PASS de ninguna fase de implementación.

## Definición de listo para piloto

Fixture de dos tenants y operador, Supabase y delegación/twins comprobados, datos y búsqueda aislados, propuesta con citas, aprobación invalidable, envío sandbox con reconciliación, toma humana sin doble respuesta, casos/SLA y reportes reproducibles. Probar backup/restore/supresión y fallos; lista de conectores reales por versión/edición, costes e instrucciones. Producción y wiring del padre quedan para aprobación separada, nunca automatizados por terminar la campaña.
