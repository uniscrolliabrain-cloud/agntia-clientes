import { notConfigured } from "./lib/errors.ts";

/**
 * Configuración de servidor (CLI-C01/C03). Falla cerrada: sin Supabase no hay API.
 * Ningún valor de secreto se imprime ni se devuelve en diagnósticos.
 */
export interface AppConfig {
  env: "development" | "test" | "staging" | "production";
  port: number;
  supabase: {
    issuer: string | null;
    audience: string;
    jwksUrl: string | null;
    hmacSecret: string | null;
    projectRef: string | null;
  };
  features: {
    chatwoot: boolean;
    twenty: boolean;
    frappe: boolean;
    zammad: boolean;
    email: boolean;
    whatsapp: boolean;
    anam: boolean;
  };
  anam: { baseUrl: string; apiKeyConfigured: boolean };
  databaseUrl: string | null;
  budget: { liteEur: number };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const runtimeEnv = (env.NODE_ENV ?? "development") as AppConfig["env"];
  return {
    env: runtimeEnv,
    port: Number(env.PORT ?? 3000),
    supabase: {
      issuer: env.SUPABASE_ISSUER ?? null,
      audience: env.SUPABASE_AUDIENCE ?? "authenticated",
      jwksUrl: env.SUPABASE_JWKS_URL ?? null,
      hmacSecret: env.SUPABASE_JWT_SECRET ?? null,
      projectRef: env.SUPABASE_PROJECT_REF ?? null,
    },
    features: {
      chatwoot: env.CHATWOOT_ENABLED === "true",
      twenty: env.TWENTY_ENABLED === "true",
      frappe: env.FRAPPE_ENABLED === "true",
      zammad: env.ZAMMAD_ENABLED === "true",
      email: env.EMAIL_ENABLED === "true",
      whatsapp: env.WHATSAPP_ENABLED === "true",
      anam: env.ANAM_ENABLED === "true",
    },
    anam: {
      baseUrl: env.ANAM_BASE_URL ?? "https://api.anam.ai",
      apiKeyConfigured: Boolean(env.ANAM_API_KEY),
    },
    databaseUrl: env.DATABASE_URL || null,
    budget: { liteEur: Number(env.BUDGET_LITE_EUR ?? 30) },
  };
}

export function assertAuthConfigured(config: AppConfig): void {
  if (!config.supabase.issuer) throw notConfigured("SUPABASE_ISSUER no configurado");
  if (!config.supabase.jwksUrl && !config.supabase.hmacSecret) {
    throw notConfigured("Sin JWKS ni secreto HS256: verificación imposible");
  }
  if (config.supabase.jwksUrl && config.supabase.hmacSecret && config.env === "production") {
    throw notConfigured("Producción no admite HS256 junto a JWKS");
  }
}
