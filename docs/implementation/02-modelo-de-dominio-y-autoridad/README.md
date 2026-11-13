# CLI-C02 — Modelo de dominio y autoridad

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/02-modelo-de-dominio-y-autoridad.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Separar SaaS, tenants, clientes de cada pyme y principales.

## Artefactos previstos
- `docs/domain-model.md`
- `docs/authority-map.md`
- `docs/adr/002-boundaries.md`

## Invariante
Contact, CustomerOrganization, tenant y User no son equivalentes.

## Dependencias y contrato
Dependencias: CLI-C01. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, V05, V06.

## Tareas originales, sin granularizar
- **CLI-C02-T01:** Dibujar organización operadora, dos tenants y sus organizaciones/contactos. **Aceptación prevista:** Ejemplo B2B y B2C muestra relaciones sin convertir cada contacto en tenant.
- **CLI-C02-T02:** Definir responsables de cada campo de cliente, ticket, mensaje y consentimiento. **Aceptación prevista:** AuthorityMap tiene autoridad, proyección, resolución de conflicto y dueño humano.
- **CLI-C02-T03:** Definir ServiceAgreement/WorkOrder y responsabilidad por cada efecto. **Aceptación prevista:** Solapamiento con ventas/redes permitido, pero no dos emisores activos para el mismo intent.
- **CLI-C02-T04:** Documentar los modos integrado y portal externo con Supabase común. **Aceptación prevista:** Cliente externo no necesita UI AgntiaPro; agente canónico sigue en el padre.
- **CLI-C02-T05:** Definir ACL interna, representante externo, contacto y acceso del operador. **Aceptación prevista:** Casos de la misma empresa no son visibles automáticamente para cualquier contacto.
- **CLI-C02-T06:** Enumerar límites de dinero, contratos, identidad, salud y decisiones sensibles. **Aceptación prevista:** Ningún workflow inicial ejecuta refund, pago, firma o decisión significativa sin dominio autorizado.
- **CLI-C02-T07:** Crear fixtures de fronteras y revisión del modelo antes de DDL. **Aceptación prevista:** Dos tenants y un contacto multiempresa conservan origen, ámbito y cardinalidad.

## Gates previstos, NO ejecutados
- CLI-C02-G01: Contacto de organización X intenta abrir caso privado de Y dentro del mismo tenant.
- CLI-C02-G02: El CRM y el middleware reclaman autoridad sobre un campo: conflicto bloquea overwrite.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
