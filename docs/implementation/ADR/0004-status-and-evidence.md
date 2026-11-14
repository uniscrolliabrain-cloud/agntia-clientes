# ADR 0004 · Estados honestos y evidencia por fase

- **Estado**: aceptado.

## Decisión

- Cada fase tiene un anexo en `docs/campaigns/reports/Cxx.md` con: objetivo, artefactos
  entregados, verificación real, desviaciones encontradas y pendientes.
- Los estados posibles son `PASS`, `BLOCKED` y `NOT_VERIFIED`; un mock **no** convierte un gate
  de proveedor en PASS.
- El manifiesto conserva sus conteos originales (42/294/84) y añade campos nuevos
  (`skeleton_status`, `annex`) sin reescribir los históricos.
- No se declara paridad con referentes, certificación, benchmark reproducido ni cumplimiento
  legal universal.

## Consecuencias

- `docs/release/IMPLEMENTATION-REPORT.md` distingue lo ejecutado de lo diseñado.
- Un lector puede reproducir el estado con `npm run verify` y comparar con los anexos.
- Cualquier afirmación futura de capacidad debe enlazar evidencia ejecutada.
