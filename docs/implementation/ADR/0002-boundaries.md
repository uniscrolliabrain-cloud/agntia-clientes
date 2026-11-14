# ADR 0002 · Fronteras entre operador, tenant, cliente atendido y principal

- **Estado**: aceptado; implementado en `src/auth/principal.ts`, `src/contracts/dto.ts`.

## Decisión

Cuatro entidades separadas y no convertibles entre sí:

1. `tenant_operator_p` — organización que presta el servicio.
2. `tenant_*` — cliente del SaaS (frontera de seguridad y contrato).
3. `CustomerOrganization` / `Contact` — empresas y personas atendidas dentro del tenant.
4. `Actor` — humano, agente o contacto de portal, con capacidades y scopes.

Nunca se deriva autorización de: email compartido, `user_metadata`, nombre del avatar,
`role: authenticated`, nombre visible del workspace remoto ni primer resultado de una búsqueda.

## Consecuencias

- Un contacto con sesión Supabase sin `ContactPortalGrant` no accede a nada (403).
- Un contacto con grant solo ve los `resourceScopes` concedidos (404 para el resto), aunque
  pertenezca a la misma empresa cliente.
- Un agente del operador necesita `DelegationMandate` con tenant objetivo distinto del origen.
- Las fusiones de identidad son propuestas revisadas, jamás automáticas.
