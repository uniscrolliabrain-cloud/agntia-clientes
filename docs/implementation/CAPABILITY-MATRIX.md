# Matriz de capacidades y adaptadores

Todos los adaptadores existen como contrato + transporte inyectable. **Ninguno** se ha
ejecutado contra un proveedor real. Estados: `documented` ≠ `verified`.

| Proveedor | Operación | Estado real | Evidencia |
|---|---|---|---|
| Chatwoot | `conversation.read` | `documented` | Test con `FakeTransport`; mapeo de visibilidad y adjuntos |
| Chatwoot | `message.create` | `documented` | Requiere `approvalRef`; id remoto obligatorio |
| Chatwoot | `message.delete` / retry arbitrario | `forbidden` | No expuesto en adaptador |
| Twenty | `contact.read` / `contact.write` | `documented` | Schema por workspace; escritura exige mapping y `If-Match` |
| Frappe CRM/Helpdesk | `ticket.read` | `documented` | DocTypes nominados; sin RPC genérico |
| Zammad | `ticket.read` | `documented` | Instancia por tenant obligatoria (`assertZammadIsolation`) |
| Resend | `email.send` | `documented` | `Idempotency-Key`, threading `Message-ID`/`References`, ventana 24 h |
| Meta WhatsApp | cualquier envío | `documented` / **`unknown`** | Revalidación pendiente por HTTP 429; canal deshabilitado |
| Anam | sesión de presencia | `not_configured` | Sin API key no hay sesión: fallback texto |
| Supabase | JWT | `verified` (local) | Firma HS256 comprobada; JWKS RS256/ES256 implementado, sin proyecto real |

## Reglas que el código hace cumplir

- Discovery previo obligatorio: sin `CapabilityReport` la escritura lanza `capability_unsupported`.
- Scopes ausentes en el probe → `forbidden`, nunca "funciona igual".
- Un `200` con HTML o sin JSON no se declara healthy: estado `unknown`.
- Egress: solo HTTPS (salvo localhost de desarrollo), host en allowlist, puerto permitido, sin
  credenciales en URL, bloqueo de IP privada/metadata y de DNS que resuelva a red privada.
- El agente nunca recibe `baseUrl`, token, método ni workspace: los resuelve el registro de
  conexiones por `endpointRef`/`secretRef`.

## Cómo habilitar un conector (futuro, no ejecutado)

1. Provisionar cuenta de laboratorio y fijar versión/imagen.
2. Registrar `Connection` con `endpointRef` y `secretRef` (gestor externo de secretos).
3. Ejecutar `DiscoveryService.probe` con credencial de mínimo privilegio.
4. Revisar edición/módulos/licencia del proveedor.
5. Probar lectura y escritura con dos tenants sintéticos.
6. Solo entonces `requireCapability` devolverá `verified` y el adaptador se usará desde el worker.

El canal WhatsApp permanece en `documentation_revalidation_required` hasta resolver el 429 y
fijar versión, plantillas y ventana vigentes.
