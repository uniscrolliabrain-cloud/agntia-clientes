# Anexos de implementación por fase

Estado global: **SKELETON_IMPLEMENTED** · 42 anexos · typecheck OK · 87/87 tests · 9/9 E2E.

Estos anexos se generan desde `scripts/annex-data-*.ts` y describen qué se implementó de
verdad en cada campaña, qué se verificó, qué se desvió y qué queda pendiente.

| Fase | Campaña | Estado del gate |
|---|---|---|
| C01 | [Baseline y perímetro de solo lectura](C01.md) | PASS |
| C02 | [Modelo de dominio y autoridad](C02.md) | PASS |
| C03 | [Autenticación Supabase y principal](C03.md) | PASS |
| C04 | [Twin y trazabilidad nativa](C04.md) | PASS |
| C05 | [DTOs y contratos runtime](C05.md) | PASS |
| C06 | [Postgres, RLS y migraciones](C06.md) | NOT_VERIFIED |
| C07 | [Finalidades, preferencias y permisos de comunicación](C07.md) | PASS |
| C08 | [Acuerdos, entitlements y encargos](C08.md) | PASS |
| C09 | [Registro de proveedores, OAuth y secretos](C09.md) | PASS |
| C10 | [Discovery y capacidades verificadas](C10.md) | PASS |
| C11 | [Directorio y resolución de identidad](C11.md) | BLOCKED |
| C12 | [Importación, staging y sync](C12.md) | BLOCKED |
| C13 | [Chatwoot lectura y bindings](C13.md) | PASS |
| C14 | [Chatwoot writeback seguro](C14.md) | PASS |
| C15 | [CRM Twenty opcional](C15.md) | NOT_VERIFIED |
| C16 | [Frappe CRM y Helpdesk alternativos](C16.md) | NOT_VERIFIED |
| C17 | [Zammad y portabilidad de helpdesk](C17.md) | NOT_VERIFIED |
| C18 | [Canal web y sesiones de contacto](C18.md) | PASS |
| C19 | [Correo transaccional y threading](C19.md) | PASS |
| C20 | [WhatsApp oficial bajo capacidad confirmada](C20.md) | BLOCKED |
| C21 | [Inbox, webhooks y evidencia adjunta](C21.md) | PASS |
| C22 | [Casos y contrato de resolución](C22.md) | PASS |
| C23 | [SLA, calendario y routing determinista](C23.md) | PASS |
| C24 | [Conocimiento versionado y RAG autorizado](C24.md) | PASS |
| C25 | [Propuestas IA, idiomas y verificación](C25.md) | PASS |
| C26 | [Preview y aprobaciones de efecto](C26.md) | PASS |
| C27 | [Jobs, outbox y reconciliación](C27.md) | PASS |
| C28 | [Handoff humano y coordinación](C28.md) | PASS |
| C29 | [Onboarding y playbooks de servicio](C29.md) | PASS |
| C30 | [Customer success y señales explicables](C30.md) | PASS |
| C31 | [Renovaciones, reclamaciones y propuestas comerciales](C31.md) | BLOCKED |
| C32 | [Anam como presencia del twin](C32.md) | NOT_VERIFIED |
| C33 | [Portal responsive y revisión humana](C33.md) | NOT_VERIFIED |
| C34 | [SDK TypeScript, Hono y tools nominadas](C34.md) | PASS |
| C35 | [Bridge del padre y eventos interoperables](C35.md) | NOT_VERIFIED |
| C36 | [Observabilidad, métricas y reportes](C36.md) | PASS |
| C37 | [Costes, cuotas y backpressure](C37.md) | PASS |
| C38 | [Derechos, retención y salida del servicio](C38.md) | PASS |
| C39 | [Seguridad adversarial y aislamiento](C39.md) | PASS |
| C40 | [Evaluaciones y vertical E2E reproducible](C40.md) | PASS |
| C41 | [Operaciones, CI y release controlada](C41.md) | NOT_VERIFIED |
| C42 | [Aceptación, informe y entrega a otra IA](C42.md) | PASS |

## Lectura rápida

- **PASS** (ejecutado y verificado en local): 30 fases.
- **NOT_VERIFIED** (código y contrato listos, proveedor o runtime real ausente): 8 fases.
- **BLOCKED** (deliberadamente fuera de alcance en el esqueleto): 4 fases.

Ningún PASS de este documento equivale a un gate de proveedor real. Ver
[CAPABILITY-MATRIX](../../implementation/CAPABILITY-MATRIX.md).
