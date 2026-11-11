# SaaS, clientes externos y equipo especialista

Agntia-clientes es una empresa de servicio especializada. Puede recibir un encargo de los empleados IA generalistas de AgntiaPro o contratar directamente con una pyme/autónomo. Esa autonomía comercial no crea una segunda organización canónica de agentes. Los especialistas viven en el padre; aquí trabajan mediante twins, capacidades y mandatos. El cliente externo tiene portal propio y autenticación Supabase; no necesita entrar en AgntiaPro.

## Contratación y responsabilidad

ServiceAgreement: organización operadora, tenant contratante, contactos autorizados, servicios/entitlements, horario humano, SLA, presupuesto/usage, tratamiento de datos, subencargados, retención y procedimiento de salida. WorkOrder: alcance, fuente de datos, entregable, responsable del efecto, quién lo acepta y qué gastos autoriza. La aceptación comercial no es aprobación de una respuesta ni consentimiento de grabación.

Se permite solapamiento con agntia-ventas, marketing, redes, branding y otros servicios. Ejemplos: clientes mantiene el caso; redes puede elaborar una respuesta pública; legal revisa una reclamación; ventas recibe una oportunidad con permiso. Un único OutboundIntent manda cada comunicación. No remitir datos a otro SaaS por estar en la misma familia: verificar contrato, propósito, destinatario y ACK. Si falta un hermano, el flujo puede terminar en tarea humana/local autorizada; no inventar asesoramiento jurídico o datos financieros.

## Roles y operación

El mapping inicial propone especialidad de atención, coordinación operativa, análisis de relación y revisión de calidad. El catálogo padre incluye IDs como atencion, comercial y operaciones; calidad aparece en el catálogo base de16 pero no en el índice de12 observado. La implementación debe confirmar el catálogo efectivo y no dar de alta agentes canónicos aquí. El humano responsable del tenant define políticas; el twin ejecuta/proporciona propuestas y explica pruebas, nunca se aprueba a sí mismo.

Diario: hechos nuevos, casos sin responder, SLA, salud de canales, pendientes de revisión y coste real. Semanal: calidad de respuestas, brechas de conocimiento, causas repetidas y recomendaciones. Mensual: revisión de relación, servicio entregado, métricas reproducibles y preparación de QBR con fuentes. Las rotas y asignaciones empresariales pertenecen al padre; los jobs técnicos de SLA/sync se limitan a plazos del servicio. No simular trabajo para llenar un briefing.

## Handoff y escalado

Un handoff contiene motivo, alcance, fuentes mínimas, acción que no se ejecutó, quien debe aceptar y plazo. Estado proposed → offered → acknowledged → working → completed/returned. No marcarlo completado por emitir un evento. Al tomar control humano se congela la autonomía de respuesta de la conversación hasta devolución explícita; una tool en cola revalida ese estado antes del efecto. Escalar riesgo legal, identidad dudosa, datos sensibles, resultado incierto y cliente que pide humano.

## Clientes externos y entrada pública

Toda sesión interactiva del portal usa JWT Supabase y permisos de recurso. Un intake público opcional requiere flujo separado: sesión anónima de Supabase/capacidad de ingreso muy limitada, antiabuso y binding de formulario/inbox provisionado por servidor. No incorpora al visitante a la membresía del tenant ni le permite buscar clientes. Antes de mostrar casos/documentos privados se exige identidad vinculada y autorización suficientes. Webhooks de canal se autentican con firma/credencial de ingreso y binding propio; no fingen ser JWT humano.

## Salida y portabilidad

Exportación revisada, ACL y prueba de integridad, conservación de histórico según política y revocación de secretos/mandatos. Un cambio de CRM no vuelve a disparar mensajes ni reinterpreta consentimientos. Un portal suspendido puede permitir acceso limitado a datos/gestión contractual según política humana, sin reactivar efectos por impago. No automatizar bloqueos perjudiciales al contacto por un score opaco.
