import { hashCanonical } from "../lib/ids.ts";

/**
 * Reportes reproducibles (CLI-C36). Snapshot con fuentes, denominadores y
 * datos faltantes visibles. Sin encuestas, CSAT es null, no 0 ni 100.
 */
export interface ReportSource {
  ref: string;
  observedAt: string;
  hash: string;
}

export interface CaseStats {
  opened: number;
  resolvedVerified: number;
  autoClosed: number;
  reopened: number;
  open: number;
}

export interface ResponseStats {
  substantiveFirstResponsesMinutes: number[];
  automaticAcks: number;
}

export interface SurveyStats {
  responses: number;
  csat: number | null;
  note: string;
}

export interface ReportSnapshot {
  id: string;
  tenantId: string;
  window: { from: string; to: string };
  generatedAt: string;
  sources: ReportSource[];
  cases: CaseStats;
  responses: ResponseStats;
  surveys: SurveyStats;
  cost: { amount: string; currency: string; measured: boolean };
  gaps: string[];
  hash: string;
}

export function buildReport(input: {
  id: string;
  tenantId: string;
  window: { from: string; to: string };
  generatedAt: string;
  sources: ReportSource[];
  cases: CaseStats;
  responses: ResponseStats;
  surveys: SurveyStats;
  cost: { amount: string; currency: string; measured: boolean };
}): ReportSnapshot {
  const gaps: string[] = [];
  if (input.surveys.responses === 0) gaps.push("no_survey_data");
  if (!input.cost.measured) gaps.push("cost_not_measured");
  if (input.responses.substantiveFirstResponsesMinutes.length === 0) gaps.push("no_first_response_data");
  const snapshot: ReportSnapshot = {
    ...input,
    gaps,
    hash: "",
  };
  snapshot.hash = hashCanonical({
    tenantId: snapshot.tenantId,
    window: snapshot.window,
    cases: snapshot.cases,
    responses: snapshot.responses,
    surveys: snapshot.surveys,
    cost: snapshot.cost,
  });
  return snapshot;
}

export function percentile(values: readonly number[], q: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[index] ?? null;
}

/** Recalcular con las mismas fuentes produce el mismo hash (reproducibilidad). */
export function verifyReproducible(snapshot: ReportSnapshot): boolean {
  return (
    snapshot.hash ===
    hashCanonical({
      tenantId: snapshot.tenantId,
      window: snapshot.window,
      cases: snapshot.cases,
      responses: snapshot.responses,
      surveys: snapshot.surveys,
      cost: snapshot.cost,
    })
  );
}
