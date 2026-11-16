# Freebuff — handoff ejecutable
**No ejecutar sin leer** `handoff_chat_gpt.md`, `docs/concept-master/CONCEPT-MASTER.md`, `docs/campaigns/README.md`, `docs/release/IMPLEMENTATION-REPORT.md`, `docs/agntiapro-master-audit/04-roadmap/ROADMAP-MAESTRO.md`.
1. Clonar repo y comprobar `git rev-parse HEAD`, `git status --short`, `git branch -a`. Crear rama `feat/clientes-Cxx-<slug>` desde main actualizado; NO desarrollar sobre rama documental.
2. Preparar Node >=22.6; `npm ci`, `npm run typecheck`, `npm test`, `npm run eval` (solo si entorno compatible). Registrar exit codes reales. Nunca inventar tests.
3. Para cada campaña, inspeccionar rutas reales con `git ls-files`, registrar baseline y resolver discrepancias de nombres; archivos de implementación citados en campañas son PROPUESTOS salvo verificación.
4. Seguir dependencias C43→C46→C47; aislar zonas de escritura, commits por patchset, no sobrescribir trabajos concurrentes. Ejecutar plan→implementar→test→corregir→reportar→replanificar.
5. Antes de acciones con efecto, exigir principal verificado, tenant server-side, mandato, autorización, aprobación vinculada a payload hash y evidencia. Si resultado remoto incierto: outcome_unknown y reconciliación, nunca reintento ciego.
6. Publicar reportes por wave con SHA base/final, comandos, tests, fallos, cambios, evidencia, bloqueos, decisiones y gate. Marcar NOT_VERIFIED sin acceso real a proveedor/DB.
7. No merge a main, no deploy, no migración destructiva, no credenciales en repo, no modificar `agente` sin aprobación explícita.
8. Al cerrar, ejecutar CI, pruebas A/B tenant, permisos negativos, idempotencia, crash/restart y auditoría de secretos; solicitar aprobación founder para integraciones reales.
