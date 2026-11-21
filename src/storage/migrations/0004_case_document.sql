-- CLI-C06 · Documento completo del caso para el API.
-- Las columnas proyectadas siguen siendo la fuente de indexación y del CAS
-- (`version`); `document` guarda el DTO completo para que el API reconstruya
-- exactamente lo que escribió, sin perder campos al evolucionar el contrato.
-- RLS no cambia: la política vive en la tabla `cases` (0002) y `app_api` ya
-- tiene privilegios de tabla, que cubren columnas nuevas.
alter table cases add column if not exists document jsonb not null default '{}'::jsonb;
