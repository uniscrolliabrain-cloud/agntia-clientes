/** Tiempo determinista e inyectable (CLI-C23). Nunca fechas propuestas por un LLM. */

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

export function fixedClock(iso: string): Clock {
  const instant = new Date(iso);
  return { now: () => new Date(instant.getTime()) };
}

export function nowIso(clock: Clock = systemClock): string {
  return clock.now().toISOString();
}

export function parseInstant(iso: string): number {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new TypeError(`Fecha inválida: ${iso}`);
  return ms;
}

export function isoPlusMinutes(iso: string, minutes: number): string {
  return new Date(parseInstant(iso) + minutes * 60_000).toISOString();
}

/** Extrae la hora local (0-23) y el día ISO en una zona IANA. */
export function zonedParts(instant: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(instant).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour === "24" ? "0" : parts.hour),
    minute: Number(parts.minute),
    weekday: parts.weekday ?? "",
  };
}
