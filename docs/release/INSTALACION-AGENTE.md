# Instalación en `/agente` · paquete, puente y rollback

Estado: **instalación verificada en un host limpio (10/10)** y **puente verificado contra el
contrato (11/11)**. El repo `/agente` real **no está montado en este entorno**, así que aquí no se
ha instalado nada ni se ha modificado su código. Su wiring sigue en `HOST_BRIDGE_NOT_VERIFIED`
hasta que exista una llamada real con su token.

## Por qué esto es instalable ahora

Node no ejecuta TypeScript dentro de `node_modules`
(`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`). El repo se ejecutaba solo desde su propio árbol,
así que copiarlo a otro repo no habría arrancado. Por eso el paquete compila a JS ESM:

```bash
npm ci
npm run build          # dist/src/*.js + migraciones .sql copiadas
npm pack               # agntia-clientes-0.1.0.tgz (prepack ejecuta el build)
npm run install:check  # 10/10: instala el tarball en un proyecto vacío y arranca desde node_modules
npm run bridge:contract # 11/11: contrato HostPort contra un stand-in local, no contra /agente
```

El artefacto contiene `dist/src` (servidor, puente, SDK), las cinco migraciones y la documentación.
No contiene tests, artefactos, `.env` ni `node_modules`. `pg`, `hono` y `zod` son dependencias de
runtime; el servidor importa `pg` al arrancar.

## Instalación en el repo padre

Requisitos: Node ≥ 22.6 en el host, PostgreSQL/Supabase accesible y el checkout de `/agente`
autorizado. Ningún paso escribe en `/agente` salvo el `npm install` de su propio manifiesto.

```bash
# 1. Construir el artefacto en agntia-clientes
cd agntia-clientes && npm ci && npm pack

# 2. En /agente: instalar el tarball (o "file:../agntia-clientes" en desarrollo)
cd ../agente
npm install ../agntia-clientes/agntia-clientes-0.1.0.tgz

# 3. Aplicar las migraciones en orden, como rol owner, antes de arrancar el API
for f in node_modules/agntia-clientes/dist/src/storage/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
# Después, crear el rol de login y conceder app_api (nunca owner ni BYPASSRLS):
#   create role app_login login; grant app_api to app_login;

# 4. Arrancar el servicio con su entorno (Doppler o el gestor del host)
PORT=3100 \
NODE_ENV=production \
SUPABASE_ISSUER="https://<ref>.supabase.co/auth/v1" \
SUPABASE_JWKS_URL="https://<ref>.supabase.co/auth/v1/.well-known/jwks.json" \
DATABASE_URL="postgres://app_login:<secreto>@<host>:5432/postgres" \
AGENTE_BASE_URL="https://agente.internal" \
AGENTE_SERVICE_TOKEN="<token-de-servicio>" \
node node_modules/agntia-clientes/dist/src/server.js
```

Sin `SUPABASE_ISSUER` + JWKS las rutas `/v1` fallan cerradas (401). Sin `DATABASE_URL` los stores
quedan en memoria y `/healthz` lo declara (`case_store: "memory"`). Con `DATABASE_URL` inaccesible
el arranque aborta con código 1: no se degrada en silencio.

`/healthz` publica `case_store`, `proposal_store`, `approval_store`, `intent_store`, `plan_store`,
`host_bridge` y `database`, sin URL ni credenciales.

## Contrato que el padre debe implementar

El servicio usa `HttpHost` (`agntia-clientes/bridge`) contra `AGENTE_BASE_URL`. Todas las llamadas
son `POST` con `Authorization: Bearer <AGENTE_SERVICE_TOKEN>` e `Idempotency-Key` de 64 hex
derivada del payload. El token no viaja nunca en la URL ni en el cuerpo.

| Ruta | Cuerpo | Respuesta 2xx | Semántica |
|---|---|---|---|
| `/internal/host/principal` | `{subjectRef}` | `{actorId, tenantId}` | Resolver principal verificado. 404 → `null`, no se inventa tenant |
| `/internal/host/approvals` | `{proposalRef, payloadHash}` | `{approvalRef}` | Aprobación ligada al hash exacto |
| `/internal/host/tasks` | `{assignedBy, assignedTo, evidenceRefs}` | `{taskId}` | Tarea con evidencia; sin `taskId` se declara `upstream_invalid` |
| `/internal/host/events` | `{event}` (`SystemEvent` v1) | `{accepted}` | Hecho confirmado; replay deduplicado por el padre |

Reglas del cliente, ya probadas:

- 401/403 → `forbidden`; 409 → `conflict`; otros estados → `unavailable`; JSON inválido →
  `upstream_invalid`; fallo de red → `unavailable` sin propagar URL ni token.
- Sin `AGENTE_BASE_URL` o token, falla cerrado con `not_configured` y **no hace ninguna petición**.
- Proyección conservadora, solo tres equivalencias: `clientes.handoff.required → ticket.escalated`,
  `clientes.case.changed + assignedTo → ticket.assigned`,
  `clientes.case.changed + verifiedResolution=true → ticket.resolved`.
  `clientes.message.delivered` **no** se proyecta: entregar no cierra una conversación.

El padre no debe leer `tenantId` del cuerpo como autoridad: el actor y su tenant los resuelve él a
partir del token de servicio y el `subjectRef`; el servicio solo cruza ese resultado con su propio
principal. Un token de servicio no eleva roles.

## Qué falta del lado del padre (no se puede cerrar aquí)

1. Implementar las cuatro rutas y emitir un token de servicio por proceso.
2. Congelar la revisión del catálogo de personas: la divergencia 12/16 sigue abierta y bloquea un
   binding productivo.
3. Decidir si el padre emite `traceparent`; hasta entonces el `traceId` se deriva localmente.
4. Aprobar el mapping de eventos y la versión del envelope nativo.
5. Autorizar el checkout de `/agente` en un entorno con su CI para ejecutar la instalación real y
   una llamada de humo con su token.

## Rollback

- En `/agente`: `npm uninstall agntia-clientes` y retirar las variables `AGENTE_*`. El paquete no
  escribe archivos del host fuera de `node_modules`.
- Datos: las migraciones solo añaden columnas/tabla (`0005`). No hay `DROP` ni `DELETE`. Para
  revertir el código basta con volver al commit anterior; los datos de los agregados quedan
  inertes hasta que se decida borrarlos.
- En este repo: `HOST_BRIDGE_STATUS` sigue siendo `HOST_BRIDGE_NOT_VERIFIED`; quitar la emisión de
  eventos deja el resto de capacidades intacto.

## Evidencia que respalda esta guía

| Comprobación | Comando | Resultado |
|---|---|---|
| Paquete instalable y arranque desde `node_modules` | `npm run install:check` | 10/10 |
| Contrato del puente (principal, aprobación, tarea, evento, 401, timeout) | `npm run bridge:contract` | 11/11 |
| Vertical slices durables con reinicios | `npm run slices` | 20/20 |
| API + PostgreSQL entre reinicios (casos) | `npm run db:http` | 13/13 |

Ninguna de estas pruebas llama a `/agente` ni a un proveedor externo. Un PASS local no convierte
`HOST_BRIDGE_NOT_VERIFIED` en integración verificada.
