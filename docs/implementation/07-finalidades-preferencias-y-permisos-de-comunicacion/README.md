# CLI-C07 — Finalidades, preferencias y permisos de comunicación

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/07-finalidades-preferencias-y-permisos-de-comunicacion.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Crear ledger de tratamiento y supresión revalidable.

## Artefactos previstos
- `packages/privacy/processing-basis.ts`
- `packages/privacy/consent.ts`
- `tests/preferences.test.ts`

## Invariante
Un ticket o consentimiento AV no autoriza marketing ni entrenamiento.

## Dependencias y contrato
Dependencias: CLI-C06. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: L01, L02, L03.

## Tareas originales, sin granularizar
- **CLI-C07-T01:** Definir finalidades y bases de tratamiento con revisión humana. **Aceptación prevista:** Soporte, grabación, analítica y promoción tienen decisiones separadas.
- **CLI-C07-T02:** Definir ConsentEvent append-only y proyección de estado vigente. **Aceptación prevista:** Grant/withdraw, alcance, versión y prueba se reconstruyen temporalmente.
- **CLI-C07-T03:** Crear preferencias por canal/sujeto y listas de supresión. **Aceptación prevista:** Retirada posterior invalida nuevos envíos aunque la propuesta fuera previa.
- **CLI-C07-T04:** Clasificar comunicación operacional frente a comercial mediante policy revisable. **Aceptación prevista:** Upsell/renovación promocional no se etiqueta soporte para saltar requisitos.
- **CLI-C07-T05:** Vincular identidad de sujeto y evidencia de aceptación/invitación. **Aceptación prevista:** No aceptar consentimiento enviado por una persona diferente sin representación verificada.
- **CLI-C07-T06:** Aplicar permisos a contexto LLM, documentos y canales antes de lectura/efecto. **Aceptación prevista:** Una base declarada no concede todas las capacidades del sistema.
- **CLI-C07-T07:** Documentar matrix legal pendiente y pruebas de revocación. **Aceptación prevista:** Cambios de texto/fecha legal generan revisión, no certificación automática.

## Gates previstos, NO ejecutados
- CLI-C07-G01: Retirada antes del dispatch bloquea el mensaje en cola.
- CLI-C07-G02: Persona acepta grabación y el modelo intenta incluirla en entrenamiento/campaña: denegado.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
