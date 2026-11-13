# CLI-C19 — Correo transaccional y threading

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/19-correo-transaccional-y-threading.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Conectar entrada/salida de email con límites y receipts verificables.

## Artefactos previstos
- `packages/channels/email/`
- `docs/email-delivery.md`
- `tests/email.test.ts`

## Invariante
accepted, delivered, bounced y resolved son estados diferentes.

## Dependencias y contrato
Dependencias: CLI-C18. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01, A07.

## Tareas originales, sin granularizar
- **CLI-C19-T01:** Asignar autoridad de envío entre padre, Chatwoot y proveedor email. **Aceptación prevista:** Misma operación solo tiene un dispatch autorizado.
- **CLI-C19-T02:** Configurar dominio/remitente verificados y secretos backend. **Aceptación prevista:** No From/Reply-To arbitrario del modelo o cabeceras con CRLF.
- **CLI-C19-T03:** Verificar webhook/ingreso y resolver thread sin confiar solo en asunto. **Aceptación prevista:** Message-ID/References y binding limitan el hilo correcto.
- **CLI-C19-T04:** Normalizar recipients, cc/bcc, adjuntos y supresión. **Aceptación prevista:** Preview muestra todos destinatarios; datos no se filtran por copia oculta inadvertida.
- **CLI-C19-T05:** Implementar clave de idempotencia y ledger local durable. **Aceptación prevista:** Ventana24h documentada de Resend no se convierte en dedup eterno remoto.
- **CLI-C19-T06:** Procesar accepted/delivery/bounce/complaint con orden y replay. **Aceptación prevista:** Webhook repetido o tardío no retrocede estado confirmado sin regla.
- **CLI-C19-T07:** Probar fallo de red, expiración de dedup y reply a buzón compartido. **Aceptación prevista:** Resultado incierto se reconcilia o bloquea antes de reenviar.

## Gates previstos, NO ejecutados
- CLI-C19-G01: Timeout tras aceptación y retry al día siguiente no crea otro correo por nueva key.
- CLI-C19-G02: Email spoofed pide cambiar datos bancarios o entregar documentos: identidad insuficiente.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
