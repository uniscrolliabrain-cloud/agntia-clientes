# CLI-C32 · Anam como presencia del twin

Estado: **SKELETON_IMPLEMENTED**. Pruebas locales: **EXECUTED** (ver anexo). Secuencia32/42. Dependencia: CLI-C31.

## Objetivo e invariante

Integrar visio con identidad canónica y sesiones de mínimo alcance.

Invariante: Token Anam no es JWT Supabase ni prueba de aprobación humana.

## Precondiciones y alcance

Cerrar el gate anterior y fijar SHA, entorno y licencias antes de editar implementación. Este documento es una orden de trabajo futura: sus rutas son artefactos propuestos, no archivos existentes. No modificar `/agente`. La implementación debe consultar sus contratos por SHA y anotar divergencias.

Supabase JWT, membresía y scope de recurso son obligatorios en todos los modos. El agente canónico vive en el padre y el ejecutor local es un twin ligado mediante mandato verificable. Conservar nomenclatura nativa y procedencia; los IDs o campos nuevos del servicio deben declararse como tales. Cliente externo usa portal propio, sin registro agéntico independiente.

## Artefactos previstos

- `packages/presence/anam/`
- `docs/anam-session-policy.md`
- `tests/anam-session.test.ts`

## Tareas, en orden

### CLI-C32-T01

Fijar SDK/API/modalidad y revisar términos, región y DPA vigentes.

Aceptación: No comprar plan ni habilitar grabación por probar el SDK.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C32-T02

Crear sesión backend desde principal Supabase y TwinBinding válido.

Aceptación: API key nunca llega a navegador/modelo/log.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C32-T03

Acotar sesión a caso/proyecto, capabilities y mandato.

Aceptación: Cambiar tenant requiere nueva sesión/contexto, no reutilizar token.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C32-T04

Implementar tools a través del mismo PEP de negocio.

Aceptación: Avatar no ejecuta HTTP/send/approve libremente.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C32-T05

Aplicar duración, concurrencia, reserva/coste y revocación.

Aceptación: Sin saldo ofrece texto cuando permitido; seguridad no se degrada.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C32-T06

Definir micrófono/cámara, disclosure, transcript y grabación optativa.

Aceptación: Sin política aprobada no se graba ni analiza emociones/biometría.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

### CLI-C32-T07

Probar reconexión, cambio de usuario, intento de voz y fallback accesible.

Aceptación: Sí oral no confirma acción sensible; sesión revocada no accede a contexto.

Evidencia pendiente: diff/SHA, fixture y salida real sanitizada; registrar NOT_VERIFIED si no puede ejecutarse.

## Gates de fallo y aceptación

- **CLI-C32-G01 — NOT_EXECUTED:** Token de sesión emitido para casoA no abre documentoB ni cambia persona/tenant.
- **CLI-C32-G02 — NOT_EXECUTED:** Desconexión del padre con mandato expirado detiene nuevos efectos de la visio.

Pasar implica ejecutar pruebas unitarias/contractuales y las integraciones reales pertinentes al cambio. Un mock valida la lógica local, no el proveedor; sin entorno/permiso el gate real queda BLOCKED o NOT_VERIFIED y la capacidad no se habilita. Mantener no regresión de identidad, scopes, aprobación, idempotencia y audit. No gastar dinero ni usar datos de clientes reales para forzar un resultado.

## Evidencia, reversión y reporte

Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.

Registrar operaciones de lectura/escritura ensayadas, actor/tenant/mandato, evidencia de estado inicial y final, fallos deliberados, tests passed/failed/skipped, versiones, tiempo y coste si lo hubo. No almacenar mensajes privados, secretos ni respuestas remotas completas en el repo público. Guardar evidencia sensible fuera del repo y referenciar solo lo necesario.

Detener ante fuga, bypass, secreto, duplicación, pérdida de audit o ambigüedad que pueda provocar un efecto indebido. Resolver antes de avanzar. Reportar al founder después de las fases5/10/15/20/25/30/35/40/42; el informe enlaza resultados, riesgos, bloqueos y siguiente paso.

Fuentes de esta fase: N01, H01, S01. Ver [registro](../research/sources.json), [repos](../research/repositories.json), [contratos](../contracts/01-contratos.md) y [mapa padre](../research/parent-source-map.json).

> Anexo de implementación: [C32](reports/C32.md) · estado del gate: **NOT_VERIFIED** · CLI-C32.
