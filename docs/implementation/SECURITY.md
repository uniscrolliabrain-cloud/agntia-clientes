# Seguridad, privacidad y modelo de amenazas

## Identidad y autorización (implementado)

- JWT de Supabase obligatorio en todas las rutas `/v1/*`. Sin `Bearer` → 401.
- Algoritmo permitido fijado por servidor (`HS256` en fixtures; `RS256`/`ES256` con JWKS).
- Se verifican firma, `exp`, `nbf`, `iat`, `iss`, `aud` con tolerancia acotada.
- `user_metadata` **nunca** concede autoridad: el actor sale de `sub` + membresía provisionada.
- `role: "authenticated"` no implica owner; las capacidades se derivan del rol de servidor.
- Tenant del token debe coincidir con una membresía; si no, 403. `x-tenant-id` sin membresía
  responde 404 para no confirmar existencia de otro tenant.
- Portal de contacto: solo `resourceScopes` compartidos; otro caso de la misma empresa → 404.
- Mutaciones con `Origin` de otro host → 403.

## Aislamiento

- Repositorio `TenantTable` scoped: un `id` de otro tenant devuelve `null`.
- FKs compuestas `(tenant_id, id)` en las migraciones SQL; RLS por `app.tenant_id` por transacción.
- `service_role`/`BYPASSRLS` no se consideran aislamiento: el PEP valida siempre.
- Búsqueda de conocimiento filtra por tenant y ACL **antes** y **después** del scoring.
- Cachés, vectores y memoria del twin están scoped por tenant/binding.

## Aprobaciones y efectos

- Aprobación ligada a `proposalHash`, `recipientHash`, `channelHash`, `attachmentsHash`,
  `expectedVersion`, `policyVersion`, `expiresAt` y `revocationVersion`.
- Separación de funciones: el proponente no firma su propia aprobación; un agente no aprueba.
- Cualquier cambio material (texto, destinatario, canal, adjunto, política, versión de caso)
  invalida la aprobación con 409.
- Handoff humano pausa la autonomía; el worker revalida antes de enviar.
- Reintento tras incertidumbre: prohibido sin reconciliación con evidencia remota.

## Datos no confiables

- Webhooks: HMAC sobre `timestamp.body`, tolerancia 300 s, dedup por
  `tenant:connection:event`, tamaño máximo y `Content-Type` JSON.
- Adjuntos: allowlist MIME por *magic bytes*, límite de tamaño, cuarentena, neutralización de
  fórmulas CSV, bloqueo de HTML activo y de rutas con `..`.
- Instrucciones en tickets, artículos o adjuntos se tratan como datos: no cambian policy,
  tenant, destinatario ni catálogo de tools.

## Secretos y logs

- `redactText` elimina JWT, claves `sk_/pk_/rk_`, DSN, emails y `Bearer` en mensajes.
- Campos con nombre `token/secret/password/key/authorization` se redactan al serializar.
- Test de centinelas: `StructuredLogger.containsSentinels()` debe ser `false`.
- `sites_set_secret`/`.env` no contienen valores reales; `.env.example` está vacío de secretos.

## Modelo de amenazas (estado real)

| Amenaza | Barrera implementada | Evidencia |
|---|---|---|
| BOLA / cross-tenant | scoped store, 404 sin metadatos, RLS SQL | tests `tenancy`, `api`, E2E B |
| Suplantación de contacto | binding verificado + grant explícito | E2E H |
| Prompt injection | contenido como evidencia, tools nominadas | `judge`, tests de inbox |
| Fuga en búsqueda | ACL antes/después | test `RAG` |
| Doble envío | ledger `operationKey` + `payloadHash`, sin retry tras timeout | E2E C |
| SSRF / adjuntos | allowlist + magic bytes + cuarentena | tests de egress/attachments |
| Elevación por twin | mandato firmado, caducidad, revocación | test C04 |
| Fuga de secretos en logs | redacción + `containsSentinels` | test C36 |

## Privacidad operativa

- `ProcessingBasis` por finalidad; `av_recording` no autoriza entrenamiento ni marketing.
- `ConsentEvent` append-only con estado derivado; retirada bloquea envíos en cola.
- Lista de supresión por tenant + dirección.
- `PrivacyRequest`: recibida → verificada → aprobada → ejecutada, con preview que elimina
  `third_party:*`; bloqueo legal impide supresión y obliga a restricción.
- Retención declarada por objeto; sin regla no se inventa plazo.

## Límites declarados

No se ha ejecutado un pentest, ni RLS real, ni pruebas con proveedores, ni revisión legal. Este
documento describe controles del esqueleto, no certifica cumplimiento.
