# Supabase, aislamiento y twins

Regla expresa del propietario para los nueve diseños: Supabase JWT en todos los modos; agentes canónicos en `/agente`, twins vinculados en cada SaaS; compatibilidad de nombres y trazabilidad leída del padre. Este repo no modifica aquel.

## Principal y tenant

Verificar JWT contra proyecto/issuer/audience permitidos en configuración de servidor, firma y algoritmo, exp/nbf, rotación y caché acotada de JWKS. No seleccionar host de claves desde un token no verificado. Preferir claves asimétricas; una configuración legacy requiere estrategia explícita de verificación Supabase y no repartir secretos de firma. Sin claves válidas no hay acceso. Consultar S01/S02.

La frontera conserva JWT `sub`, `tenant_id`, `app_metadata.tenant_id`, y contexto `tenantId`. Contrastar el claim con membresía, suspensión y scope de recurso. `role: authenticated` es categoría técnica, no owner. `user_metadata` editable no concede autorización. La API del servicio nunca acepta actorId/tenantId/capability escritos por un LLM como prueba. Cada request resuelve Actor y un scope propio; cada job reconstruye y revalida el suyo. AsyncLocalStorage no persiste identidad en una cola.

El código padre observado contempla fallback user_metadata y materialización de primera membresía; esta entrega no afirma haberlos cambiado. El middleware exige aprovisionamiento/membresía confiable y no reutiliza esos caminos como permiso. Si hace falta modificar el padre para integrar el contrato, se documentará el patch y se pedirá autorización en otra tarea. Nunca recurrir a default o owner ante un fallo.

Los portales distinguen owner/operador de tenant, colaborador interno y contacto externo autorizado. Las ACL por registro/campo limitan el acceso aunque el usuario pertenezca al tenant. La unión entre Supabase sub y Contact exige prueba de servidor y aceptación/invitación verificada; no usar correo entrante como login.

## TwinBinding propuesto

Conservar `Actor.kind`, `id`, `tenantId`, `roleId`, `runtimeId`, `personaId?`, `kernelTurnId?` donde apliquen. AgentActor.id se vincula a runtimeId; una persona/rol puede tener distintas ejecuciones. TwinBinding nuevo del servicio referencia esos identificadores, instancia local, revisión canónica, tenant objetivo, mandato, capacidades, presupuesto, vigencia y revocación. No presentar twinId como un campo ya existente en `/agente`.

El catálogo real vive en `clientes/`. El índice default enumera12 y el catálogo base16; documentar la divergencia, no inventar12 runtimes activos ni copiar las memorias entre tenants. El twin puede razonar localmente dentro de un mandato válido; no hace falta una consulta remota por cada palabra. Al expirar/revocarse el mandato se bloquean nuevos efectos, y el servicio conserva estado/receipt para recuperación. Personalidad y configuración local especializadas se versionan sin suplantar la autoridad canónica.

Una petición de usuario autenticado puede originar ejecución de agente con credencial de servicio privada y mandato verificable. No falsificar un JWT humano ni guardar su access token indefinidamente. En delegación entre tenants se conserva el origen del Actor y el ámbito objetivo explícito; un cambio de tenant nunca se disimula como pertenencia del agente al cliente.

## Defensa por capas

RLS con política USING/WITH CHECK donde corresponda, relaciones/FKs por tenant, validación del rol efectivo de workers y prueba de roles propietarios/BYPASSRLS. No confiar en RLS al usar service_role sin PEP. Storage, Realtime, caché, vectores, búsquedas, reportes, URLs firmadas y exports tienen el mismo aislamiento. Las invitaciones y shares son explícitos, caducables y revocables. Logs y métricas minimizan identificación; soporte operador usa acceso excepcional auditado, no bypass invisible.

Escenarios obligatorios: JWT correcto de B consultando A; claim manipulado en user_metadata; token de otro proyecto; revocación antes de ejecutar job; contacto que intenta acceder a caso de compañero; twin sin mandato; cache o búsqueda con coincidencias de otro tenant. Están planificados, no ejecutados.
