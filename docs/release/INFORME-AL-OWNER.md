# Entrega2/9 · agntia-clientes

Se entrega el diseño documental de una empresa SaaS especialista en relación con clientes, atención y customer success, compatible con AgntiaPro y apta como diseño para clientes externos. El objetivo de calidad toma referentes mundiales; no se afirma paridad funcional/productiva con ellos.

**42 campañas,294 tareas con aceptación,84 escenarios de gate. Todas NOT_STARTED/NOT_EXECUTED.** Solo se han realizado investigación selectiva y comprobaciones documentales; no aplicación, tests de producto, Docker, sesiones Anam, APIs de clientes ni despliegues. El recibo de [validación](document-validation.json) distingue estos hechos.

## Qué podrá construir otra IA

Ficha de relación con procedencia; identidades de canal y consentimientos sin fusiones heurísticas; import/sync idempotente; inbox web/correo/WhatsApp según capacidad; tickets/FSM/SLA; conocimiento versionado/RAG autorizado; borradores ES/EN/FR; aprobación del payload; envío controlado y reconciliación; handoff humano; onboarding; señales de salud/success plan; reportes/infografías; portal responsive con chat y visio Anam; SDK/Hono/tools y contratos de integración con el padre.

Supabase JWT en todos los modos, comprobando membresías, recurso/campo y roles. Agentes canónicos en `/agente`, twins vinculados aquí. Los clientes externos usan el portal SaaS sin necesitar UI AgntiaPro; no se crea registro agéntico soberano. Los servicios pueden solaparse, con autoridad por encargo y un responsable de cada efecto.

## Investigación y límites

Se consultaron seis papers: dos de2026 sobre contratos CRM y construcción de agentes, tau2-bench, CRMArena/Pro y AgentDojo. Se leyeron abstracts y HTML/README selectivos según [fuentes](../research/sources.json); no se reprodujeron benchmarks. Se estudiaron fuentes oficiales de Zendesk, Fin/Intercom, Salesforce, HubSpot, Gainsight y Sierra, distinguiendo anuncio de prueba. Se registra la adquisición de Fin comunicada por Salesforce para no tratar sus referencias como empresas independientes sin matiz.

Ocho repos públicos fijados por SHA: Chatwoot, Twenty, Frappe CRM/Helpdesk, Zammad y tres referencias de evaluación. Chatwoot base/Enterprise y Twenty tienen licencias diferenciadas; CRMArena tiene restricción no comercial y queda como referencia conceptual, no dependencia comercial. Ningún repo fue instalado. WhatsApp actual quedó pendiente porHTTP429 de Meta; la versión heredada del padre no se adopta automáticamente.

Se cotejó el SHA main del padre y se reutilizó/amplió su mapa de lectura selectiva, sin modificarlo. Se observaron los contratos Actor/JWT/provenance/tareas/eventos, Business Graph y clientes de correo/WhatsApp. Estos dos últimos tienen código real de salida, pero no se ejecutaron ni se probó su configuración. El índice de personas12 y catálogo16 presentan una diferencia que deberá resolverse antes del binding.

## Riesgos y siguiente trabajo

Falta toda la implementación y evidencia de integración real: Supabase/RLS, core, conectores, UI, tests, coste medido y operación. El bridge instalado al padre no existe por esta entrega. Las bolsas30/70/300€ son hipótesis de distribución, no precios contratados ni promesa de volumen; visio/canales pueden requerir desactivar extras o revisar presupuesto.

El piloto propuesto usa datos sintéticos de dos tenants y un único camino de backend controlado; no requiere instalar todos los CRMs. No ejecuta pagos/refunds/firma/decisiones jurídicas. Las revisiones de tratamiento, términos, contratos, accesibilidad y servicio humano tienen responsables reales pendientes, no están certificadas por los documentos.

Leer [handoff](HANDOFF.md), [campaña](../campaigns/README.md), [contratos](../contracts/01-contratos.md), [aceptación](PILOT-ACCEPTANCE.md) y [runbook](../operations/RUNBOOK.md). La siguiente entrega, cuando el propietario diga «siguiente», es agntia-marketing. Los otros siete repos no se han poblado en este turno.
