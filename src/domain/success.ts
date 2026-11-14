import { forbidden } from "../lib/errors.ts";
import { hashCanonical } from "../lib/ids.ts";
import type { HealthObservation } from "../contracts/dto.ts";

/**
 * Customer success (CLI-C30). Missing ≠ 0. Un score es una ayuda explicable,
 * nunca una decisión significativa autónoma ni una etiqueta emocional.
 */
export interface MetricDefinition {
  id: string;
  version: string;
  description: string;
  windowDays: number;
  requiredSources: readonly string[];
  minimumCoverage: number;
}

export interface HealthComponent {
  metricId: string;
  value: number | null;
  coverage: number;
  reasonCode: string;
}

export interface HealthScore {
  score: number | null;
  components: HealthComponent[];
  coverage: number;
  reasonCodes: string[];
  definitionVersion: string;
  window: { from: string; to: string };
}

export const HEALTH_METRICS: readonly MetricDefinition[] = [
  {
    id: "support.pressure",
    version: "1.0.0",
    description: "Casos abiertos por contacto activo en la ventana",
    windowDays: 30,
    requiredSources: ["cases"],
    minimumCoverage: 0.8,
  },
  {
    id: "relationship.engagement",
    version: "1.0.0",
    description: "Interacciones atendidas frente a interacciones entrantes",
    windowDays: 30,
    requiredSources: ["messages", "cases"],
    minimumCoverage: 0.6,
  },
  {
    id: "billing.usage",
    version: "1.0.0",
    description: "Uso declarado por facturación; sin fuente queda nulo",
    windowDays: 90,
    requiredSources: ["billing"],
    minimumCoverage: 0.9,
  },
];

export function computeHealth(input: {
  tenantId: string;
  organizationId: string;
  observations: readonly HealthObservation[];
  now: string;
}): HealthScore {
  const components: HealthComponent[] = HEALTH_METRICS.map((metric) => {
    const observation = input.observations.find(
      (o) => o.metricDefinitionVersion === `${metric.id}@${metric.version}`,
    );
    if (!observation) {
      return { metricId: metric.id, value: null, coverage: 0, reasonCode: "source_missing" };
    }
    if (observation.coverage < metric.minimumCoverage) {
      return {
        metricId: metric.id,
        value: null,
        coverage: observation.coverage,
        reasonCode: "coverage_below_threshold",
      };
    }
    return {
      metricId: metric.id,
      value: observation.value,
      coverage: observation.coverage,
      reasonCode: observation.value === null ? "value_missing" : "ok",
    };
  });

  const usable = components.filter((c) => c.value !== null);
  const coverage = components.length === 0 ? 0 : usable.length / components.length;
  if (usable.length === 0) {
    return {
      score: null,
      components,
      coverage,
      reasonCodes: ["insufficient_data"],
      definitionVersion: "health-v1",
      window: { from: input.now, to: input.now },
    };
  }
  const score =
    usable.reduce((total, component) => total + (component.value ?? 0), 0) / usable.length;
  return {
    score: Number(score.toFixed(2)),
    components,
    coverage,
    reasonCodes: components.filter((c) => c.value === null).map((c) => c.reasonCode),
    definitionVersion: "health-v1",
    window: { from: input.now, to: input.now },
  };
}

/** Similaridad entre tenants para cohortes: nunca se comparten datos crudos. */
export function assertCohortAggregate(input: {
  tenantCount: number;
  minimumTenants: number;
  containsDirectIdentifiers: boolean;
}): void {
  if (input.tenantCount < input.minimumTenants) {
    throw forbidden("Cohorte por debajo del mínimo de privacidad");
  }
  if (input.containsDirectIdentifiers) {
    throw forbidden("Agregado con identificadores directos");
  }
}

export function healthSnapshotHash(score: HealthScore): string {
  return hashCanonical(score);
}
