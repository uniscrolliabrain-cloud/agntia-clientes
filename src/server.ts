import { createServer } from "node:http";
import { buildContext } from "./app/context.ts";
import { createApp } from "./app/http.ts";
import { loadConfig } from "./config.ts";

/**
 * Arranque del esqueleto (CLI-C41). Sin Supabase configurado responde /healthz
 * pero toda ruta /v1 falla cerrada con 401.
 */
const config = loadConfig();
const ctx = buildContext({ config });
const app = createApp(ctx);

const server = createServer(async (req, res) => {
  const url = `http://${req.headers.host ?? `localhost:${config.port}`}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(","));
    else if (value !== undefined) headers.set(key, value);
  }
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
  const request = new Request(url, {
    method: req.method ?? "GET",
    headers,
    ...(body ? { body } : {}),
  });
  const response = await app.fetch(request);
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(Buffer.from(await response.arrayBuffer()));
});

async function readBody(req: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk as Buffer));
  return Buffer.concat(chunks).toString("utf8");
}

server.listen(config.port, "0.0.0.0", () => {
  // Sin secretos en el log de arranque.
  console.log(`agntia-clientes escuchando en :${config.port} (${config.env})`);
  console.log("estado: HOST_BRIDGE_NOT_VERIFIED · proveedores NOT_CONFIGURED · datos in_memory");
});
