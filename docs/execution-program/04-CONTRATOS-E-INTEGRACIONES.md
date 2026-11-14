# Contratos y wiring transversal

Fuentes obligatorias: `docs/contracts/01-contratos.md`, `docs/architecture/01-arquitectura.md`, `docs/architecture/02-supabase-twins.md`, `docs/architecture/03-compatibilidad-agente.md`, `docs/architecture/04-runtime-determinista.md`.

- **Auth:** verificar firma JWT Supabase, issuer, audience, expiración, membresía en servidor y scope; ningún user_metadata, owner default o tenant de prompt concede permisos.
- **Delegación:** Actor originador, tenant de origen y tenant objetivo separados, mandate versionado, twin binding y capacidad acotada; sin crear agentes canónicos.
- **Datos:** Postgres/RLS, tenant en relaciones, jobs, storage, índices, búsqueda y métricas; contactos y CustomerOrganization no son usuarios/tenants.
- **Efectos:** preview/payloadHash/expectedVersion/approval, idempotency durable, outbox, receipts, reconciliación de unknown outcome; un único emisor por WorkOrder y canal.
- **Puertos:** Chatwoot candidato inicial, CRM Twenty/Frappe opcionales, helpdesk alternativo Zammad/Frappe; discovery por capacidades y versión, no prometer APIs inexistentes.
- **Canales:** email, WhatsApp y webhooks son no confiables; verificar firmas, dedupe, restricciones de contenido, adjuntos y derechos; enviar solo con permisos y consentimiento/base legal aplicable.
- **Trazas:** evento nativo del padre no se sustituye por envelope ADTC inventado; bridge con schemaVersion explícito, correlation/causation/trace y refs de evidencia sanitizada.
- **Anam:** interfaz de presencia, nunca actor autorizador; scopes y sesiones temporales.
