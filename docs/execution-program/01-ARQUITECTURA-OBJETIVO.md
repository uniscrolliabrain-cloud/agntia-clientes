# Arquitectura objetivo

Monorepo TypeScript/pnpm con API Hono, contratos Zod/JSON Schema, Postgres/Supabase RLS, worker outbox/inbox, dominio contactos/organizaciones/casos/consentimientos/KB/SLA, adaptadores Chatwoot y otros opcionales, SDK y portal responsive. No instalar cuatro CRMs por defecto. La documentación original es fuente de diseño, no código.

```text
Supabase JWT + server membership -> API Hono -> Policy/AuthorityMap -> Domain FSM
                                                      |-> Postgres RLS + audit + outbox
                                                      |-> Workers scoped -> typed providers -> receipts
                                                      |-> Twin binding -> parent bridge (read/mandate)
                                                      |-> Portal + Anam presence (no authorization)
```

**Cuatro fronteras:** tenant cliente SaaS, CustomerOrganization atendida, Contact, Actor humano/agente. No confundir. Padre único dueño de agentes, SOP empresarial, memoria canónica y aprobaciones cuando el contrato lo requiera. El servicio posee transacciones locales, SLA y adaptadores de canal autorizados. Ninguna API genérica del modelo a HTTP/SQL/shell.
