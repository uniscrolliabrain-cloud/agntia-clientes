/**
 * Datos de los 42 anexos de fase (CLI-C01…CLI-C42).
 * Cada entrada declara qué se entregó, qué se verificó de verdad, qué se desvió y qué queda.
 */
export interface PhaseAnnex {
  code: string;
  title: string;
  status: "PASS" | "BLOCKED" | "NOT_VERIFIED";
  objective: string;
  delivered: string[];
  verified: string[];
  deviations: string[];
  pending: string[];
}

export const PHASES_1: PhaseAnnex[] = [
  {
    code: "C01",
    title: "Baseline y perímetro de solo lectura",
    status: "PASS",
    objective: "Congelar estado propio, padre y fuentes antes de implementar.",
    delivered: [
      "package.json, tsconfig.json, .gitignore, .env.example",
      "docs/implementation/BASELINE.md con SHAs y matriz de herramientas",
    ],
    verified: ["`npx tsc --noEmit` sin errores", "`git ls-files` = 69 archivos de partida, 0 de código"],
    deviations: [
      "El corpus arrastra números pegados a palabras (\"de42 fases\", \"Secuencia1/42\"); se documenta, no se reescribe.",
      "pnpm no está instalado: se usa npm con package-lock.json (ADR 0001).",
    ],
    pending: ["Postgres/Docker no disponibles: gates de integración NOT_VERIFIED", "Sin acceso a proveedores externos"],
  },
  {
    code: "C02",
    title: "Modelo de dominio y autoridad",
    status: "PASS",
    objective: "Separar SaaS, tenants, clientes de cada pyme y principales.",
    delivered: [
      "src/contracts/dto.ts con 20+ DTOs tenant-scoped",
      "src/domain/authority.ts con AuthorityMap y ConflictRecord",
      "docs/implementation/ARCHITECTURE.md y ADR 0002",
    ],
    verified: ["test/tenancy-knowledge.test.ts: aislamiento y unicidad compuesta", "E2E B: contacto en dos empresas, scopes distintos"],
    deviations: ["`RelationshipFact` no llevaba `tenantId` en la tabla original; se añadió para poder aislarlo."],
    pending: ["Fusión de identidades con plan aprobado: no implementada (C11)"],
  },
  {
    code: "C03",
    title: "Autenticación Supabase y principal",
    status: "PASS",
    objective: "Resolver identidad y tenant desde prueba verificable, sin fallback.",
    delivered: [
      "src/auth/jwt.ts (HS256, RS256/ES256 con JWKS, iss/aud/exp/nbf, caché acotada)",
      "src/auth/principal.ts (membresía, capacidades por rol, ACL de recurso)",
      "src/auth/dev-token.ts limitado a desarrollo/test",
    ],
    verified: ["test/auth.test.ts: 9 casos", "API: 401 sin token, 403 tenant ajeno, 404 tenant desconocido"],
    deviations: [
      "La firma HS256 se comparaba en hex contra base64url del emisor: bug detectado y corregido en la verificación.",
      "`user_metadata` se ignoró por completo, como exige el diseño.",
    ],
    pending: ["Supabase real/JWKS en vivo: NOT_VERIFIED", "Rotación de claves probada solo con caché simulada"],
  },
  {
    code: "C04",
    title: "Twin y trazabilidad nativa",
    status: "PASS",
    objective: "Vincular el ejecutor local al agente canónico y preservar linaje.",
    delivered: [
      "src/domain/twins.ts (TwinBinding versionado, memoria scoped por binding)",
      "src/auth/delegation.ts (DelegationMandate firmado, origen≠objetivo, revocación)",
    ],
    verified: ["test/auth.test.ts C04: firma, caducidad, capacidad y cross-tenant", "E2E H: twin enlazado a revisión congelada"],
    deviations: [
      "La firma del mandato se calculaba incluyendo el propio campo de firma; se excluye para que sea verificable.",
      "Divergencia 12/16 del catálogo del padre: registrada, sin resolver (no se crean agentes aquí).",
    ],
    pending: ["Resolver índice default 12 vs catálogo base 16 antes de un binding productivo"],
  },
  {
    code: "C05",
    title: "DTOs y contratos runtime",
    status: "PASS",
    objective: "Establecer frontera tipada antes de conectar proveedores.",
    delivered: [
      "src/contracts/common.ts (dinero decimal, fechas con offset, IDs opacos)",
      "src/contracts/envelope.ts (Envelope v1, OperationResult discriminado)",
      "src/lib/ids.ts (JSON canónico, sha256, comparación en tiempo constante)",
    ],
    verified: ["test/contracts.test.ts: 8 casos", "Campos extra rechazados, estados inventados rechazados"],
    deviations: [
      "`ResolutionContract.kind` no tenía enum definido: se fijó `informational | change_required | goodwill`.",
      "Se añadieron alias de tipo con el mismo nombre que cada schema Zod para tipar DTOs.",
    ],
    pending: ["Generación de JSON Schema/OpenAPI publicada como archivo (solo tipos runtime)"],
  },
  {
    code: "C06",
    title: "Postgres, RLS y migraciones",
    status: "NOT_VERIFIED",
    objective: "Persistir entidades, relaciones, auditoría y colas sin fuga ni pérdida.",
    delivered: [
      "src/storage/repository.ts (TenantTable con scoping, unicidad compuesta y CAS)",
      "src/storage/memory.ts (store completo + audit + webhook receipts)",
      "src/storage/migrations/0001_schema.sql, 0002_rls.sql, 0003_indexes.sql",
    ],
    verified: ["test/tenancy-knowledge.test.ts: scoping, unicidad, CAS", "Migraciones escritas con FK compuestas y RLS por app.tenant_id"],
    deviations: ["No hay Postgres en el entorno: la verificación es del repositorio en memoria, no de RLS real."],
    pending: ["Ejecutar migraciones en Postgres real y probar roles/BYPASSRLS", "Implementar PgStore con `set local app.tenant_id`"],
  },
  {
    code: "C07",
    title: "Finalidades, preferencias y permisos de comunicación",
    status: "PASS",
    objective: "Crear ledger de tratamiento y supresión revalidable.",
    delivered: [
      "src/privacy/processing.ts (ProcessingBasis por finalidad, ConsentEvent append-only, supresión)",
      "Validación de base legal por finalidad (marketing exige consentimiento)",
    ],
    verified: ["test/privacy-budget.test.ts: 4 casos", "E2E F: supresión bloquea envío en cola"],
    deviations: ["Un grant sin `evidenceRef` se rechaza en código, aunque el DTO original lo permitía nulo."],
    pending: ["Revisión jurídica de textos, plazos y bases: responsable humano"],
  },
  {
    code: "C08",
    title: "Acuerdos, entitlements y encargos",
    status: "PASS",
    objective: "Materializar la frontera comercial y de responsabilidad del SaaS.",
    delivered: [
      "src/service/agreements.ts (ServiceAgreement, WorkOrder, entitlements)",
      "Seed de dos acuerdos sintéticos alpha/beta",
    ],
    verified: ["`/v1/clientes/me` devuelve entitlements", "WorkOrder solo se acepta si está entregado y en el mismo tenant"],
    deviations: ["No se implementó facturación: el servicio propone y el puerto financiero decide."],
    pending: ["UI de contratación y suspensiones revisadas"],
  },
  {
    code: "C09",
    title: "Registro de proveedores, OAuth y secretos",
    status: "PASS",
    objective: "Restringir endpoints y credenciales a configuración administrativa verificada.",
    delivered: [
      "src/integrations/registry.ts (Connection, endpointRef/secretRef, OAuth state+PKCE)",
      "src/integrations/egress.ts + dns.ts (allowlist, IP privada, DNS rebinding)",
      "src/integrations/transport.ts (sin redirects, timeout, tamaño máximo)",
    ],
    verified: ["test/integrations.test.ts: metadata 169.254.169.254, host ajeno, DNS privado", "Rotación/revocación degrada la conexión"],
    deviations: ["Secretos solo en memoria para desarrollo; no hay gestor externo conectado."],
    pending: ["OAuth real por proveedor y gestor de secretos de producción"],
  },
  {
    code: "C10",
    title: "Discovery y capacidades verificadas",
    status: "PASS",
    objective: "Habilitar cada operación solo según despliegue y permisos comprobados.",
    delivered: ["src/integrations/discovery.ts (estados documented/verified/unsupported/forbidden/unknown, report con hash)"],
    verified: ["test/integrations.test.ts: sin report → conflicto; scope ausente → forbidden"],
    deviations: ["Un probe con HTML o sin JSON se marca `unknown`, no healthy."],
    pending: ["Probes contra versiones reales (NOT_VERIFIED)"],
  },
  {
    code: "C11",
    title: "Directorio y resolución de identidad",
    status: "BLOCKED",
    objective: "Construir ficha de relación sin fusiones ni privilegios heurísticos.",
    delivered: [
      "Organizaciones, contactos, ChannelIdentity y relaciones en DTOs y fixtures",
      "ACL por recurso para contactos de portal",
    ],
    verified: ["E2E B: homónimos Ana en A y B sin merge", "E2E H: contacto en dos empresas con scopes distintos"],
    deviations: ["La propuesta de duplicado y el plan de merge (T04/T05) no se implementaron en este esqueleto."],
    pending: ["Merge autorizado con alias, versión y trazabilidad", "Field ACL explícito por campo"],
  },
  {
    code: "C12",
    title: "Importación, staging y sync",
    status: "BLOCKED",
    objective: "Importar datos con validación, procedencia y reconciliación.",
    delivered: ["Tabla `external_links` con unicidad por tenant/conexión/modelo", "ExternalLink DTO con sourceHash y mapperVersion"],
    verified: ["test/tenancy-knowledge.test.ts: unicidad compuesta y colisión entre conexiones"],
    deviations: ["No hay pipeline CSV/JSON de preview, aceptación por lotes ni cursores: no se simula."],
    pending: ["Preview con límites/encoding y protección de fórmulas", "Cursores estables con overlap y watermark tras commit"],
  },
];
