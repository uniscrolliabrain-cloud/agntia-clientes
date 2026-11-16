# Contratos propuestos (NO aprobados)
`ExecutionRequestV1`: {schemaVersion:"1", operationId:UUID, capability:string, resourceRef:string, expectedVersion?:integer, idempotencyKey:string, correlationId:UUID, causationId?:UUID, dryRun:boolean, payload:unknown}; tenant y actor se resuelven desde principal verificado, nunca del payload.
`ExecutionResultV1`: discriminated union `succeeded | rejected | pending_approval | outcome_unknown | failed`; evidenceRefs[], providerReceiptRef?, reconciliationRequired:boolean.
`DomainEventV1`: eventId, schemaVersion, type, tenantRef, resourceRef, correlationId, causationId, occurredAt, evidenceRefs. Sin PII en bus.
`EvidenceReferenceV1`: opaque ref, sourceKind, version, observedAt, integrityDigest, purpose; ACL se comprueba al dereferenciar.
`IntegrationErrorV1`: code, retryable, correlationId, safeMessage, detailsRef; jamás token o datos sensibles.
`CapabilityManifestV1`: capability, version, inputSchemaRef, outputSchemaRef, risk, scopes, approvals, timeoutMs, idempotency.
Validación Zod, rechazo de unknown fields en frontera de autoridad, compatibilidad additive/minor y breaking/major, fixtures de payload válido/inválido, replay, actor revocado y tenant cruzado. Reconciliar con contratos reales de `agente` antes de congelar.
