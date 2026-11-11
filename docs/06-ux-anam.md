# UX del servicio y presencia Anam

Experiencia profesional, simple y utilizable en móvil: inbox/casos como centro, ficha de relación y evidencias a un gesto, chat/twin como columna derecha en escritorio y panel accesible en móvil. La persona puede editar propuestas, contrastar fuentes y aceptar entregables. No hay UI de Odoo, Chatwoot o CRM obligatoria para el cliente; sus consolas pueden existir para administración interna. No se ha construido ni probado la interfaz.

## Superficies previstas

Owner del tenant: resumen de casos, SLA, problemas de calidad, contactos, permisos, costes y trabajo efectivamente realizado. Operador/humano: bandeja con tareas prioritarias, borrador, citas, diff, aprobación y estado de envío. Contacto externo: solo sus casos/documentos compartidos y permisos verificados, sin acceso al dashboard interno. La misma persona puede tener varios roles; cambio de tenant explícito y estado visible. Se vacía/revalida contexto al cambiar para evitar que la caché conserve datos anteriores.

La ficha de caso separa mensaje del cliente, notas internas, evidencia y respuesta que saldrá. Botón «proponer respuesta» no envía; «aprobar y enviar» muestra texto final, receptor, canal, adjuntos, costo y caducidad. Doble click o refresco repite la misma operación. Si el resultado es incierto, la UI lo explica y ofrece reconciliación/escalado; no un botón automático de reintentar. No mostrar accepted como delivered ni conversación cerrada como problema resuelto.

Timeline con actor/delegante/ejecutor, hechos, fuentes y fecha; los resúmenes LLM llevan enlace al original autorizado y señal de que son síntesis. Campos stale/conflict/unverified se muestran de forma clara. HealthScore incluye qué datos faltan y ventana de observación; nunca una etiqueta emocional del cliente ni certeza de churn.

## Anam

N01 documenta personas y opciones de pipeline, incluso usar componentes propios. Se elegirá la modalidad que preserve el runtime y autoridad canónicos del agente: el avatar puede ser presencia para un agente existente. No se presupone que Anam hospede o gobierne la identidad de negocio. El twin está ligado a persona/rol/runtime y tenant objetivo verificados, con configuración versionada y mandato. No se ha conectado SDK ni creado sesión.

Backend genera sesión y token efímero de Anam para el usuario Supabase autorizado. API key nunca sale al browser. token Anam, JWT Supabase y credencial social son distintos. La sesión limita caso/proyecto, tools, duración, concurrencia, presupuesto y retención. Los callbacks pasan por el mismo PEP; no se acepta tenant/URL/método arbitrario sugerido por voz. Renovación de sesión exige contexto aún vigente; revocación/cambio de tenant invalida contexto y no hereda documentos privados.

Una confirmación oral crea propuesta; la autorización sensible del piloto se confirma en UI autenticada con step-up cuando corresponda. No inferir firma de una voz parecida al owner. Informar de IA y permisos AV, permitir silencio/texto, subtítulos y corrección del transcript. No grabar por defecto hasta contar con configuración y base aprobadas. Redactar datos antes de persistir/modelar según política.

## Accesibilidad y aceptación

Objetivo de diseño WCAG2.2 AA, no certificación actual: teclado, foco, lectores, contraste, áreas táctiles, estados asíncronos anunciados y reduced motion. ES/EN/FR deben probarse con nombres/direcciones y términos propios; traducir el UI no valida un modelo en francés. Móvil soporta lectura, edición y aprobación sin depender de hover. Pruebas futuras: cambio de tenant en dos pestañas, reconexión AV, aprobación invalidada durante edición, conexión lenta, lector de pantalla y fallback por presupuesto agotado.
