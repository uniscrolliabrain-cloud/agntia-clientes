import { Hono } from "hono";
import { forbidden, invalid, ServiceError } from "../lib/errors.ts";
import { isAllowedRoute } from "./client.ts";

/**
 * Proxy Hono (CLI-C34): allowlist exacta método/ruta, tamaño máximo y sin
 * credenciales en la URL. Un prefijo no habilita endpoints nuevos por accidente.
 */
export interface ProxyOptions {
  upstreamBaseUrl: string;
  serviceToken: () => Promise<string>;
  maxBodyBytes?: number;
  fetchImpl?: typeof fetch;
}

export function createProxy(options: ProxyOptions): Hono {
  const app = new Hono();
  const maxBytes = options.maxBodyBytes ?? 256_000;

  app.all("/proxy/*", async (c) => {
    const method = c.req.method;
    if (method !== "GET" && method !== "POST") throw forbidden("Método no permitido en proxy");
    const url = new URL(c.req.url);
    const path = url.pathname.replace(/^\/proxy/u, "");
    if (url.searchParams.has("url") || url.searchParams.has("endpoint")) {
      throw forbidden("El proxy no acepta URLs arbitrarias");
    }
    if (!isAllowedRoute(method, path)) throw forbidden(`Ruta fuera de allowlist: ${path}`);
    const bodyText = method === "POST" ? await c.req.text() : undefined;
    if (bodyText && Buffer.byteLength(bodyText, "utf8") > maxBytes) throw invalid("Body demasiado grande");

    const upstream = await (options.fetchImpl ?? fetch)(
      `${options.upstreamBaseUrl.replace(/\/$/u, "")}${path}${url.search}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${await options.serviceToken()}`,
          "Content-Type": "application/json",
          "x-correlation-id": c.req.header("x-correlation-id") ?? `corr_${crypto.randomUUID()}`,
          ...(c.req.header("x-tenant-id") ? { "x-tenant-id": c.req.header("x-tenant-id")! } : {}),
        },
        ...(bodyText ? { body: bodyText } : {}),
        redirect: "error",
      },
    );
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  });

  app.all("*", (c) => {
    if (c.req.path.startsWith("/proxy")) return c.notFound();
    return c.json({ error: { code: "not_found", message: "Solo /proxy/* está habilitado" } }, 404);
  });

  app.onError((error, c) => {
    if (error instanceof ServiceError) {
      return c.json({ error: { code: error.code, message: error.message } }, error.status as 403);
    }
    return c.json({ error: { code: "unavailable", message: "error interno" } }, 500);
  });

  return app;
}
