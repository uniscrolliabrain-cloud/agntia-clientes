# Runtime determinista y efectos distribuidos

El LLM interpreta, resume, propone y explica. Un runtime convencional valida esquemas, permisos, estados, presupuesto, versión, aprobación y efecto. Ni el modelo pequeño, ni el supervisor, ni el avatar pueden otorgarse permisos, consultar otro tenant o aprobar su propia acción. Las reglas se implementarán como funciones versionadas y verificables, no como promesas dentro del prompt.

## Operación de atención

Ingreso autenticado o webhook verificado → resolver binding de canal/tenant → inbox dedup → validar/sanitizar → persistir hecho y audit → actualizar conversación/caso mediante FSM → contexto autorizado → propuesta → preview → verificación/approval → outbox → worker revalida → proveedor → receipt o outcome_unknown → reconciliación → actualización de caso. Cada flecha tiene transición/guard y evidencia. Una mutación local y su outbox se confirman en una transacción; la llamada remota no comparte esa transacción.

Ticket propuesto: new, triaged, assigned, in_progress, waiting_customer, waiting_internal, resolution_proposed, resolved, closed, reopened. Una respuesta enviada no mueve automáticamente a resolved. Un ResolutionContract define resultado esperado, fuentes de comprobación, acciones permitidas, estado protegido, criterio de aceptación y vencimiento. Algunos casos se resuelven con información; otros requieren prueba de cambio real. Cierre automático por silencio debe estar acordado y distinguirse de resultado verificado.

OutboundIntent: proposed, awaiting_approval, approved, queued, leased, dispatching, accepted, delivered, failed_definitive, outcome_unknown, reconciliation_required, cancelled. delivered solo si existe evidencia del canal; lectura y resolución son hechos distintos. Si no se puede distinguir un fallo previo al envío de un timeout posterior, conservar incertidumbre. No volver a mandar por cambiar de proveedor o de worker. Reclamar una lease con fencing no evita por sí mismo duplicados remotos.

## Aprobación vinculada

Preview puro no dispara writes remotos. Guarda payload canónico, destinatario/canal, recursos, derechos, costo máximo, revisión, policyVersion, hash y caducidad. El aprobador humano autenticado ve exactamente el contenido/adjuntos y alcance; el commit comprueba aprobación, hash y revisión. Cambiar mensaje, destinatario, adjunto, tenant o política invalida la aprobación. Una futura autoautorización de FAQ acotada requiere un mandato/política específico probado; no reutiliza una aprobación genérica «contesta al cliente».

## Fiabilidad

Inbox y outbox persistentes con claves tenant/provider/connection/externalEvent; operationKey durable y payloadHash; replay igual devuelve resultado, key con otro contenido da409. Cursores solo avanzan tras commit; lecturas paginadas usan criterio estable y overlap/reconciliación cuando hay cambios concurrentes. Un borrado remoto genera hecho/conflicto, no elimina historia silenciosamente. Conflicto de fuente revisada bloquea overwrite.

Resend documenta una ventana de deduplicación de24 horas (A07): el ledger local sobrevive a ella y no permite retry ilimitado fuera de plazo. Chatwoot u otro backend puede insertar un mensaje y enviarlo de forma asíncrona; hay que verificar ambos estados. WhatsApp no recibe una garantía inventada de exactly-once. Si un adaptador carece de búsqueda/reconciliación suficiente, bloquear retry automático después de resultado incierto y escalar a humano.

SLA se calcula con calendario IANA, horario/fiestas configurados, eventos y revisiones; no con fechas propuestas por LLM. Pausas y repriorización tienen motivos auditables. Jobs técnicos revalidan principal delegado, mandato, presupuesto y revocación. La rota diaria/semanal/mensual del equipo se gobierna en el padre; este servicio informa hechos y plazos reales sin fingir actividad.
