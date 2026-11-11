# CLI-C19 · Correo transaccional y threading

Estado: **NOT_STARTED**. Pruebas: **NOT_EXECUTED**. Secuencia19/42. Dependencia: CLI-C18.

## Objetivo e invariante

Conectar entrada/salida de email con límites y receipts verificables.

Invariante: accepted, delivered, bounced y resolved son estados diferentes.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/channels/email/`
- `docs/email-delivery.md`
- `tests/email.test.ts`

## Tareas, en orden

### CLI-C19-T01

Asignar autoridad de envío entre padre, Chatwoot y proveedor email.

Aceptación: Misma operación solo tiene un dispatch autorizado.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C19-T02

Configurar dominio/remitente verificados y secretos backend.

Aceptación: No From/Reply-To arbitrario del modelo o cabeceras con CRLF.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C19-T03

Verificar webhook/ingreso y resolver thread sin confiar solo en asunto.

Aceptación: Message-ID/References y binding limitan el hilo correcto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C19-T04

Normalizar recipients, cc/bcc, adjuntos y supresión.

Aceptación: Preview muestra todos destinatarios; datos no se filtran por copia oculta inadvertida.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C19-T05

Implementar clave de idempotencia y ledger local durable.

Aceptación: Ventana24h documentada de Resend no se convierte en dedup eterno remoto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C19-T06

Procesar accepted/delivery/bounce/complaint con orden y replay.

Aceptación: Webhook repetido o tardío no retrocede estado confirmado sin regla.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C19-T07

Probar fallo de red, expiración de dedup y reply a buzón compartido.

Aceptación: Resultado incierto se reconcilia o bloquea antes de reenviar.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C19-G01 — NOT_EXECUTED:** Timeout tras aceptación y retry al día siguiente no crea otro correo por nueva key.
- **CLI-C19-G02 — NOT_EXECUTED:** Email spoofed pide cambiar datos bancarios o entregar documentos: identidad insuficiente.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: H01, A07. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).
