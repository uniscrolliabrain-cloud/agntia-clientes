# Evidencia visual del portal (C33)

Capturas tomadas el 2026-11-15 en Chromium sobre el hostname de preview del dev server
(`node src/server.ts`, `NODE_ENV=development`), con navegador real, no con HTML inspeccionado a mano.

| Archivo | Qué prueba |
|---|---|
| `portal-bandeja-2026-11-15.png` | `/portal` renderiza con landmarks (`header`, `nav`, `main`, `section`, `aside`), `lang="es"`, listas con estado y el botón de sesión **deshabilitado** con su explicación |
| `portal-caso-2026-11-15.png` | `/portal/cases/case_case_ana_1` muestra propuesta pendiente, citas (v2 vigente, v1 retirada), evidencia pendiente y un botón de aprobación deshabilitado |

Comprobaciones de la sesión de navegador:

- `/` responde `302` y redirige a `/portal` (antes devolvía `404` JSON).
- Cero errores de consola; el favicon en línea elimina el `404` de `/favicon.ico`.
- Sin datos reales: los nombres y casos son fixtures (`ana@acme.example`, `case_case_ana_1`).

Lo que **no** prueba esta evidencia: flujos completos de bandeja, aprobación y envío en el
navegador (no hay SPA ni sesión Supabase), lector de pantalla, ni viewport móvil real. Por eso
C33 sigue `NOT_VERIFIED` aunque el marco visual esté verificado.
