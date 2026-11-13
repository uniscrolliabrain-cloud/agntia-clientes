# CLI-C32 — Anam como presencia del twin

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/32-anam-como-presencia-del-twin.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Integrar visio con identidad canónica y sesiones de mínimo alcance.

## Artefactos previstos
- `packages/presence/anam/`
- `docs/anam-session-policy.md`
- `tests/anam-session.test.ts`

## Invariante
Token Anam no es JWT Supabase ni prueba de aprobación humana.

## Dependencias y contrato
Dependencias: CLI-C31. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: N01, H01, S01.

## Tareas originales, sin granularizar
- **CLI-C32-T01:** Fijar SDK/API/modalidad y revisar términos, región y DPA vigentes. **Aceptación prevista:** No comprar plan ni habilitar grabación por probar el SDK.
- **CLI-C32-T02:** Crear sesión backend desde principal Supabase y TwinBinding válido. **Aceptación prevista:** API key nunca llega a navegador/modelo/log.
- **CLI-C32-T03:** Acotar sesión a caso/proyecto, capabilities y mandato. **Aceptación prevista:** Cambiar tenant requiere nueva sesión/contexto, no reutilizar token.
- **CLI-C32-T04:** Implementar tools a través del mismo PEP de negocio. **Aceptación prevista:** Avatar no ejecuta HTTP/send/approve libremente.
- **CLI-C32-T05:** Aplicar duración, concurrencia, reserva/coste y revocación. **Aceptación prevista:** Sin saldo ofrece texto cuando permitido; seguridad no se degrada.
- **CLI-C32-T06:** Definir micrófono/cámara, disclosure, transcript y grabación optativa. **Aceptación prevista:** Sin política aprobada no se graba ni analiza emociones/biometría.
- **CLI-C32-T07:** Probar reconexión, cambio de usuario, intento de voz y fallback accesible. **Aceptación prevista:** Sí oral no confirma acción sensible; sesión revocada no accede a contexto.

## Gates previstos, NO ejecutados
- CLI-C32-G01: Token de sesión emitido para casoA no abre documentoB ni cambia persona/tenant.
- CLI-C32-G02: Desconexión del padre con mandato expirado detiene nuevos efectos de la visio.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
