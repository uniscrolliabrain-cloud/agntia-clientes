# Doppler · variables, secretos y arranque

Preparado por el agente de este repositorio. **No se ha conectado Doppler ni se ha escrito
ningún valor**: aquí solo se declara qué existe, qué falta y cómo debe inyectarse.

## Variables que el código lee hoy

`src/config.ts` es la única puerta de configuración. Valores por defecto seguros: sin
credenciales el servicio arranca en `development` y falla cerrado (401) en las rutas privadas.

| Nombre | Ámbito | Entorno | Obligatoria | Descripción |
|---|---|---|---|---|
| `PORT` | servicio | todos | no (3000) | Puerto HTTP |
| `NODE_ENV` | servicio | todos | no | `production` desactiva `/dev/token` y `/dev/seed` |
| `SUPABASE_URL` | servicio | dev/stg/prd | sí | Proyecto Supabase del tenant de servicio |
| `SUPABASE_JWT_ISSUER` | servicio | todos | sí | `https://<ref>.supabase.co/auth/v1` |
| `SUPABASE_JWKS_URL` | servicio | todos | sí | JWKS para RS256/ES256 |
| `SUPABASE_JWT_SECRET` | servicio | solo dev | no | HS256 de pruebas; nunca en producción |
| `ANAM_API_KEY` | servicio | stg/prd | no | Sin clave: `503` con `fallback: text_only` |

Los secretos de proveedores (Chatwoot, Twenty, Frappe, Zammad, Resend, WhatsApp) **no** son
variables globales: se guardan por conexión y tenant en el `SecretStore`
(`src/integrations/registry.ts`), y el código solo maneja `secretRef`. En producción ese
`SecretStore` debe ser el gestor real, no el `InMemorySecretStore` de desarrollo.

## Convención recomendada en Doppler

- **Proyecto**: `agntia-clientes`.
- **Configs**: `dev`, `stg`, `prd` (nunca compartir valores entre ellas).
- **Secretos** (`prd`/`stg`): `SUPABASE_JWT_SECRET` ausente; `ANAM_API_KEY` solo si se ha
  firmado el contrato y verificado región/DPA.
- **Service tokens**: uno por proceso (`api`, `worker`, `jobs`) con permisos mínimos. Hoy el
  repositorio no despliega worker separado; el outbox corre en proceso.
- **Rotación**: `SUPABASE_JWT_SECRET` en dev cada 30 días; claves de proveedor al revocar la
  conexión (`ConnectionRegistry.revoke` incrementa `revocationVersion` y borra el secreto);
  `ANAM_API_KEY` cada 90 días o ante incidente.
- **Acceso**: lectura solo para el runtime; escritura para el owner y CI de despliegue. Sin
  acceso desde estaciones de trabajo a `prd`.

## Arranque seguro

```bash
# Doppler inyecta el entorno; el proceso no lee ficheros .env en producción
doppler run --config prd -- node src/server.ts
```

Reglas que el código ya aplica:

1. Sin `SUPABASE_*` válidos, `/v1/clientes/*` responde 401: no hay fallback a owner ni a
   tenant por defecto.
2. `/dev/token` y `/dev/seed` solo existen con `NODE_ENV !== "production"`.
3. Los logs redactan JWT, claves, DSN, emails y `Bearer` (`src/observability/metrics.ts`).
4. `/healthz` publica estado sin secretos: `bridge`, `providers`, `anam`, `database`.

## Pendiente antes de producción

- Respaldo del `SecretStore` real (hoy en memoria) y prueba de rotación sin caída.
- Definir `APP_ORIGIN` y CORS si el portal se sirve desde otro dominio.
- Revisar si `SUPABASE_JWT_SECRET` debe existir en `stg` para pruebas de firma simétrica.
