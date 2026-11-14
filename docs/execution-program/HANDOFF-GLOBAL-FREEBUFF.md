# Handoff global a Freebuff — ejecutar todo el programa

## Mandato
Implementar **las 42 campañas en orden de dependencias**, sobre el repositorio `uniscrolliabrain-cloud/agntia-clientes`, tomando `docs/execution-program/03-PLAN-MAESTRO.md` como índice y cada `campaigns/NNN/CAMPAIGN.md` como especificación. El diseño está completo antes de iniciar. No pedir una nueva campaña ni meta-auditoría de Astra entre fases. No modificar el padre, no desplegar, no enviar comunicaciones reales ni incurrir gastos sin aprobación del founder.

## Inicio
1. Congelar SHAs y ejecutar baseline real de herramientas/entorno.
2. Crear rama de implementación aislada; no implementar directamente en `main` ni en esta rama de documentación.
3. Instalar solo dependencias de licencias compatibles y proveedores necesarios; no meter stacks opcionales por defecto.
4. Ejecutar C01→C42, cada tarea T01→T07 y gates G01→G02; para cada una registrar archivo, diff, pruebas y evidencia.
5. Continuar asincrónicamente aunque los reportes periódicos no reciban respuesta; detener exclusivamente acciones no autorizadas, incidentes de seguridad, pérdida de integridad o dependencia realmente bloqueante. No ocultar bloqueos.
6. Al terminar producir `docs/execution-evidence/FINAL-FREEBUFF-REPORT.md` con SHA, matriz 42×7, gates, pruebas, gaps, riesgos, costes y rollback. Entregar todo a Codex para auditoría **posterior**.

## Definición de terminado
No basta con que exista código. Exigir API+UI+SDK funcionales, aislamiento dos tenants, contratos y bridge validados, caso E2E con aprobación y receipt, trazabilidad, errores seguros, tests reproducibles, licencias, migraciones, runbook, plan de recuperación y evidencia de despliegue solo cuando autorizado. Si falta proveedor o aprobación, marcar candidato a piloto condicionado, no 'production ready'.
