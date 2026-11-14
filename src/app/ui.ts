/**
 * Portal mínimo (CLI-C33). Esqueleto accesible ES/EN/FR, sin dependencias.
 * La autenticación real la resuelve Supabase en el cliente; estas páginas son
 * el marco visual, no una fuente de datos ni un permiso.
 */
const STYLE = `
:root { color-scheme: light dark; --fg:#111; --bg:#fff; --muted:#555; --line:#d0d0d0; --accent:#0b5fff; }
@media (prefers-color-scheme: dark) { :root { --fg:#f2f2f2; --bg:#111; --muted:#aaa; --line:#333; } }
* { box-sizing: border-box; }
body { margin:0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color:var(--fg); background:var(--bg); line-height:1.5; }
header { border-bottom:1px solid var(--line); padding:1rem; display:flex; gap:1rem; align-items:center; flex-wrap:wrap; }
main { padding:1rem; max-width:72rem; margin:0 auto; display:grid; gap:1rem; grid-template-columns: minmax(0,1fr); }
@media (min-width: 60rem) { main { grid-template-columns: minmax(0,2fr) minmax(18rem,1fr); } }
nav a { color:var(--accent); margin-right:.75rem; }
section, aside { border:1px solid var(--line); border-radius:.5rem; padding:1rem; }
h1 { font-size:1.25rem; margin:0; }
h2 { font-size:1.05rem; margin:0 0 .5rem; }
small, .muted { color:var(--muted); }
ul { padding-left:1.1rem; margin:.5rem 0; }
button { font:inherit; padding:.5rem .9rem; border-radius:.375rem; border:1px solid var(--line); background:var(--bg); color:var(--fg); }
button.primary { background:var(--accent); color:#fff; border-color:var(--accent); }
:focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
.badge { display:inline-block; border:1px solid var(--line); border-radius:999px; padding:.05rem .5rem; font-size:.8rem; }
`;

export function renderPortalHome(): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Agntia Clientes · Portal</title>
<style>${STYLE}</style>
</head>
<body>
<header>
  <h1>Agntia Clientes</h1>
  <nav aria-label="Secciones">
    <a href="/portal">Bandeja</a>
    <a href="/portal/cases/case_case_ana_1">Caso de ejemplo</a>
  </nav>
  <small class="muted">Esqueleto de portal · sin datos reales</small>
</header>
<main>
  <section aria-labelledby="inbox-title">
    <h2 id="inbox-title">Bandeja</h2>
    <p class="muted">Los casos se cargan desde <code>/v1/clientes/cases</code> con un JWT de Supabase. Esta página es el marco visual del portal.</p>
    <ul>
      <li><span class="badge">en curso</span> Alta de usuarios · Ana Ejemplo</li>
      <li><span class="badge">nuevo</span> Facturación · Luis Ejemplo</li>
    </ul>
  </section>
  <aside aria-labelledby="twin-title">
    <h2 id="twin-title">Asistente</h2>
    <p>La presencia por vídeo (Anam) explica entregables y evidencia. No firma, no aprueba y no recibe la API key.</p>
    <p><button class="primary" type="button" aria-describedby="twin-note">Abrir sesión (requiere Supabase)</button></p>
    <p id="twin-note" class="muted">Sin configuración de Anam el portal ofrece solo texto.</p>
  </aside>
</main>
</body>
</html>`;
}

export function renderCasePage(caseId: string): string {
  const safeCaseId = caseId.replace(/[<>&"']/gu, "");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Caso ${safeCaseId} · Agntia Clientes</title>
<style>${STYLE}</style>
</head>
<body>
<header>
  <h1>Caso ${safeCaseId}</h1>
  <nav aria-label="Secciones"><a href="/portal">Volver a la bandeja</a></nav>
</header>
<main>
  <section aria-labelledby="case-title">
    <h2 id="case-title">Resumen</h2>
    <p><span class="badge">propuesta pendiente de aprobación</span></p>
    <p>La respuesta propuesta se muestra con sus citas y debe aprobarse explícitamente. Aprobar y enviar no es lo mismo que resolver.</p>
    <h2>Citas</h2>
    <ul>
      <li>Alta de usuarios · v2 (vigente) — fragmento autorizado</li>
      <li class="muted">v1 retirada: no se cita</li>
    </ul>
    <h2>Acciones</h2>
    <form method="post" action="/v1/clientes/outbound-intents" aria-describedby="approve-note">
      <p><label>Aprobación vinculada al texto y destinatario exactos.</label></p>
      <p><button class="primary" type="submit">Aprobar y enviar</button></p>
    </form>
    <p id="approve-note" class="muted">Requiere sesión Supabase y capability <code>reply.approve</code>. Un cambio de texto, canal o adjunto invalida la aprobación.</p>
  </section>
  <aside aria-labelledby="evidence-title">
    <h2 id="evidence-title">Evidencia</h2>
    <ul>
      <li>Fuente: knowledge v2 · publicado</li>
      <li>Receipt del canal: pendiente</li>
      <li>Resolución verificada: pendiente</li>
    </ul>
  </aside>
</main>
</body>
</html>`;
}
