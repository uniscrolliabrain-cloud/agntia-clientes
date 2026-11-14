# Dependencias de las 42 campañas

Cada campaña conserva el grafo de dependencias del manifest original; el orden recomendado es 001→042, salvo dependencias explícitas adicionales descubiertas por implementación. Un programa de diseño completo **no significa que los efectos externos puedan ejecutarse sin autorización**. Los bloqueos se registran y se prosigue con trabajo independiente cuando sea seguro.

| Campaña | Objetivo | Depende de | Superficies previstas |
|---|---|---|---|
| [CLI-C01](campaigns/001/CAMPAIGN.md) | Baseline y perímetro de solo lectura | — | `docs/baseline.md`, `docs/host-diff.md`, `docs/evidence/c01/` |
| [CLI-C02](campaigns/002/CAMPAIGN.md) | Modelo de dominio y autoridad | CLI-C01 | `docs/domain-model.md`, `docs/authority-map.md`, `docs/adr/002-boundaries.md` |
| [CLI-C03](campaigns/003/CAMPAIGN.md) | Autenticación Supabase y principal | CLI-C02 | `packages/auth/`, `tests/security/jwt.test.ts`, `docs/auth-contract.md` |
| [CLI-C04](campaigns/004/CAMPAIGN.md) | Twin y trazabilidad nativa | CLI-C03 | `packages/domain/twin-binding.ts`, `docs/native-mapping.md`, `tests/twin-binding.test.ts` |
| [CLI-C05](campaigns/005/CAMPAIGN.md) | DTOs y contratos runtime | CLI-C04 | `packages/contracts/`, `docs/openapi-design.md`, `tests/contracts.test.ts` |
| [CLI-C06](campaigns/006/CAMPAIGN.md) | Postgres, RLS y migraciones | CLI-C05 | `packages/storage/`, `migrations/`, `tests/integration/storage.test.ts` |
| [CLI-C07](campaigns/007/CAMPAIGN.md) | Finalidades, preferencias y permisos de comunicación | CLI-C06 | `packages/privacy/processing-basis.ts`, `packages/privacy/consent.ts`, `tests/preferences.test.ts` |
| [CLI-C08](campaigns/008/CAMPAIGN.md) | Acuerdos, entitlements y encargos | CLI-C07 | `packages/service-agreements/`, `packages/work-orders/`, `tests/entitlements.test.ts` |
| [CLI-C09](campaigns/009/CAMPAIGN.md) | Registro de proveedores, OAuth y secretos | CLI-C08 | `packages/integrations/registry.ts`, `packages/secrets/`, `tests/security/egress.test.ts` |
| [CLI-C10](campaigns/010/CAMPAIGN.md) | Discovery y capacidades verificadas | CLI-C09 | `packages/integrations/discovery/`, `docs/capability-matrix.md`, `tests/discovery.test.ts` |
| [CLI-C11](campaigns/011/CAMPAIGN.md) | Directorio y resolución de identidad | CLI-C10 | `packages/customers/`, `packages/identity-links/`, `tests/customer-identity.test.ts` |
| [CLI-C12](campaigns/012/CAMPAIGN.md) | Importación, staging y sync | CLI-C11 | `packages/imports/`, `packages/sync/`, `tests/import-replay.test.ts` |
| [CLI-C13](campaigns/013/CAMPAIGN.md) | Chatwoot lectura y bindings | CLI-C12 | `packages/adapters/chatwoot/read.ts`, `packages/adapters/chatwoot/mappers.ts`, `tests/integration/chatwoot-read.test.ts` |
| [CLI-C14](campaigns/014/CAMPAIGN.md) | Chatwoot writeback seguro | CLI-C13 | `packages/adapters/chatwoot/write.ts`, `packages/reconcile/chatwoot.ts`, `tests/chatwoot-write.test.ts` |
| [CLI-C15](campaigns/015/CAMPAIGN.md) | CRM Twenty opcional | CLI-C14 | `packages/adapters/twenty/`, `docs/adapters/twenty.md`, `tests/integration/twenty.test.ts` |
| [CLI-C16](campaigns/016/CAMPAIGN.md) | Frappe CRM y Helpdesk alternativos | CLI-C15 | `packages/adapters/frappe/`, `docs/adapters/frappe.md`, `tests/integration/frappe.test.ts` |
| [CLI-C17](campaigns/017/CAMPAIGN.md) | Zammad y portabilidad de helpdesk | CLI-C16 | `packages/adapters/zammad/`, `docs/adapters/zammad.md`, `tests/integration/zammad.test.ts` |
| [CLI-C18](campaigns/018/CAMPAIGN.md) | Canal web y sesiones de contacto | CLI-C17 | `apps/portal/intake/`, `packages/channels/web/`, `tests/web-channel.test.ts` |
| [CLI-C19](campaigns/019/CAMPAIGN.md) | Correo transaccional y threading | CLI-C18 | `packages/channels/email/`, `docs/email-delivery.md`, `tests/email.test.ts` |
| [CLI-C20](campaigns/020/CAMPAIGN.md) | WhatsApp oficial bajo capacidad confirmada | CLI-C19 | `packages/channels/whatsapp/`, `docs/whatsapp-capabilities.md`, `tests/whatsapp.test.ts` |
| [CLI-C21](campaigns/021/CAMPAIGN.md) | Inbox, webhooks y evidencia adjunta | CLI-C20 | `packages/inbox/`, `packages/attachments/`, `tests/inbox-attachments.test.ts` |
| [CLI-C22](campaigns/022/CAMPAIGN.md) | Casos y contrato de resolución | CLI-C21 | `packages/cases/`, `packages/resolution/`, `tests/case-state.test.ts` |
| [CLI-C23](campaigns/023/CAMPAIGN.md) | SLA, calendario y routing determinista | CLI-C22 | `packages/sla/`, `packages/routing/`, `tests/sla-routing.test.ts` |
| [CLI-C24](campaigns/024/CAMPAIGN.md) | Conocimiento versionado y RAG autorizado | CLI-C23 | `packages/knowledge/`, `packages/retrieval/`, `tests/rag-acl.test.ts` |
| [CLI-C25](campaigns/025/CAMPAIGN.md) | Propuestas IA, idiomas y verificación | CLI-C24 | `packages/proposals/`, `packages/model-gateway/`, `tests/answer-proposals.test.ts` |
| [CLI-C26](campaigns/026/CAMPAIGN.md) | Preview y aprobaciones de efecto | CLI-C25 | `packages/approvals/`, `packages/outbound/preview.ts`, `tests/approval-binding.test.ts` |
| [CLI-C27](campaigns/027/CAMPAIGN.md) | Jobs, outbox y reconciliación | CLI-C26 | `packages/jobs/`, `packages/outbox/`, `packages/reconcile/` |
| [CLI-C28](campaigns/028/CAMPAIGN.md) | Handoff humano y coordinación | CLI-C27 | `packages/handoffs/`, `docs/handoff-protocol.md`, `tests/handoffs.test.ts` |
| [CLI-C29](campaigns/029/CAMPAIGN.md) | Onboarding y playbooks de servicio | CLI-C28 | `packages/onboarding/`, `packages/playbooks/`, `tests/onboarding.test.ts` |
| [CLI-C30](campaigns/030/CAMPAIGN.md) | Customer success y señales explicables | CLI-C29 | `packages/success/`, `packages/health/`, `tests/health-observations.test.ts` |
| [CLI-C31](campaigns/031/CAMPAIGN.md) | Renovaciones, reclamaciones y propuestas comerciales | CLI-C30 | `packages/customer-followup/`, `docs/sensitive-actions.md`, `tests/followup.test.ts` |
| [CLI-C32](campaigns/032/CAMPAIGN.md) | Anam como presencia del twin | CLI-C31 | `packages/presence/anam/`, `docs/anam-session-policy.md`, `tests/anam-session.test.ts` |
| [CLI-C33](campaigns/033/CAMPAIGN.md) | Portal responsive y revisión humana | CLI-C32 | `apps/portal/`, `docs/ux-flows.md`, `tests/browser/portal.test.ts` |
| [CLI-C34](campaigns/034/CAMPAIGN.md) | SDK TypeScript, Hono y tools nominadas | CLI-C33 | `packages/sdk/`, `packages/hono/`, `packages/agent-tools/` |
| [CLI-C35](campaigns/035/CAMPAIGN.md) | Bridge del padre y eventos interoperables | CLI-C34 | `packages/host-bridge/`, `docs/host-patch-proposal.md`, `tests/host-contract.test.ts` |
| [CLI-C36](campaigns/036/CAMPAIGN.md) | Observabilidad, métricas y reportes | CLI-C35 | `packages/observability/`, `packages/reporting/`, `docs/metrics-catalog.md` |
| [CLI-C37](campaigns/037/CAMPAIGN.md) | Costes, cuotas y backpressure | CLI-C36 | `packages/budget/`, `packages/quotas/`, `tests/budget-concurrency.test.ts` |
| [CLI-C38](campaigns/038/CAMPAIGN.md) | Derechos, retención y salida del servicio | CLI-C37 | `packages/privacy/requests/`, `docs/retention-matrix.md`, `tests/privacy-lifecycle.test.ts` |
| [CLI-C39](campaigns/039/CAMPAIGN.md) | Seguridad adversarial y aislamiento | CLI-C38 | `tests/security/`, `docs/threat-model.md`, `docs/security-evidence.md` |
| [CLI-C40](campaigns/040/CAMPAIGN.md) | Evaluaciones y vertical E2E reproducible | CLI-C39 | `tests/e2e/`, `tests/evals/`, `docs/e2e-evidence.md` |
| [CLI-C41](campaigns/041/CAMPAIGN.md) | Operaciones, CI y release controlada | CLI-C40 | `docs/operations/`, `.github/workflows/ci.yml`, `infra/` |
| [CLI-C42](campaigns/042/CAMPAIGN.md) | Aceptación, informe y entrega a otra IA | CLI-C41 | `docs/release/final-report.md`, `docs/release/acceptance.md`, `docs/release/handoff-next.md` |
