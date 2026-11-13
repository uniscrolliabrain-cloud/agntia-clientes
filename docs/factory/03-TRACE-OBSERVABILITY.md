# ADTC — Clientes: trazabilidad y observabilidad distribuida

**Contrato lógico v0.1, no implementado.** Bus/grafo canónicos en padre; Ciberseguridad consumidor transversal limitado, no dueño de conversaciones ni dependencia síncrona.

```json
{"schemaVersion":"adtc/0.1","eventId":"unique-event","eventType":"clientes.ticket.reply_proposed","tenantId":"verified-tenant","actorId":"verified-actor","taskId":"task-ref","correlationId":"stable-customer-workflow","causationId":"parent-event-ref","requestId":"ingress-ref","traceId":"w3c-trace-id","spanId":"current-span-id","idempotencyKey":"effect-specific-key","source":"agntia-clientes","resourceRefs":["ticket-ref","conversation-ref"],"evidenceRefs":["kb-version-ref"],"payloadRef":"restricted-ref"}
```

Mapping versionado a SystemEvent real, no asumir compatibilidad. Cada evento nuevo eventId, cada intento attemptId, idempotencyKey estable por efecto; providerMessageId externo distinto de IDs canónicos. Outbox/inbox dedupe, retries acotados, DLQ, outcome_unknown y reconciliación antes de reenviar. No replays que respondan dos veces.

## Privacidad
No copiar conversaciones completas, emails, teléfonos, adjuntos, secretos o PII en bus/OTel. Usar refs, hashes, ACL por tenant/caso/propósito, cifrado y retención. RLS en DB, búsqueda/RAG, realtime, workers, archivos, export, métricas y logs. Ciberseguridad observa causalidad sin lectura indiscriminada del contenido.

## Ejemplo
Cliente contacta WhatsApp → adaptador verifica canal/tenant → padre delega → Clientes crea ticket y consulta KB autorizada → propuesta de respuesta → approval/auto-policy válida → envío único → receipt → actualización SLA y customer health → Ventas recibe señal autorizada → bus padre y observabilidad correlacionan.

## Negativos
Tenant B no lee conversación A; empleado sin case ACL no ve adjuntos; knowledge revocado no se cita; timeout no duplica mensaje; cambio de borrador invalida approval; fallo de observabilidad no bloquea servicio.
