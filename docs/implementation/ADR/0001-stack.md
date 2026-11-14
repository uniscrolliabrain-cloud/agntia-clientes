# ADR 0001 · Stack y ejecución del esqueleto

- **Estado**: aceptado para el esqueleto.
- **Contexto**: la documentación propone TypeScript + Hono + pnpm + Postgres/Supabase. El entorno
  de ejecución tiene Node 26 y npm 11, sin pnpm instalado, sin Docker y sin proveedores.

## Decisión

- TypeScript estricto ejecutado por *type stripping* nativo de Node 26 (`node src/*.ts`), con
  `tsc --noEmit` como verificación de tipos. Sin bundler ni paso de build.
- **Hono** para HTTP y **Zod** para validación en frontera (coinciden con el diseño).
- **npm** en lugar de pnpm, porque el entorno no lo trae y añadir un gestor no aporta al
  esqueleto; el lockfile es `package-lock.json`. Reversible con `pnpm import`.
- Tests con `node:test` (sin Vitest/Jest): cero dependencias adicionales y salida estándar.

## Consecuencias

- Positivas: arranque inmediato, sin toolchain, tests rápidos, misma API que el diseño.
- Negativas: no hay build de producción ni resolución de rutas de bundler; migrar a pnpm/vitest
  es un cambio mecánico cuando el owner lo pida.
- Sin Postgres real: ver ADR 0003.
