# Informe de implementación · esqueleto de las 42 fases

Fecha: 2026-11-14 · Rama de trabajo: `freebuff/e328a674df54fe15e5536cde`
Estado: **SKELETON_IMPLEMENTED** (no piloto aceptado, no producción).

## Qué se ha hecho

Se ejecutaron las 42 campañas `CLI-C01…CLI-C42` como un monorepo TypeScript ejecutable:
contratos, identidad, twins, casos, SLA, conocimiento, propuestas, aprobaciones, outbox,
inbox, adaptadores, canales, SDK, tools, bridge, presencia, observabilidad, presupuesto,
privacidad, evals y CI. Cada fase tiene su anexo en
[`docs/campaigns/reports/`](../campaigns/reports/README.md).

## Verificación real (esta máquina, esta fecha)

| Comprobación | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | sin errores |
| Tests | `npm test` | **107/107 pass, 0 fail** |
| E2E A–I | `npm run eval` | **9/9 PASS** → `artifacts/e2e-report.json` |
| Manifiesto | `npm run reports` | 42 anexos, conteos 42/294/84 intactos |

Reparto de gates por fase: **33 PASS**, **8 NOT_VERIFIED**, **1 BLOCKED** (equivalen a
`TEST_VERIFIED`, `CODE_VERIFIED` y `PROPOSED` en el vocabulario del factory). C11, C12 y C31
dejaron de estar bloqueadas al implementarse identidad revisable, importación idempotente y
propuestas de compensación sin ejecución.

## Reconciliación con `docs/factory-prep-v1-20261113`

Se revisaron los diez documentos de preparación y se corrigió lo que faltaba (detalle en
[FACTORY-RECONCILIATION.md](../implementation/FACTORY-RECONCILIATION.md)):

- **ADTC v0.1** implementado como contrato ejecutable (`src/contracts/adtc.ts`): envelope
  completo, `traceparent` W3C, refs restringidas y rechazo activo de PII/URLs/texto libre en
  el bus. `attemptId` añadido como nullable porque el texto lo exige y el ejemplo lo omite.
- **11 puertos PROPOSED** y **contrato de adaptador de 19 campos** (`src/ports/index.ts`):
  el registro rechaza contratos incompletos y nada se marca conectado sin evidencia.
- **Vocabulario de certeza** del factory (`src/contracts/certainty.ts`), que impide tratar un
  `CODE_VERIFIED` como verificado.
- **ACL de adjuntos** por caso y **observabilidad no bloqueante**: dos negativos del documento
  que no estaban cubiertos.
- **Lockfile reparado**: el `package-lock.json` commiteado no cuadraba con `package.json`
  (`npm ci` fallaba). Regenerado desde los rangos declarados; `npm ci` ahora funciona.

## Límites que se declaran sin rodeos

1. **Postgres verificado, no en Supabase**: `npm run db:verify` levanta PostgreSQL 18.7 embebido
   y pasa 18/18 garantías (aislamiento A/B, fail-closed, FK compuesta, unicidad scoped,
   `audit_log` append-only) con un rol no-owner. El API sigue sirviendo desde el store en memoria:
   falta elegir `PgStore` por `DATABASE_URL` y repetir la prueba en Supabase staging.
2. **Sin proveedores reales**: Chatwoot, Twenty, Frappe, Zammad, Resend y WhatsApp tienen
   contrato y transporte fake. Cero credenciales, cero llamadas, cero receipts reales.
3. **WhatsApp bloqueado**: Meta devolvió HTTP 429 en la investigación; el canal sigue en
   `documentation_revalidation_required` y ningún envío es posible.
4. **Anam no configurado**: la ruta de sesión responde 503 con `fallback: text_only`.
5. **Bridge del padre inexistente**: `HOST_BRIDGE_NOT_VERIFIED`; no se ha tocado `/agente`.
6. **UI probada en navegador, no con lector de pantalla**: `/portal` se abrió en Chromium real
   (capturas en `docs/implementation/evidence/`) y se corrigieron tres defectos; falta un flujo
   completo y revisión con lector de pantalla y móvil real. C33 sigue `NOT_VERIFIED`.
7. **CI en GitHub en verde**: jobs `verify`, `docs` y `database` (migraciones + RLS reales).

## Hallazgos sobre la documentación previa

- **Formato**: todo el corpus arrastra números pegados a palabras (`"Campaña de42 fases"`,
  `"Secuencia1/42"`, `"Lite30€"`). Es cosmético, pero conviene corregirlo en una pasada.
- **`ResolutionContract.kind`** no tenía enum definido; se fijó en el contrato.
- **`RelationshipFact`** no incluía `tenantId`; sin él la fila no era aislable.
- **Proponente de una aprobación** no estaba modelado; se añadió `proposerActorId`.
- **Dos bugs propios detectados por los tests**: comparación de firma JWT en formato distinto
  al emitido, y firma de mandato que se incluía a sí misma. Ambos corregidos.
- **Divergencia 12/16** del catálogo de personas del padre sigue abierta y bloquea un binding
  productivo.

## Bloques deliberadamente fuera de alcance

- Importación CSV/JSON con staging y cursores (C12).
- Merge de identidades con alias y reconstrucción (C11).
- Renovaciones, reclamaciones y propuestas comerciales con puerto contractual (C31).
- Cualquier efecto financiero, firma o decisión jurídica.

Estos bloques no se simulan: quedan `BLOCKED` con su motivo en el anexo correspondiente.

## Cómo continuar

1. Revisar este informe y los 42 anexos; decidir qué se ajusta.
2. Autorizar Supabase staging para convertir `C03` en PASS real y repetir allí las migraciones de
   C06 ya verificadas en PostgreSQL local.
3. Elegir **un** backend de conversaciones y ejecutar discovery real (C13/C14/C15–C17).
4. Resolver la divergencia 12/16 y congelar revisión canónica del twin.
5. Solo entonces: piloto con datos sintéticos, y después producción con aprobación explícita.

No se ha desplegado nada ni se ha activado ningún proveedor. El código y los anexos están en
`main`; los servicios externos siguen sin credenciales y así se declaran en [STUBS.md](STUBS.md).
