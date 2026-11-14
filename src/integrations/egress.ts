import { dnsLookupAddresses } from "./dns.ts";
import { forbidden, invalid } from "../lib/errors.ts";

/**
 * Egress controlado (CLI-C09/C39): allowlist de host, sin credenciales en URL,
 * sin IPs privadas/metadata y sin redirects. La resolución DNS se comprueba
 * para reducir DNS rebinding; un redirect del proveedor se rechaza en el cliente.
 */
export interface EgressPolicy {
  allowedHosts: readonly string[];
  allowHttpForLocalhost: boolean;
  allowedPorts: readonly number[];
}

export interface UrlCheckOptions {
  resolveDns?: (hostname: string) => Promise<readonly string[]>;
}

export const DEFAULT_EGRESS: EgressPolicy = {
  allowedHosts: [
    "chatwoot.example.com",
    "crm.example.com",
    "helpdesk.example.com",
    "api.resend.com",
    "graph.facebook.com",
    "api.anam.ai",
  ],
  allowHttpForLocalhost: true,
  allowedPorts: [443, 3000, 8080],
};

const PRIVATE_V4 = [
  /^10\./u,
  /^127\./u,
  /^169\.254\./u,
  /^172\.(1[6-9]|2\d|3[0-1])\./u,
  /^192\.168\./u,
  /^0\./u,
  /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\./u,
];

export function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized === "::" || normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  return PRIVATE_V4.some((pattern) => pattern.test(normalized));
}

export async function assertEgressAllowed(
  rawUrl: string,
  policy: EgressPolicy,
  options: UrlCheckOptions = {},
): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw invalid("URL inválida");
  }
  if (url.username || url.password) throw forbidden("Credenciales en URL no permitidas");
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(isLocalhost && policy.allowHttpForLocalhost)) {
    throw forbidden("Solo HTTPS (o HTTP en localhost de desarrollo)");
  }
  if (!policy.allowedHosts.includes(url.hostname) && !isLocalhost) {
    throw forbidden(`Host fuera de allowlist: ${url.hostname}`);
  }
  const port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
  if (!policy.allowedPorts.includes(port) && !(isLocalhost && port >= 1024)) {
    throw forbidden(`Puerto no permitido: ${port}`);
  }
  if (isPrivateAddress(url.hostname)) throw forbidden("Dirección privada o metadata");

  const resolver = options.resolveDns ?? dnsLookupAddresses;
  const addresses = await resolver(url.hostname);
  if (addresses.length === 0) throw forbidden("Host sin resolución DNS");
  for (const address of addresses) {
    if (isPrivateAddress(address)) throw forbidden("DNS apunta a red privada");
  }
  return url;
}
