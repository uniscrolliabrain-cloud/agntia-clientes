import { invalid } from "../lib/errors.ts";
import { isoPlusMinutes, parseInstant, zonedParts } from "../lib/time.ts";

/**
 * SLA determinista (CLI-C23). Calendario IANA + horario + festivos + versión.
 * Nunca fechas inventadas por un modelo.
 */
export interface SlaCalendar {
  timeZone: string;
  /** Días laborables ISO: 1=lunes … 7=domingo. */
  workdays: readonly number[];
  startHour: number;
  endHour: number;
  holidays: readonly string[];
  tzdataVersion: string;
}

export interface SlaPolicy {
  id: string;
  version: string;
  calendar: SlaCalendar;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  pauseStates: readonly string[];
}

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

const STEP_MINUTES = 15;
const MAX_STEPS = 20_000;

export function isWorkingInstant(calendar: SlaCalendar, instant: Date): boolean {
  const parts = zonedParts(instant, calendar.timeZone);
  if (calendar.holidays.includes(parts.date)) return false;
  const weekday = WEEKDAY_INDEX[parts.weekday] ?? 0;
  if (!calendar.workdays.includes(weekday)) return false;
  const minutes = parts.hour * 60 + parts.minute;
  return minutes >= calendar.startHour * 60 && minutes < calendar.endHour * 60;
}

/**
 * Suma minutos de negocio. Avanza en pasos fijos y comprueba el calendario en la
 * zona IANA, de modo que los cambios de horario de verano quedan reproducibles.
 */
export function addBusinessMinutes(calendar: SlaCalendar, from: string, minutes: number): string {
  if (minutes < 0) throw invalid("minutos de SLA negativos");
  if (minutes === 0) return from;
  let cursor = parseInstant(from);
  let remaining = minutes;
  let steps = 0;
  while (remaining > 0) {
    cursor += STEP_MINUTES * 60_000;
    steps += 1;
    if (steps > MAX_STEPS) throw invalid("SLA fuera de rango de calendario");
    if (isWorkingInstant(calendar, new Date(cursor))) remaining -= STEP_MINUTES;
  }
  return new Date(cursor).toISOString();
}

export function computeDueAt(
  policy: SlaPolicy,
  createdAt: string,
  kind: "first_response" | "resolution",
): string {
  const minutes =
    kind === "first_response" ? policy.firstResponseMinutes : policy.resolutionMinutes;
  if (!Number.isInteger(minutes) || minutes <= 0) throw invalid("política SLA inválida");
  return addBusinessMinutes(policy.calendar, createdAt, minutes);
}

/** Pausa el reloj: reanuda sumando el tiempo restante desde el último resume. */
export function computePausedDueAt(
  policy: SlaPolicy,
  dueAt: string,
  pausedAt: string,
  resumedAt: string,
): string {
  const pausedMs = parseInstant(resumedAt) - parseInstant(pausedAt);
  if (pausedMs < 0) throw invalid("pausa con fin anterior al inicio");
  return new Date(parseInstant(dueAt) + pausedMs).toISOString();
}

export const DEFAULT_SLA_POLICY: SlaPolicy = {
  id: "sla_standard",
  version: "2026-11-01",
  calendar: {
    timeZone: "Europe/Madrid",
    workdays: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 17,
    holidays: ["2026-12-25", "2027-01-01", "2027-01-06"],
    tzdataVersion: "system",
  },
  firstResponseMinutes: 240,
  resolutionMinutes: 1440,
  pauseStates: ["waiting_customer"],
};

export function dueAtWithTravel(policy: SlaPolicy, createdAt: string): {
  firstResponseAt: string;
  resolutionAt: string;
  example: string;
} {
  return {
    firstResponseAt: computeDueAt(policy, createdAt, "first_response"),
    resolutionAt: computeDueAt(policy, createdAt, "resolution"),
    example: isoPlusMinutes(createdAt, 0),
  };
}
