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
| Tests | `npm test` | **87/87 pass, 0 fail** |
| E2E A–I | `npm run eval` | **9/9 PASS** → `artifacts/e2e-report.json` |
| Manifiesto | `npm run reports` | 42 anexos, conteos 42/294/84 intactos |

Reparto de gates por fase: **30 PASS**, **8 NOT_VERIFIED**, **4 BLOCKED**.

## Límites que se declaran sin rodeos

1. **Sin Postgres ni RLS ejecutada**: hay migraciones con FK compuestas y políticas RLS, y un
   repositorio en memoria con las mismas garantías observables. El gate de base de datos es
   `NOT_VERIFIED`.
2. **Sin proveedores reales**: Chatwoot, Twenty, Frappe, Zammad, Resend y WhatsApp tienen
   contrato y transporte fake. Cero credenciales, cero llamadas, cero receipts reales.
3. **WhatsApp bloqueado**: Meta devolvió HTTP 429 en la investigación; el canal sigue en
   `documentation_revalidation_required` y ningún envío es posible.
4. **Anam no configurado**: la ruta de sesión responde 503 con `fallback: text_only`.
5. **Bridge del padre inexistente**: `HOST_BRIDGE_NOT_VERIFIED`; no se ha tocado `/agente`.
6. **UI sin probar en navegador**: hay marco HTML accesible servido en `/portal`, pero no se ha
   abierto en un navegador ni probado con lector de pantalla.
7. **CI no ejecutada en GitHub**: el workflow existe; los mismos comandos se ejecutaron en local.

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
2. Autorizar un entorno con Postgres/Supabase para convertir `C06` y `C03` en PASS reales.
3. Elegir **un** backend de conversaciones y ejecutar discovery real (C13/C14/C15–C17).
4. Resolver la divergencia 12/16 y congelar revisión canónica del twin.
5. Solo entonces: piloto con datos sintéticos, y después producción con aprobación explícita.

No se ha publicado nada, no se ha desplegado nada y no se ha pushado ningún commit.
