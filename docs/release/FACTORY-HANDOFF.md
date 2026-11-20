# Handoff de fábrica · Clientes (`agntia-clientes`)

Fecha: 2026-11-14 · SHA de referencia auditado: `6a3775d` (main) → este commit
· Rama de trabajo: `freebuff/e328a674df54fe15e5536cde`.

## 1. Auditoría inicial (leída del código, no del README)

| Comprobación | Resultado |
|---|---|
| Campañas en manifiesto | 42 campañas, 294 tareas, 84 gates |
| Código | 61 archivos en `src/`, TypeScript estricto, sin build |
| Tests | 11 suites → **107 tests** tras esta campaña |
| E2E | A–I, 9/9 PASS, artefacto `artifacts/e2e-report.json` |
| CI | `.github/workflows/ci.yml` (`verify` + `docs`), verde en `main` (`run 43653540108`) |
| Dependencias | `hono`, `zod`, `typescript`, `@types/node`; lockfile reparado y verificado con `npm ci` |
| Persistencia | migraciones SQL con RLS escritas, **no ejecutadas**; repositorio en memoria |
| Proveedores | contratos + `FakeTransport`; **ninguno conectado** |
| Bridge padre | contrato + `FakeHost`; **cero cambios en `/agente`** |

Discrepancia resuelta en esta fase: `docs/implementation/README.md` chocaba entre `main` y la
rama; se conservó la versión de `main` literal en [PROGRAM.md](../implementation/PROGRAM.md).

## 2. Campañas trabajadas en esta ejecución

| Campaña | Antes | Ahora | Qué se entregó |
|---|---|---|---|
| C11 identidad | BLOCKED | PASS local | `src/domain/identity.ts`: vínculos con evidencia, merge revisable con alias, deshacer, aislamiento por tenant |
| C12 importación | BLOCKED | PASS local | `src/service/import.ts`: staging con cursor, dry-run, cuarentena por fila, commit idempotente por `externalId` |
| C31 renovaciones/reclamaciones | BLOCKED | PASS local | `src/domain/renewals.ts`: calendario determinista, intake de reclamaciones, propuestas con aprobaciones por rol, `execute()` prohibido |
| C33 portal | NOT_VERIFIED | NOT_VERIFIED (evidencia nueva) | Abierto en Chromium real: 200 sin errores de consola, `/` → `/portal`, landmarks correctos, `lang=es`; botones que exigirían sesión quedan `disabled` y ya no fingen una acción |

Gates tras el cambio: **33 PASS locales, 8 NOT_VERIFIED, 1 BLOCKED** (C20 WhatsApp, que sigue
sin capacidad verificada por el 429 de Meta). El detalle por fase está en
[campaigns/reports](../campaigns/reports/README.md).

Decisiones de diseño que no se relajaron:

- El merge de identidad **nunca** es automático y rechaza `name_only`.
- La importación no aborta un lote por una fila mala: la pone en cuarentena con motivo.
- No existe ejecución financiera: `ClaimsDesk.execute()` lanza `forbidden` a propósito.
- Renovar exige actor identificado; no hay renovación silenciosa.

## 3. Código reutilizado y código nuevo

- **Reutilizado**: contratos, auth, casos, SLA, conocimiento, aprobaciones, outbox, inbox,
  canales, adaptadores, SDK, tools, observabilidad, privacidad, presupuesto, evals.
- **Nuevo en esta fase**: `src/domain/identity.ts`, `src/service/import.ts`,
  `src/domain/renewals.ts`, `test/campaigns-11-12-31.test.ts`, más los documentos de entrega.

## 4. Verificación reproducible

```bash
npm ci
npm run typecheck
npm test        # 107/107
npm run eval    # 9/9 A–I
npm run reports # 42 anexos, manifiesto intacto
```

Ningún resultado de este documento proviene de mocks presentados como integración real.

## 5. Integraciones: reales frente a simuladas

| Integración | Estado |
|---|---|
| Supabase Auth (JWT) | Verificado con claves de fixture; **sin proyecto real** |
| Postgres / RLS | **Verificado local**: 18/18 garantías en PostgreSQL 18.7 real (`npm run db:verify`); Supabase staging pendiente |
| Chatwoot, Twenty, Frappe, Zammad | Contrato + transporte fake; **no conectado** |
| Resend | Contrato; **no conectado** |
| WhatsApp | `documentation_revalidation_required`; **BLOCKED** |
| Anam | `503` con `fallback: text_only`; **NOT_CONFIGURED** |
| Bridge padre | `HOST_BRIDGE_NOT_VERIFIED` |

## 6. Riesgos y deuda técnica

1. El API sirve desde memoria: `PgStore` está verificado contra PostgreSQL real pero todavía no
   se selecciona por `DATABASE_URL`, así que producción no persiste.
2. El bus ADTC no tiene transporte; `traceId` se deriva localmente.
3. La UI del portal se abrió en Chromium (C33) pero no se probó con lector de pantalla ni móvil.
4. El `SecretStore` de producción no existe (solo memoria).
5. Divergencia 12/16 del catálogo de personas del padre sin resolver.
6. Las actions de CI emiten avisos de Node 20 (no fallan).

## 7. Preparación para Doppler

Ver [DOPPLER.md](DOPPLER.md): variables, ámbitos, rotación, arranque con `doppler run` y qué
falta antes de producción.

## 8. Propuesta de integración con el padre

Ver [PARENT-INTEGRATION.md](PARENT-INTEGRATION.md): puerto `HostPort`, mapping de eventos,
identidad/tenants, cambios propuestos (no aplicados) y rollback.

## 9. Estado de CI y PR

- CI en `main`: verde (jobs `verify` y `docs`, run 43653540108).
- Esta fase entra por rama + PR con merge commit (sin force-push, sin reescribir historial).

## 10. Para Codex: cómo auditar en 10 minutos

1. `git log --oneline -5` y fijar el SHA del PR.
2. `npm ci && npm run typecheck && npm test && npm run eval`.
3. Leer `docs/campaigns/reports/C11.md`, `C12.md`, `C31.md` y contrastarlos con
   `src/domain/identity.ts`, `src/service/import.ts`, `src/domain/renewals.ts`.
4. Buscar fugas: `grep -rn "tenantId" src/domain/identity.ts src/service/import.ts` y comprobar
   que toda consulta filtra por tenant.
5. Confirmar que no hay efectos financieros: `grep -rn "execute" src/domain/renewals.ts`.
6. Revisar que ningún anexo declare PASS de proveedor: `grep -rn "NOT_VERIFIED" docs/campaigns/reports`.

## 11. Siguiente paso recomendado

Conectar el `PgStore` ya verificado al API por `DATABASE_URL` y repetir `npm run db:verify`
contra Supabase staging; después, un único proveedor de conversaciones con discovery real
(C13/C14). Sin credenciales, el resto sigue en [STUBS.md](STUBS.md).
