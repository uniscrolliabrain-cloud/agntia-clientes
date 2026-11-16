# Roadmap diferencial completo
Preservar CLI-C01..CLI-C42 como historial y **no declarar su código certificado**. Nuevas campañas C43–C57:
| ID | Capacidad | Dependencias | Gate |
|---|---|---|---|
| C43 | Postgres/RLS/tenancy | C01–C12 | DB roles reales |
| C44 | Canales/proveedores/receipts | C43 | sandbox real |
| C45 | Bridge versionado con agente | C43 | contrato cruzado |
| C46 | Relationship Evidence + Identity/Rights Graph | C43 | bitemporalidad/ACL |
| C47 | Resolution Contract + Commitment Ledger | C43,C46 | outcome real |
| C48 | Knowledge provenance + contradiction + gap | C43,C46 | ACL y citas |
| C49 | Conversation continuity, voz/avatar | C44,C45 | handoff y fallback |
| C50 | Journey Twin + Value Ledger | C46,C47 | procedencia |
| C51 | Health/churn/causal evaluation | C50 | incertidumbre |
| C52 | Economics Twin + Capacity Planner | C47,C50 | costes |
| C53 | Trust Repair + recurrence + incidentes | C47 | reparación |
| C54 | Advisor Office + WorkOrders + multiagente | C45,C47 | autoridad |
| C55 | Portal, cockpit, report factory, accesibilidad | C43,C47 | browser |
| C56 | Recovery, DLQ, backup, chaos, CI | C43,C44 | restore |
| C57 | Privacy Ops + intertenant privacy research | C43,C46 | DSR |
Orden recomendado: C43→C46→C47; C44 y C45 en paralelo; C48 y C56; C49–C55 y C57. C84 intertenant learning se mantiene investigación/bloqueado hasta evaluación legal.
## Trazabilidad
CLI01–CLI02, CLI07, CLI21–22, CLI33–34, CLI55, CLI75–76: verificar cobertura previa y reforzar C43/C46/C47/C48/C55. CLI03–10→C46/C57; CLI11–20→C44/C49; CLI23–32→C47/C53; CLI35–42→C48; CLI43–54→C50/C51; CLI56–64→C51/C52; CLI65–74→C45/C54/C49; CLI77–84→C45/C55/C56/C57. Para cada CLI, Freebuff debe registrar ruta real, SHA, test y resultado antes de cerrar gate.
