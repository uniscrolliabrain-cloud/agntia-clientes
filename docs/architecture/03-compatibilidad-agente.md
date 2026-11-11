# Compatibilidad con agente: código leído, padre intacto

Referencia observada `54b8d5407a8576459448c4d059a877297d18ca7a`. Árbol previamente obtenido sin truncar, más lectura selectiva de archivos por SHA. [Mapa de fuentes](../research/parent-source-map.json). No se ha auditado todo el repo, ejecutado su suite o modificado código/configuración allí. El mapa heredado de investigación de redes se amplía con rutas de negocio y canales relevantes; no se presume que todo el wiring esté desplegado.

| Ruta | Observado | Consecuencia de diseño |
|---|---|---|
| packages/domain/src/actor.ts | Actor humano/agente; runtimeId, roleId, personaId y kernelTurnId según tipo | Mapeo exacto, sin crear otra identidad canónica |
| packages/domain/src/jwt.ts y engine/auth/* | Claims Supabase, verificación y tenantClaimOf | Mantener nombres; endurecer frontera propia sin alterar padre |
| engine/actors/service.ts | Resuelve humano desde sub, usuario y memberships | No aceptar identity JSON ni inferir rol por authenticated |
| tenant-principal.ts, tenant-scope.ts, db-tenant.ts | Principal/scope de tenant y caminos legacy | Scope por operación y job, sin fallback default |
| packages/domain/src/business.ts | BusinessEntity/provenance, schemaVersion y version | Conservar source, actor, updatedAt, confidence opcional y control de versión |
| apps/server/src/business-routes.ts | Rutas Business Graph con contexto owner; actor/source aceptados en body | El bridge deriva actor de principal y no trata ese body como prueba de autoridad |
| packages/domain/src/agent.ts | Tareas, delegante/ejecutor, evidence, artefactos y outcome | assignedBy distinto de assignedTo; correlacionar tareas, no sustituir IDs |
| engine/events/types.ts | SystemEvent schemaVersion literal 1.0, emittedAt, owner y source | No enviar un envelope inventado como si fuera ya compatible |
| engine/assignments/adapters/approval-adapter.ts y authz/* | Puertos/controles de aprobación y escritura | Integrar por contrato probado, sin interpretar role=agent como permiso universal |
| integrations/src/meta-whatsapp.ts | Cliente real de salida limitado; timeout/5xx/429 quedan inciertos | No afirmar que WhatsApp es solo stub; evitar retry ciego y verificar versión |
| integrations/src/resend.ts | Cliente real de correo, Idempotency-Key opcional y ausencia de credencial explícita | Un canal puede tener dos emisores: elegir autoridad única por intent |
| clientes/default/personas/_index.json y clientes/_base/agentes.json | Índice12 y catálogo16 | Resolver catálogo/revisión antes del binding; configuración no demuestra ejecución |

La versión Graph por defecto observada en el cliente Meta es v21.0; no se adopta como recomendación vigente. El middleware deberá descubrir/fijar la versión autorizada del despliegue. La consulta de documentación actual de Meta devolvió429; esa verificación sigue pendiente. El código de los canales muestra semántica de resultados inciertos, pero no prueba sus credenciales, entrega real ni cobertura de todas las reglas del proveedor.

## Adaptación de contratos

Conservar owner como campo nativo cuando el puerto lo exija; no igualarlo automáticamente con tenantId, sub o actorId. Resolverlo en servidor y registrar el mapping. `requestId` y `correlationId` no son sinónimos obligatorios. La procedencia nativa conserva `{source, actor, updatedAt, confidence?}` y se complementa con referencias del servicio, revisión/mapeador/hash y evidenceRefs. La confianza LLM no es prueba documental.

El padre declara eventos ticket.created/assigned/resolved/escalated y conversation.opened/routed/closed, entre otros. Los eventos nuevos `clientes.*` serán dominio del middleware. Un puente futuro puede proyectar hechos confirmados a tipos existentes con `SystemEvent.schemaVersion: "1.0"`, id, tenantId, owner, emittedAt, source y correlación. El source debe corresponder a un kind permitido; no agregar un enum arbitrario. No emitir ticket.resolved al recibir un texto que solo promete resolver.

## Integración sin tocar padre

Se entregará SDK servidor y especificación del bridge dentro de este repo durante implementación autorizada. Esta entrega solo los diseña. Contratos, fixtures y patch propuesto pueden documentarse; el wiring, instalación, cambios de enums, claims o endpoints en `/agente` requieren otra autorización. Hasta que exista ese vínculo, declarar HOST_BRIDGE_NOT_VERIFIED y usar fixtures marcados. No crear un segundo runtime empresarial para ocultar la falta del puente.
