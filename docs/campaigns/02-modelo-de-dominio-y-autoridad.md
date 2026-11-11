# CLI-C02 · Modelo de dominio y autoridad

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia2/42. Dependencia: CLI-C01.

## Objetivo e invariante

Separar SaaS, tenants, clientes de cada pyme y principales.

Invariante: Contact, CustomerOrganization, tenant y User no son equivalentes.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `docs/domain-model.md`
- `docs/authority-map.md`
- `docs/adr/002-boundaries.md`

## Tareas, en orden

### CLI-C02-T01

Dibujar organización operadora, dos tenants y sus organizaciones/contactos.

Aceptación: Ejemplo B2B y B2C muestra relaciones sin convertir cada contacto en tenant.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C02-T02

Definir responsables de cada campo de cliente, ticket, mensaje y consentimiento.

Aceptación: AuthorityMap tiene autoridad, proyección, resolución de conflicto y dueño humano.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C02-T03

Definir ServiceAgreement/WorkOrder y responsabilidad por cada efecto.

Aceptación: Solapamiento con ventas/redes permitido, pero no dos emisores activos para el mismo intent.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C02-T04

Documentar los modos integrado y portal externo con Supabase común.

Aceptación: Cliente externo no necesita UI AgntiaPro; agente canónico sigue en el padre.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C02-T05

Definir ACL interna, representante externo, contacto y acceso del operador.

Aceptación: Casos de la misma empresa no son visibles automáticamente para cualquier contacto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C02-T06

Enumerar límites de dinero, contratos, identidad, salud y decisiones sensibles.

Aceptación: Ningún workflow inicial ejecuta refund, pago, firma o decisión significativa sin dominio autorizado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C02-T07

Crear fixtures de fronteras y revisión del modelo antes de DDL.

Aceptación: Dos tenants y un contacto multiempresa conservan origen, ámbito y cardinalidad.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C02-G01 — NOT_EXECUTED:** Contacto de organización X intenta abrir caso privado de Y dentro del mismo tenant.
- **CLI-C02-G02 — NOT_EXECUTED:** El CRM y el middleware reclaman autoridad sobre un campo: conflicto bloquea overwrite.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, V05, V06. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
