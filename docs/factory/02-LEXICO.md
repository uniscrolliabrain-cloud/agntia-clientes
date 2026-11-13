# Léxico canónico y Clientes — v0.1 conceptual

## Identidad
tenantId empresa/ámbito, no owner/sub/actorId/customerId. Agentes canónicos padre, twins delegados. HumanActor/AgentActor y runtimeId/roleId/personaId distintos. Task ≠ SOP ≠ Action ≠ Approval ≠ Event. correlationId workflow, causationId evento causante, eventId único, traceId/spanId técnicos, requestId entrada, idempotencyKey efecto. AuthorityMap, DelegationMandate, TwinBinding son propuestas sujetas a cotejo con padre.

## Entidades de dominio (PROPOSED)
CustomerAccount = cuenta comercial/de servicio, distinta de tenant; Contact = persona con roles y permisos; IdentityResolution = vínculo entre identidades por canal con evidencia; Conversation = hilo con participantes y ACL; Message = contenido/metadata de canal con dirección, providerRef y estado; InboxItem = unidad de triage; Ticket/Case = incidencia con owner, prioridad, categoría y SLA; SLAPolicy = reglas por contrato/calendario, no promesa universal; KnowledgeArticle = respuesta aprobada con fuente/versión; RetrievalEvidence = fragmento autorizado, no permiso por similitud; SuggestedReply = borrador, no envío; ReplyApproval = autorización para versión/canal/destinatario; CustomerHealth = indicador estimado con ventana/fuentes; ChurnRisk = señal, no hecho; OnboardingPlan = hitos de incorporación; Escalation = transferencia con ACK; RefundProposal = propuesta, no reembolso; CSAT = feedback observado con procedencia.

## Distinciones
messageDrafted ≠ messageSent ≠ delivered ≠ read; ticketResolved ≠ customerSatisfied; SLAClockPaused ≠ SLACompliant; KBMatch ≠ VerifiedAnswer; customerIdentityLinked ≠ channelConsent; refundProposed ≠ refundExecuted; leadAccepted ≠ activeCustomer; optOut debe bloquear canal aplicable. No mezclar customerId del negocio con actorId del tenant ni fusionar cuentas por nombre parecido. Retención y acceso por finalidad, ticket, canal y tenant.
