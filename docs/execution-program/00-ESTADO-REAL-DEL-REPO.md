# Baseline de ejecución — Agntia Clientes

Inspección GitHub de main 2026-11-14: 76 entradas en árbol, todas documentales (README, AGENTS, docs, manifests, research). **No hay aplicación, SDK ni tests de producto implementados**; README original declara DOCUMENTATION_ONLY y 42 campañas NOT_STARTED. Fuente: `README.md`, `docs/campaigns/campaign.json`, `docs/architecture/01-arquitectura.md`, `docs/architecture/03-compatibilidad-agente.md`. El SHA del padre citado en la documentación es histórico `54b8d5407a8576459448c4d059a877297d18ca7a`, no debe tratarse como HEAD actual.

## Al iniciar Freebuff
1. `git status --porcelain`, `git rev-parse HEAD`, `git ls-files`, `git branch --show-current` y lockfile/manifest real; documentar cambios externos posteriores a esta preparación.
2. Consultar padre por SHA de solo lectura y resolver drift; no modificarlo ni crear agentes canónicos alternativos.
3. Verificar licencias de Chatwoot/Twenty/Frappe/Zammad/Anam y ediciones antes de instalar.
4. Si Docker, proveedores o credenciales faltan: pruebas unitarias/fixtures, registrar BLOCKED de integración, no declarar PASS real.
5. Primer corte funcional: dos tenants sintéticos → contacto → conversación → caso → propuesta → aprobación → envío sandbox → receipt → resolución → reporte.
