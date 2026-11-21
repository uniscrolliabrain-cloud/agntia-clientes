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
| C35 | `src/bridge/host.ts` | `HOST_BRIDGE_NOT_VERIFIED` | Autorización explícita para tocar `/agente` y resolver la divergencia 12/16 |
| C03 | `src/auth/jwt.ts` | Verificado con claves de fixture | Proyecto Supabase real (issuer, JWKS, claims) |
| C06 | `src/storage/pg.ts` | **Verificado en PostgreSQL 18.7 local**, incluida durabilidad tras reinicio | `DATABASE_URL` de staging, repetir `npm run db:verify` y `npm run db:persistence` allí, y conectar el API |

## Lo que sí está cerrado sin credenciales

- **C06**: 18/18 garantías SQL y 10/10 de persistencia en un PostgreSQL real y efímero
  (`npm run db:verify` y `npm run db:persistence`, job `database` de CI).
- **C11/C12/C31**: identidad, importación con staging y renovaciones, con tests propios.
- **C33**: portal abierto en Chromium real; C33 sigue `NOT_VERIFIED` solo por los flujos que
  exigirían sesión, lector de pantalla y móvil.

## Regla para el siguiente agente

No convertir ninguna fila de esta tabla en PASS por tener contrato escrito, test con transporte
falso o documentación del proveedor. PASS exige una llamada real con receipt, y esa llamada
necesita la credencial que aquí no existe.
