# Implementación del esqueleto · agntia-clientes

Este directorio es la evidencia de la ejecución de las 42 campañas `CLI-C01…CLI-C42` sobre
un esqueleto de código real. **No sustituye** la entrega documental previa: la amplía.

## Estado en una línea

`SKELETON_IMPLEMENTED` — código TypeScript ejecutable, 87 tests locales en verde, 9 escenarios
E2E A–I en verde, proveedores externos **NOT_CONFIGURED / NOT_VERIFIED** y bridge del padre
`HOST_BRIDGE_NOT_VERIFIED`.

## Qué está implementado de verdad

| Área | Código | Verificación real |
|---|---|---|
| Contratos y DTOs | `src/contracts/` | Tests de validación, dinero decimal, campos extra |
| JWT Supabase + principal | `src/auth/` | Matriz negativa: firma, exp, iss, aud, alg, `user_metadata`, membresía |
| Twins y delegación | `src/domain/twins.ts`, `src/auth/delegation.ts` | Mandato firmado, caducidad, revocación, cross-tenant |
| FSM de casos + resolución | `src/domain/cases.ts` | Transiciones, CAS, evidencia obligatoria, cierre por silencio |
| SLA y routing | `src/domain/sla.ts`, `src/domain/routing.ts` | Calendario IANA, festivos, pausa, cobertura ausente |
| Conocimiento y RAG | `src/domain/knowledge.ts` | ACL previa/posterior, versión retirada, aislamiento |
| Propuestas | `src/domain/proposals.ts` | Gateway determinista, citas, claims prohibidos |
| Aprobaciones | `src/domain/approvals.ts` | Hash de payload/destinatario/canal/adjuntos, separación de funciones |
| Outbound + worker | `src/domain/outbound.ts`, `src/jobs/` | Replay, `delivered` con evidencia, `outcome_unknown`, reconciliación |
| Inbox y adjuntos | `src/inbox/` | Firma HMAC, replay, skew, MIME real, CSV, cuarentena |
| Adaptadores | `src/adapters/`, `src/channels/` | Contratos contra transporte fake; ninguna API real llamada |
| Storage | `src/storage/` | Repositorio tenant-scoped + migraciones SQL con RLS (no ejecutadas) |
| API + portal | `src/app/` | Rutas nominadas, 401/403/404/409, HTML accesible |
| SDK + proxy + tools | `src/sdk/`, `src/tools/` | Allowlist exacta, tools sin approve/send/refund |
| Bridge del padre | `src/bridge/` | Proyección conservadora a `SystemEvent` v1, inbox dedup |
| Presencia Anam | `src/presence/anam.ts` | Sesión acotada, sin API key en cliente, fallback texto |
| Observabilidad y reportes | `src/observability/`, `src/reporting/` | Redacción de secretos, snapshots reproducibles, CSAT nulo |
| Presupuesto y cuotas | `src/budget/` | Reservas concurrentes, techo, rate limit separado |
| Privacidad | `src/privacy/` | Bases por finalidad, consentimiento append-only, export revisado |
| Evals | `src/eval/` | Fixtures A/B/P y E2E A–I |

## Qué NO está implementado (y se declara)

- **Postgres real / RLS ejecutada**: hay migraciones y repositorio en memoria con las mismas
  garantías observables; el gate de base de datos sigue `NOT_VERIFIED`.
- **Proveedores reales** (Chatwoot, Twenty, Frappe, Zammad, Resend, Meta WhatsApp): adaptadores
  con contrato y transporte fake. Ninguna credencial, ninguna llamada, ningún receipt real.
- **Anam real**: emisión local de token efímero de desarrollo; sin SDK ni sesión.
- **Supabase real**: JWT verificado con claves de fixture; no hay proyecto provisionado.
- **Bridge del padre**: contratos y host fake; **cero** cambios en `/agente`.
- **UI de producto**: marco HTML accesible de portal, sin cliente React ni estado real.
- **Backups, restore, DLQ persistente, CI ejecutada en GitHub**: diseñados, no ejecutados.

## Cómo se verifica

```bash
npm install        # dependencias del lockfile
npm run typecheck  # tsc --noEmit
npm test           # 87 tests (node:test)
npm run eval       # E2E A–I → artifacts/e2e-report.json
npm start          # API en :3000 (falla cerrada sin Supabase)
```

Resultados de esta ejecución: typecheck OK · 87/87 tests OK · 9/9 escenarios OK.
El detalle por fase está en [`../campaigns/reports/`](../campaigns/reports/README.md).

## Mapa de artefactos prometidos por las campañas

Las campañas proponían rutas como `docs/baseline.md` o `docs/threat-model.md`. Para no
fragmentar la entrega, la evidencia se consolidó en este directorio:

| Prometido | Entregado |
|---|---|
| `docs/baseline.md`, `docs/host-diff.md` | [`BASELINE.md`](BASELINE.md) |
| `docs/domain-model.md`, `docs/authority-map.md`, `docs/native-mapping.md` | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| `docs/auth-contract.md` | [`SECURITY.md`](SECURITY.md) §Identidad |
| `docs/capability-matrix.md`, `docs/adapters/*` | [`CAPABILITY-MATRIX.md`](CAPABILITY-MATRIX.md) |
| `docs/retention-matrix.md`, `docs/sensitive-actions.md` | [`PRIVACY-RETENTION.md`](PRIVACY-RETENTION.md) |
| `docs/threat-model.md`, `docs/security-evidence.md` | [`SECURITY.md`](SECURITY.md) |
| `docs/metrics-catalog.md`, `docs/e2e-evidence.md` | [`OPERATIONS.md`](OPERATIONS.md) |
| `migrations/` | `src/storage/migrations/` |
| `.github/workflows/ci.yml`, `infra/` | `.github/workflows/ci.yml`, `infra/` |
