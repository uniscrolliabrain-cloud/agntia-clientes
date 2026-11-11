# Seguridad, privacidad y requisitos jurídicos

Diseño de controles, no dictamen de cumplimiento. Fuentes oficiales L01 RGPD, L02 AI Act, L03 LSSI. La IA implementadora debe revalidar texto aplicable, fechas, finalidad y rol del operador antes del piloto. No etiquetar todo soporte como alto riesgo ni afirmar que por usar un LLM todo está exento.

RGPD exige una base y finalidad para cada tratamiento, minimización y conservación limitada; contempla derechos, obligaciones de responsables/encargados, seguridad y transferencias. El artículo22 trata decisiones exclusivamente automatizadas con efectos jurídicos o similares significativos. AI Act requiere analizar uso/rol y obligaciones aplicables, incluida transparencia al interactuar con IA; no basta una etiqueta genérica. LSSI artículo21 limita comunicaciones comerciales electrónicas y regula una excepción condicionada por relación contractual previa; no convierte un ticket de soporte en permiso de marketing. Estas son síntesis selectivas, no revisión jurídica completa.

## Controles propios propuestos

Registrar purpose y ProcessingBasis por flujo; no marcar consent=true para todo. Un consentimiento de grabación no autoriza entrenamiento de modelos o campañas comerciales. Mantener retiradas, preferencias, listas de supresión y pruebas mínimas; revalidarlas inmediatamente antes de un envío. Distinguir comunicación operacional solicitada de promoción. Renovación, upsell o encuesta con contenido promocional requiere clasificación/permiso apropiado, no eludirlo llamándolo «atención».

Portales con Supabase JWT, memberships verificadas y ACL por recurso/campo. El backend no toma identidad del email From o texto de WhatsApp. Invitar un contacto no concede acceso al historial de toda su empresa. El acceso del operador a datos del tenant se limita por mandato y excepción auditada; no hay owner universal implícito. Firmas de webhook y mTLS/credencial de servicio cuando proceda se suman al control de tenant; no lo reemplazan.

Cifrado en tránsito y almacenamiento, secretos externos, rotación y logs estructurados minimizados. Adjuntos con allowlist de tipos/tamaño, MIME real, descarga backend controlada, antivirus configurable, cuarentena y contenido sanitizado. HTML no ejecutable, enlaces sin previews autenticadas automáticas, protección CSV formula injection. Archivos pueden contener prompt injection: se delimitan como evidencia y nunca alteran system/tools/policy. Evitar copiar datos sensibles al contexto LLM si no son necesarios.

RAG por tenant y ACL de documento/chunk, filtrado antes de recuperar y antes de responder; no basta añadir tenant al prompt. Caches y embeddings privados también contienen información personal. Reindexación/borrado deben alcanzar chunks, resúmenes, copias de exportación y memoria del twin conforme a política. No entrenar pesos compartidos ni consolidar memorias entre clientes por defecto.

## Derechos y conservación

PrivacyRequest tiene identidad verificada, alcance, autoridad, plazo y responsable. Exportar datos del solicitante con revisión de terceros y permisos de entidad. La supresión se planifica considerando conservación legítima/legal, bloqueos, retenciones y justificantes; no borrar todo por una orden de chat. Diseñar backup expiry y procedimiento para no reintroducir datos borrados tras restore. Un log append-only no justifica almacenar PII para siempre: separar refs auditables de payload con retención y borrado controlados.

Anam: indicar que es IA, permisos de micrófono/cámara comprensibles, grabación desactivada por defecto hasta política aprobada, alternativas accesibles y retención por sesión. No deducir emociones, biometría o atributos sensibles del vídeo para priorizar clientes. No recoger tarjetas/contraseñas o documentación innecesaria en chat/visio. Contratos de subencargo, región y transferencias deben revisarse por proveedor real y configuración.

## Threat model inicial

| Amenaza | Barrera | Gate previsto |
|---|---|---|
| BOLA/cross-tenant | Principal, FK/RLS, ACL y scopes de job | Dos tenants con IDs válidos cruzados |
| Suplantación de contacto | Prueba por canal y vínculo Supabase verificable | Email compartido y remitente manipulado |
| Prompt injection | Datos sin autoridad y tools nominadas | Ticket/article pide exportar secretos |
| Fuga en búsqueda/Anam | Contexto mínimo y ACL previa/posterior | Otro tenant en retrieval/sesión reanudada |
| Doble envío | Intent ledger, autoridad única y reconciliación | Caída después de aceptación remota |
| SSRF/adjuntos | Endpoint allowlist, egress, no redirects y límites | Metadata IP, DNS change y MIME falso |
| Elevación por twin | Mandato firmado/verificado y revocación | Persona correcta sin capability |

Los escenarios son requisitos pendientes, no tests ejecutados ni certificaciones. Incidente potencial cross-tenant, secreto expuesto o envío duplicado detiene el rollout y activa conservación de evidencia minimizada.
