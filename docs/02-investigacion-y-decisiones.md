# Investigación y decisiones de diseño

Consulta selectiva de fuentes primarias el 11-11-2026. No es revisión sistemática ni reproducción de benchmarks. Los IDs se resuelven en [sources.json](research/sources.json). Separar resultados de autores, anuncios comerciales, código observado e inferencias propias.

## Papers

| Fuente | Qué se estudió | Decisión de este diseño |
|---|---|---|
| P01 CRM-Agent-Bench, octubre 2026 | Abstract y HTML selectivo: contratos ejecutables, estado y trayectoria | Verificar efecto final y acciones intermedias; no puntuar solo el texto de respuesta |
| P02 hyper-tau-bench, septiembre 2026 | Abstract y HTML selectivo: construcción de agentes bajo restricciones reales | La IA implementadora debe explorar registros, consultar contratos y medir costes; entregar diseño no equivale a solución operativa |
| P03 tau2-bench, 2025 | Abstract y README actual de su repo | Pruebas donde cliente y agente actúan; simulación de instrucciones, confirmaciones y cambios concurrentes |
| P04 CRMArena-Pro, 2025, aceptado TMLR según README 2026 | Abstract y README/licencia | Casos B2B/B2C, varios turnos y confidencialidad. No incorporar el material no comercial al producto |
| P05 AgentDojo, versión 2024 | Abstract | Tickets/artículos/adjuntos adversariales; el dato recuperado no puede cambiar policy ni conceder tools |
| P06 CRMArena, revisión 2025 | Abstract | Fixture conectado de clientes, artículos, casos y actividad; probar tareas por persona y estado |

No se trasladan porcentajes de esos autores a Agntia. El README actual de tau-bench incluye variantes de texto y voz y lenguas; no demuestra cobertura francesa ni equivalencia con la edición del paper. Deben fijarse versión, split, datos, licencia, prompts y jueces antes de comparar resultados. Las suites sintéticas de Agntia serán originales, con contratos sobre estado protegido y acciones permitidas.

## Noticias y cambios de producto observados

Zendesk anunció el 19 de mayo de 2026 una plataforma coordinada de agentes, conocimiento, gobernanza y resultados (V01). Se toma como referencia de producto, sin reproducir promesas de resolución. El anuncio de Fin 4 del 7 de octubre de 2026 presenta atención, operador y colaboración humana; la publicación de agosto sobre Evals/Releases describe pruebas y despliegues controlados (V02/V03). Inspira la separación entre configuración candidata, evaluación y release aprobada; un supervisor LLM no reemplaza el PEP.

Salesforce comunicó el 10 de septiembre de 2026 la adquisición completada de Fin (V04). Por ello las referencias a Agentforce y Fin no deben presentarse como empresas necesariamente independientes. Sus productos pueden seguir siendo referentes distintos; no inferir una API fusionada ni cambios de contratos.

HubSpot documenta Service Hub y APIs con referencia 2026-09 (V05/A06); Gainsight describe contexto de relación, resúmenes y seguimiento (V06); Sierra presenta capas de control y gobierno de datos (V07). Se extraen patrones de integración y experiencia, no certificaciones ni acceso a su arquitectura privada.

## Conceptos propios que se propone desarrollar

Relationship Evidence Ledger: cada afirmación sobre el cliente conserva origen, vigencia, permiso y conflicto. Resolution Contract: antes de cerrar un caso se comprueba qué resultado pidió el cliente, qué acción se ejecutó y qué condición quedó pendiente. Delegation Receipt: cada twin enlaza su mandato al actor, tenant y acción ejecutada. Customer Context Budget: recuperación y acceso a datos se limitan al propósito de la tarea. Son propuestas de ingeniería de este repo; no se afirma novedad científica ni registro de propiedad industrial.

Meta devolvió HTTP429 al consultar documentación de WhatsApp; su estado sigue pendiente de revalidación. No se probaron APIs ni cuentas de terceros. No se usaron credenciales publicadas en repos de investigación y no se redistribuyen. Las restricciones de licencia se documentan antes de cualquier selección ejecutable.
