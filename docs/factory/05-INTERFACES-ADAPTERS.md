# Autoridad, cooperación y adaptadores Clientes

## Padre
AgntiaPro conserva kernel, identidad, bus, grafo, SOP, policy, aprobaciones y memoria. Clientes ofrece capacidades delegadas con twins. AuthorityMap propuesto fija ejecutor único por mensaje, devolución, modificación CRM, cancelación o escalado.

## Cooperación
Ventas: CRM comercial, oportunidades y handoff a cliente; definir fuente de verdad por campo. Marketing/Redes: campañas y mensajes públicos, sin duplicar outreach. Finanzas/Gestoría: pagos, facturas y reembolsos ejecutados por autoridad competente. Legal: reclamaciones, privacidad, términos. Formación: onboarding educativo. Ciberseguridad: incidentes y observabilidad, no lectura indiscriminada de conversaciones. Branding: tono de marca. Vídeo: contenidos de soporte cuando corresponda.

## Puertos PROPOSED
CustomerProfilePort, ChannelIdentityPort, InboxPort, MessagingPort, TicketPort, SLAPort, KnowledgePort, EscalationPort, CSATPort, RefundProposalPort, AuditEvidencePort. Adaptadores posibles Meta/WhatsApp, Gmail, Google Calendar, Telegram, telefonía, Zendesk, Intercom, HubSpot, Salesforce, Airtable, CRM cliente y MCP; ninguno se declara conectado por estar nombrado.

## Contrato adapter
provider, tenantBinding, channelIdentity, scope, consent/lawfulBasis, suppression, sourceOfTruth, ACL, purpose, schemaVersion, rateLimit, budget, timeout, retry, idempotency, ACK/reconciliation, audit, retention, dataResidency. MCP no evita policy; no compartir datos entre tenants por alias o número.
