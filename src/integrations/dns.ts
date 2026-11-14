import { lookup } from "node:dns/promises";

/** Resolución DNS inyectable: evita falsos positivos en tests y permite dobles. */
export async function dnsLookupAddresses(hostname: string): Promise<readonly string[]> {
  try {
    const records = await lookup(hostname, { all: true, verbatim: true });
    return records.map((record) => record.address);
  } catch {
    return [];
  }
}

export async function noNetworkResolver(): Promise<readonly string[]> {
  throw new Error("resolución DNS deshabilitada en este entorno");
}
