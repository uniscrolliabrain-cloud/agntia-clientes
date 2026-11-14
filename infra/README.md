# Infra de laboratorio

`docker-compose.yml` levanta un Postgres 16 para probar las migraciones y RLS.

**Estado: NOT_EXECUTED.** Este entorno no tiene Docker. No hay ningún contenedor en marcha ni
volumen de datos creado. El adaptador de repositorio usado por el código es en memoria
(ver `docs/implementation/ADR/0003-storage.md`).

## Procedimiento previsto (cuando haya Docker)

```bash
docker compose -f infra/docker-compose.yml up -d
psql "postgresql://agntia:local_only_change_me@localhost:5432/agntia_clientes" \
  -c "select relname, relrowsecurity from pg_class where relrowsecurity;"
```

Después: implementar `PgStore` con `set local app.tenant_id` por transacción, repetir los tests
de aislamiento y actualizar el anexo `C06` de `NOT_VERIFIED` a `PASS` con la salida real.

Sin credenciales reales en este directorio: la contraseña es de laboratorio y no debe reutilizarse.
