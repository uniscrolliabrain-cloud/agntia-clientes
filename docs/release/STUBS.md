# Stubs declarados: dónde se para la fábrica sin credenciales

Cada punto de esta lista es un **stub honesto**: hay contrato, tipos y rechazo explícito, pero
nadie ha hablado con el proveedor real. Ninguno se presenta como integración y ninguno convierte
su campaña en PASS. Lo que falta para salir de aquí es siempre lo mismo: una cuenta, una clave y
una decisión de negocio.

## Cómo se comporta un stub

- El puerto existe y está tipado (`src/ports/index.ts`).
- La llamada real depende de un `HttpTransport` inyectable; el de producción **no** está cableado.
- Sin configuración, el código responde `not_configured`, `unsupported` o
  `documentation_revalidation_required`; nunca devuelve datos inventados.
- La UI correspondiente está deshabilitada, no simulada (ver C32/C33).

## Inventario

| Campaña | Stub | Estado | Qué falta exactamente |
|---|---|---|---|
| C13/C14 | `src/adapters/chatwoot.ts` | Contrato + transporte fake | Instancia Chatwoot, `account_id`/`inbox_id` y token Client API |
| C15 | `src/adapters/crm.ts` (`twenty`) | Contrato schema-driven | Workspace Twenty + token, y discovery previo (C10) |
| C16 | `src/adapters/crm.ts` (`frappe`) | Contrato schema-driven | Sitio Frappe CRM/Helpdesk + API key/secret |
| C17 | `src/adapters/crm.ts` (`zammad`) | Contrato schema-driven | Instancia Zammad + token; decidir portabilidad |
| C19 | `src/channels/email.ts` | Contrato + transporte fake | Dominio verificado y clave de Resend (o proveedor elegido) |
| C20 | `src/channels/whatsapp.ts` | `account_not_configured` (documentación revalidada 2026-11-20) | WABA, número de prueba, token y plantillas aprobadas |
| C32 | `src/presence/anam.ts` | `503` con `fallback: text_only` | API key de Anam y política de grabación aceptada |
| C35 | `src/bridge/host.ts`, `src/bridge/http-host.ts` | Cliente real + contrato local 11/11; sigue `HOST_BRIDGE_NOT_VERIFIED` | Checkout autorizado de `/agente`, sus cuatro endpoints, token de servicio y resolver la divergencia 12/16 |
| C03 | `src/auth/jwt.ts` | Verificado con claves de fixture | Proyecto Supabase real (issuer, JWKS, claims) |
| C06 | `src/storage/pg.ts`, `src/storage/aggregates.ts` | **Verificado localmente**: RLS, durabilidad y vertical slices de atención y onboarding | `DATABASE_URL` de staging, repetir `db:verify`/`db:persistence`/`db:http`/`slices` allí; contactos CRUD, outbox y jobs siguen en memoria |

## Lo que sí está cerrado sin credenciales

- **C06**: 18/18 garantías SQL, 10/10 de persistencia, 13/13 a través del API HTTP y 20/20 de
  vertical slices (atención y onboarding) en PostgreSQL real y efímero, con reinicios del API
  (`npm run db:verify`, `db:persistence`, `db:http` y `slices`, job `database` de CI).
- **Instalación**: `npm run install:check` compila el paquete, lo instala en un proyecto host vacío
  y arranca el servidor desde `node_modules` (10/10). Ver
  [INSTALACION-AGENTE.md](INSTALACION-AGENTE.md); no sustituye la instalación real en `/agente`.
- **Contrato del puente**: `npm run bridge:contract` verifica el cliente `HttpHost` contra un
  stand-in local (11/11). El padre real no se ha llamado.
- **C11/C12/C31**: identidad, importación con staging y renovaciones, con tests propios.
- **C33**: portal abierto en Chromium real; C33 sigue `NOT_VERIFIED` solo por los flujos que
  exigirían sesión, lector de pantalla y móvil.

## Regla para el siguiente agente

No convertir ninguna fila de esta tabla en PASS por tener contrato escrito, test con transporte
falso o documentación del proveedor. PASS exige una llamada real con receipt, y esa llamada
necesita la credencial que aquí no existe.
