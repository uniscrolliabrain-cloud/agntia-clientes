# Baseline (CLI-C01)

## SHAs y estado

| Elemento | Valor |
|---|---|
| Repo propio | `uniscrolliabrain-cloud/agntia-clientes`, rama `freebuff/e328a674df54fe15e5536cde` |
| Commit de partida documental | `570b2ab` (`docs: deliver research, SaaS architecture and 42 granular implementation campaigns`) |
| Padre `agente` (referencia congelada) | `54b8d5407a8576459448c4d059a877297d18ca7a` |
| Modificación del padre | **ninguna** en esta ejecución |
| Fecha de ejecución | 2026-11-14 |
| Entorno | Linux, Node `v26.13.0`, npm `11.20.0`, sin Docker, sin red hacia proveedores |

## Inventario de partida

69 archivos versionados: 64 Markdown + 5 JSON + 0 de código. Sin `node_modules` hasta esta
ejecución (se instalaron `hono` y `zod`, más `typescript`/`@types/node` de desarrollo, desde el
registro npm público y con `package-lock.json` nuevo).

## Matriz de herramientas y bloqueos

| Necesidad | Disponible | Estado del gate |
|---|---|---|
| Node + TypeScript | Sí | Ejecutado |
| Tests locales (`node:test`) | Sí | Ejecutado (87) |
| Postgres/Docker | No | `NOT_VERIFIED` |
| Supabase real | No | JWT verificado con firma de fixture |
| Chatwoot/Twenty/Frappe/Zammad | No | `NOT_VERIFIED` (transporte fake) |
| Resend / Meta WhatsApp | No | `NOT_VERIFIED` |
| Anam | No | `NOT_CONFIGURED` (fallback texto) |
| Navegador para UI real | No | `NOT_VERIFIED` (HTML servido, no probado en navegador) |

## Discrepancias de la documentación encontradas al implementar

1. **Numeración pegada a palabras** en todo el corpus (`"Campaña de42 fases"`, `"Secuencia1/42"`,
   `"Lite30€"`, `"Discrepancia12/16"`). Es un artefacto de procesado del texto, no contenido.
   No se ha corregido el corpus original: se documenta aquí.
2. **`ResolutionContract.kind`**: la tabla del contrato no fijaba el enum; el manifiesto usaba
   "informational". Se implementó `informational | change_required | goodwill`.
3. **Aprobación y "proposer"**: la documentación pide separación de funciones pero no definía
   el identificador del proponente. Se resolvió con `proposerActorId` explícito en la creación
   de la aprobación (por defecto el actor canónico del twin), no con el nombre del avatar.
4. **`OutboundIntent` → `delivered`**: el grafo original solo permitía `resolved` con evidencia
   documental; se añadió explícitamente `dispatching → delivered` para proveedores que confirman
   entrega en la misma respuesta, manteniendo `delivered` inalcanzable sin `remoteRefs`.
5. **`RelationshipFact` sin `tenantId`** en la tabla de DTOs: se añadió, porque sin él la fila
   no es aislable.
6. **Renombrado de dedup de correo**: la ventana de 24 h de Resend se documenta pero el ledger
   local no depende de ella.

## Evidencia de esta fase

- `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `.env.example`.
- Salida real: `npx tsc --noEmit` sin errores; `npm test` 87/87; `npm run eval` 9/9.
- No se ejecutaron mutaciones sobre el padre ni sobre servicios externos.
