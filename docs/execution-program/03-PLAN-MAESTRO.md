# Plan maestro — ejecución industrial asíncrona

**42 campañas, 294 tareas, 84 gates de diseño; 0 tests de implementación ejecutados en esta preparación.** Todas las campañas están diseñadas documentalmente por adelantado en `campaigns/001..042/CAMPAIGN.md`. No existe gate Astra. No solicitar diseño de cada campaña entre medias. El manifiesto original `docs/campaigns/campaign.json` permanece intacto.

## Cadena
**Documentación integral completa → Freebuff recorre 42 campañas → Codex audita resultado final → arquitecto reconcilia → founder autoriza merge/release.** Freebuff puede correr pruebas locales durante la ejecución para evitar acumular errores, pero no necesita una auditoría externa tras cada campaña. Reportes de progreso no bloqueantes al finalizar 5, 10, 15, 20, 25, 30, 35, 40 y 42; no son approvals.

## Protocolo de ejecución
- Rama de implementación distinta de la documental, SHA base fijado, escritor único para archivos compartidos y commits trazables por campaña.
- Antes de cada campaña verificar dependencias, crear patchsets según su CAMPAIGN, adaptar rutas solo si HEAD lo requiere y documentar diff.
- Si una integración real no puede ejecutarse: registrar BLOCKED, mantener mock identificado, seguir con campañas independientes y dejar deuda explícita; no falsificar PASS.
- No tocar `uniscrolliabrain-cloud/agente` ni desplegar ni enviar mensajes reales ni comprar proveedores sin aprobación expresa.
- Codex revisa la pasada global, con SHA exacto, fixtures multiempresa, evidencias, gaps y plan de fixes. Founder conserva autorización de merges y producción.
