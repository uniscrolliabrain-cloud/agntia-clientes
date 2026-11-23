# agntia-clientes

Diseño de una empresa SaaS especialista en relación con clientes, atención y customer success, compatible con `uniscrolliabrain-cloud/agente`. Entrega documental 2/9 · 11 de noviembre de 2026.

**Estado: SKELETON_IMPLEMENTED.** El diseño documental sigue siendo la fuente de verdad y ahora tiene un esqueleto de código ejecutable: 42 campañas implementadas con 114 tests locales en verde, 9 escenarios E2E A–I y dos vertical slices durables (atención y onboarding) verificadas con reinicios del API sobre PostgreSQL real. El paquete se instala y arranca en un host limpio (`npm run install:check`) y el puente `HostPort` tiene cliente HTTP probado contra su contrato (`npm run bridge:contract`). **No hay proveedores conectados, ni Supabase staging, ni instalación en `/agente`, ni despliegue.** Ver [informe de implementación](docs/release/IMPLEMENTATION-REPORT.md), [instalación en el padre](docs/release/INSTALACION-AGENTE.md) y [anexos por fase](docs/campaigns/reports/README.md).

El cliente podrá mantener una ficha de relación con fuentes, atender consultas en una bandeja multicanal, gestionar tickets y SLA, buscar conocimiento autorizado, revisar propuestas de respuesta, coordinar onboarding, ver riesgos de relación y recibir reportes. Un agente especialista, presente por visio con Anam, trabajará junto a humanos y agentes generalistas. Los agentes canónicos viven en `/agente`; aquí habrá twins vinculados y ejecución especializada bajo mandato. No se crea una segunda plantilla canónica.

Todos los modos son multitenant con JWT de **Supabase**, membresía verificada y aislamiento en API, base de datos, workers, búsqueda, archivos, realtime y exportaciones. Se permite atender clientes externos desde portal propio: no necesitan abrir AgntiaPro, pero el servicio conserva el vínculo canónico con sus agentes. Funciones de otros repos pueden duplicarse; el contrato de cada encargo fija quién puede producir cada efecto.

## Leer en este orden

1. [Producto y límites](docs/01-producto-y-limites.md).
2. [Investigación, papers y noticias](docs/02-investigacion-y-decisiones.md), [referentes](docs/03-referentes-y-brechas.md) y [repos/licencias](docs/04-repos-y-adaptadores.md).
3. [Arquitectura](docs/architecture/01-arquitectura.md), [Supabase y twins](docs/architecture/02-supabase-twins.md), [compatibilidad padre](docs/architecture/03-compatibilidad-agente.md).
4. [Contratos](docs/contracts/01-contratos.md), [runtime](docs/architecture/04-runtime-determinista.md), [seguridad y privacidad](docs/05-seguridad-privacidad.md).
5. [Campaña de 42 fases](docs/campaigns/README.md), [manifest estructurado](docs/campaigns/campaign.json) y [handoff](docs/release/HANDOFF.md).
6. [Informe al propietario](docs/release/INFORME-AL-OWNER.md), [aceptación](docs/release/PILOT-ACCEPTANCE.md) y [presupuestos](docs/08-presupuestos.md).

Primera vertical, ya activada localmente: dos empresas sintéticas → caso → propuesta con evidencia → aprobación humana → intent idempotente → envío a sandbox → receipt → resolución verificable → reporte. El tramo de Supabase staging y el binding de twin siguen pendientes de credenciales; el sandbox es local y lo declara (`sandbox_only`).

El diseño contempla Chatwoot como primer candidato de canal/bandeja, Twenty o Frappe CRM como CRM opcional, Frappe Helpdesk o Zammad como alternativas de tickets, y puertos propios para atender sin esos backends. No instalar todos por defecto. Un capability report y pruebas contra cada versión decidirán qué se habilita.

Ningún cambio en `/agente` está autorizado ni incluido. Su código se ha consultado solo como fuente de nombres, eventos, identidad y procedencia. Referencia: `54b8d5407a8576459448c4d059a877297d18ca7a`. La instalación está preparada y probada en un host limpio; ejecutarla en `/agente` requiere su checkout autorizado y su token de servicio.
