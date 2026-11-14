# Privacidad, retención y acciones sensibles

## Matriz de retención implementada (`DEFAULT_RETENTION`)

| Objeto | Finalidad | Meses | Revisión legal |
|---|---|---:|---|
| `message.original` | support_reply | 24 | sí |
| `message.summary` | analytics | 12 | sí |
| `embedding.chunk` | case_management | 12 | sí |
| `audit.ref` | security | 60 | sí |
| `av.transcript` | av_recording | 3 | sí |

Sin política declarada, `retentionFor` lanza 404: no se inventa un plazo.

## Derechos

`PrivacyService` implementa `access | rectification | erasure | export | restriction` con:

- alcance obligatorio; `scope: ["*"]` pedido por el modelo → 403;
- preview de export que omite `third_party:*` y lista las redacciones;
- aprobación solo tras verificación; ejecución con ACK por almacén (`propagated:*`);
- `legalHold` bloquea la supresión y obliga a planificar restricción;
- `reappliedAfterRestore` deja constancia de las supresiones que un restore debe reaplicar.

## Acciones sensibles fuera de alcance (piloto)

`refund`, `payment`, `signature`, `contract_decision`, `credit_decision`, `cancellation`,
`export_all`, `admin` no existen como tools ni como rutas. El modelo puede redactar una
propuesta o un handoff; la ejecución pertenece a un puerto autorizado del dominio y a un humano.

Las tools expuestas son únicamente:

`clientes_customer_read`, `clientes_case_read`, `clientes_case_timeline`,
`clientes_knowledge_search`, `clientes_answer_propose`, `clientes_handoff_propose`,
`clientes_health_explain`, `clientes_report_read`, `clientes_integration_health`.

`clientes_handoff_propose` e `clientes_integration_health` fallan cerrado en el SDK: requieren
la ruta autenticada o una conexión nominada por el operador.

## Grabación y presencia

- Grabación desactivada por defecto; `recordingRequested` exige política y consentimiento.
- La sesión Anam no recibe capacidades de efecto (`approve`, `send`, `refund`, `export_all`).
- `oralConfirmation()` devuelve `authorizes: false`: la voz crea propuesta, no autorización.
- No se infieren emociones ni biometría; no se piden tarjetas ni credenciales en chat.
