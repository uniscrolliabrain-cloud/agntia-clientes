# Repositorios y estrategia de adaptación

Referencias selectivas fijadas por SHA en [repositories.json](research/repositories.json). No se ha clonado, instalado, ejecutado ni auditado el conjunto de estos repositorios. Metadatos GitHub y README no prueban seguridad, compatibilidad ni disponibilidad de cada función.

| Proyecto | Uso candidato | Licencia/edición observada | Decisión |
|---|---|---|---|
| chatwoot/chatwoot | Primer backend de conversaciones e inbox | LICENSE distingue base MIT y enterprise con licencia propia | Adaptador API acotado; Captain/SLA u otras funciones se verifican por edición |
| twentyhq/twenty | CRM extensible opcional | LICENSE mixto: AGPL, excepción de interfaces, paquetes MIT y archivos Enterprise | Revisar archivo/paquete y excepción completos antes de distribuir; no clasificar todo como MIT |
| frappe/crm | Alternativa CRM para instalaciones Frappe | Metadata AGPL-3.0 | No instalar junto a Twenty por defecto; discovery de DocTypes/permisos |
| frappe/helpdesk | Alternativa de tickets, portal y SLA | Metadata AGPL-3.0 | Adaptador alternativo, un solo responsable del reloj/estado por caso |
| zammad/zammad | Alternativa helpdesk con API | Metadata/README AGPL-3.0 | Evaluar aislamiento por instalación y roles reales; no presumir multitenancy fuerte |
| sierra-research/tau2-bench | Inspiración y ejecución futura de evaluaciones | Metadata MIT; revisar datos/audio/dependencias aparte | Fijar edición; no importar voces ni asumir idiomas que no figuren |
| SalesforceAIResearch/CRMArena | Investigación CRM y confidencialidad | LICENSE CC BY-NC4.0; README limita uso comercial | Referencia conceptual; excluido como dependencia/dataset comercial salvo permiso |
| salesforce-misc/crm-agent-bench | Investigación de contratos ejecutables | Metadata Apache-2.0 y README | Evaluar incorporación de harness tras revisar licencia/datos; fixtures propios inicialmente |

Chatwoot se ha leído selectivamente en Conversation y MessagesController. El modelo incluye account_id/inbox_id y estados propios; el controlador permite crear mensajes y reintentos. Eso no demuestra idempotencia de envío de extremo a extremo. El adaptador no expondrá retry arbitrario y conservará un OutboundIntent por efecto. La documentación distingue Application, Client y Platform API: nunca entregar token administrativo al navegador o LLM. El identificador del Client API no sustituye la autorización Supabase del portal.

Twenty genera APIs desde el esquema de cada workspace; no hay un esquema estático universal que podamos fijar por intuición. Sus permisos y metadatos se descubrirán con credencial acotada. La API Metadata queda fuera del agente. Frappe expone recursos DocType: el middleware limita nombres/campos y no expone métodos RPC arbitrarios. En HD Ticket se observaron campos de SLA y resolución, sin validar su cálculo real. Zammad documenta tokens/OAuth; el adaptador requerirá privilegio mínimo y no usará cuenta administrativa de respaldo.

## Matriz inicial de capacidades

Todos los adaptadores están NOT_IMPLEMENTED. Chatwoot conversa.read/message.create son DOCUMENTED con lectura selectiva de código, no VERIFIED_RUNTIME. Twenty contact/company read/write y Frappe/Zammad tickets tienen documentación de API pero mapping/ACL pendientes. WhatsApp queda DOCUMENTATION_REVALIDATION_REQUIRED por429. Un missing permission se presenta como unsupported/forbidden, sin simular resultados.

## Reglas de integración

Preferir procesos separados y API; no copiar upstream. Registrar versión, commit o imagen, licencia por módulo, auth y empresa/workspace remoto. No instalar cinco CRMs/helpdesks para aparentar cobertura. Contactos y casos pueden existir nativamente en el middleware; al seleccionar un backend se acuerda autoridad por campo, se crean ExternalLinks y se bloquean conflictos. El feature flag de un conector no borra links/historia. Una migración de backend exige exportación, reconciliación y prueba de rollback sin reenviar mensajes.
