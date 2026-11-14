# Operación, métricas y evidencia

## Arranque local (ejecutado)

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # node --test
npm run eval        # E2E A–I
npm start           # http://localhost:3000
```

Salida real de esta ejecución:

- `tsc --noEmit`: sin errores.
- `node --test`: **87 tests, 87 pass, 0 fail**.
- `npm run eval`: **9 escenarios, 9 PASS** → `artifacts/e2e-report.json`.

## Health semántico

`GET /healthz` devuelve `status: "ok"` **solo** para el proceso. Declara explícitamente:

```json
{
  "bridge": "HOST_BRIDGE_NOT_VERIFIED",
  "providers": "not_configured",
  "anam": "not_configured",
  "database": "in_memory"
}
```

Un 200 de `/healthz` no significa que un proveedor esté sano: eso exige
`GET /v1/clientes/integrations/{id}/capabilities` con `CapabilityReport` verificado.

## Configuración

| Variable | Efecto si falta |
|---|---|
| `SUPABASE_ISSUER` | `/v1/*` falla cerrado (401/503) |
| `SUPABASE_JWKS_URL` o `SUPABASE_JWT_SECRET` | no hay verificación posible |
| `DATABASE_URL` | repositorio en memoria (`database: in_memory`) |
| `CHATWOOT_ENABLED` y credenciales | adaptador no configurado |
| `ANAM_ENABLED` + `ANAM_API_KEY` | sesión AV → 503 con `fallback: text_only` |
| `BUDGET_LITE_EUR` | techo por defecto 30 € |

Sin secretos en logs: el arranque imprime solo estado y puerto.

## Proveedor caído o degradado

1. `DiscoveryService.invalidate(tenant, connection)` para forzar nueva verificación.
2. Suspender nuevos `dispatch` de esa capacidad (el worker falla cerrado).
3. Mantener lectura del snapshot con `freshness` visible.
4. No rotar a otro emisor para "arreglar" un envío incierto: se reconcilia.

## Recuperación de jobs

`Outbox.claim` → `start` → `send` → `ack`. Un fallo incierto (`certain: false`) va a
`dead_letter`, nunca a `queued`; un fallo conocido y reintentable vuelve a `queued` hasta
`maxAttempts`. El `leaseFence` impide que un worker viejo confirme estado.

## Incidente de seguridad

1. Revocar membresía/mandato (`MandateVerifier` con `revocationVersion` superior).
2. Revocar conexión (`ConnectionRegistry.revoke`) → degrada y detiene efectos.
3. Conservar `audit` y receipts minimizados; no borrar evidencia.
4. Repetir la suite negativa (`npm test`) y el E2E antes de reabrir.

## Backup, restore y rollback (diseñado, NO ejecutado)

- Migraciones `0001_schema.sql`, `0002_rls.sql`, `0003_indexes.sql`: aditivas.
- `reappliedAfterRestore` existe para reaplicar supresiones aprobadas.
- Restaurar no debe reenviar `outbox` confirmada ni reutilizar mandatos caducados.
- Sin Postgres disponible en este entorno, el gate real queda `NOT_VERIFIED`.

## Catálogo de métricas

| Métrica | Definición | Honestidad |
|---|---|---|
| `cases.transition` | contador de transiciones aplicadas | etiqueta por tenant |
| FRT sustantivo | minutos hasta respuesta con contenido | acuse automático no cuenta |
| resolución verificada | casos con `ResolutionEvidence` satisfecha | separado de `auto_close` |
| CSAT | media de encuestas recogidas | `null` si no hay encuestas |
| coste | gasto observado del ledger | `measured: false` si no hay tarifa |
| `outcome_unknown` | envíos sin confirmación | visible en dashboard, no oculto |

`Metrics.quantile` devuelve `null` sin datos; `buildReport` añade `gaps` (`no_survey_data`,
`no_first_response_data`, `cost_not_measured`) y su `hash` permite verificar reproducibilidad.

## Evidencia E2E (resumen real)

| Caso | Resultado | Qué demuestra |
|---|---|---|
| A Atención controlada | PASS | propuesta citada v2, un solo efecto, `accepted` ≠ `delivered`, envío no resuelve |
| B Aislamiento | PASS | caso y artículo de B invisibles en A; mandato de A no cruza |
| C Incertidumbre | PASS | `outcome_unknown`, sin retry, reconciliación con evidencia |
| D Cambio concurrente | PASS | editar texto invalida la aprobación |
| E Handoff | PASS | autonomía pausada y ACK humano |
| F Revocación | PASS | supresión y `revocationVersion` bloquean envío |
| G Privacidad | PASS | export minimizado, ACK por almacén, bloqueo legal |
| H Portal externo | PASS | principal `contact` con scopes de recurso y twin enlazado |
| I SLA/success | PASS | calendario IANA, festivo, score `null` sin datos |

Limitaciones: proveedor fake, Postgres en memoria, sin navegador ni sesión Anam real.
