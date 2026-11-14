# CLI-C01 — Baseline y perímetro de solo lectura

**SCAFFOLD CONCEPTUAL / NOT_STARTED / NOT_EXECUTED.** [Original](../../campaigns/01-baseline-y-perimetro-de-solo-lectura.md). Leer [factory](../../factory/00-README.md), [pipeline](../../factory/01-PIPELINE.md), [léxico](../../factory/02-LEXICO.md), [ADTC](../../factory/03-TRACE-OBSERVABILITY.md), [producto Clientes](../../factory/04-PRODUCTO-CLIENTES.md) y contexto N−1/N/N+1.

## Objetivo
Congelar estado propio, padre y fuentes antes de implementar.

## Artefactos previstos
- `docs/baseline.md`
- `docs/host-diff.md`
- `docs/evidence/c01/`

## Invariante
No cambiar agente; ninguna capacidad documental cuenta como implementada.

## Dependencias y contrato
Dependencias: ninguna. Contrato obligatorio de diseño: `docs/architecture/02-supabase-twins.md`. Fuentes: H01.

## Tareas originales, sin granularizar
- **CLI-C01-T01:** Anotar SHA propio/padre, fecha, árbol, instrucciones aplicables y límites de acceso. **Aceptación prevista:** Registro reproducible con ausencia o existencia de checkout/credenciales explícita.
- **CLI-C01-T02:** Inventariar rutas, paquetes y tipos relevantes del padre, sin ejecutar mutaciones. **Aceptación prevista:** Mapa de nombres con ruta, blob y alcance de lectura; ningún símbolo supuesto como real.
- **CLI-C01-T03:** Cotejar catálogo base y personas default, diferenciando plantilla de ejecución. **Aceptación prevista:** Discrepancia12/16 registrada y resolución pendiente; no crear nuevos agentes para compensarla.
- **CLI-C01-T04:** Comprobar que la entrega inicial solo tiene documentación y registrar su manifest. **Aceptación prevista:** Conteos y hashes de archivos; no atribuir a baseline tests de producto inexistentes.
- **CLI-C01-T05:** Definir matriz de herramientas disponibles y bloqueos de Docker, red y sandbox. **Aceptación prevista:** Cada gate real tiene responsable, entorno requerido y estado NOT_VERIFIED si falta.
- **CLI-C01-T06:** Revalidar términos/licencias/fechas de las fuentes que se usarán en la primera vertical. **Aceptación prevista:** Fuente primaria y versión; incertidumbre no se transforma en permiso.
- **CLI-C01-T07:** Preparar bitácora de evidencia y checkpoint con riesgos preexistentes. **Aceptación prevista:** Informe distingue evidencia previa, verificación propia y cambios propuestos.

## Gates previstos, NO ejecutados
- CLI-C01-G01: Cambiar el padre entre dos lecturas: detener compatibilidad hasta cotejar SHAs.
- CLI-C01-G02: Intentar declarar un conector listo sin ejecutar nada: gate rechaza la afirmación.

## Después
Meta-auditoría conceptual libre → reconciliación → patchsets/handoffs por campaña para Freebuff, Codex y Arquitecto/Founder, pruebas y evidencias. Rollback previsto: Deshabilitar capacidad o feature flag de esta fase; conservar audit, links, intents y receipts; restaurar solo mediante plan probado. No borrar mensajes remotos para simular reversión.
