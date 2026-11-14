import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { opaqueId } from "../lib/ids.ts";
import type { Clock } from "../lib/time.ts";
import { nowIso, systemClock } from "../lib/time.ts";

/**
 * Onboarding y playbooks (CLI-C29). Un hito se completa con evidencia y aceptación,
 * no porque el agente lo diga. Las plantillas están versionadas.
 */
export interface PlaybookStep {
  key: string;
  title: string;
  required: boolean;
  requiresDocument: boolean;
  assignedRole: "operator" | "contact" | "tenant_owner";
}

export interface Playbook {
  id: string;
  version: number;
  serviceKind: string;
  steps: readonly PlaybookStep[];
  status: "draft" | "published" | "retired";
}

export interface PlanStep {
  key: string;
  state: "pending" | "in_progress" | "waiting" | "done" | "blocked";
  evidenceRef: string | null;
  acceptedBy: string | null;
  documentRef: string | null;
  waitingOn: "operator" | "contact" | "tenant_owner" | null;
}

export interface OnboardingPlan {
  id: string;
  tenantId: string;
  organizationRef: string;
  playbookId: string;
  playbookVersion: number;
  assignedTo: string | null;
  assignedBy: string | null;
  stepState: PlanStep[];
  createdAt: string;
  version: number;
}

export class OnboardingService {
  readonly #playbooks = new Map<string, Playbook[]>();
  readonly #plans = new Map<string, OnboardingPlan>();
  readonly #clock: Clock;

  constructor(options: { clock?: Clock } = {}) {
    this.#clock = options.clock ?? systemClock;
  }

  publishPlaybook(playbook: Playbook): Playbook {
    if (playbook.steps.length === 0) throw invalid("Playbook sin pasos");
    if (!playbook.steps.some((s) => s.required)) throw invalid("Playbook sin pasos obligatorios");
    const versions = this.#playbooks.get(playbook.id) ?? [];
    if (versions.some((v) => v.version === playbook.version)) throw conflict("Versión duplicada");
    const published: Playbook = { ...playbook, status: "published" };
    versions.push(published);
    this.#playbooks.set(playbook.id, versions);
    return published;
  }

  startPlan(input: {
    tenantId: string;
    organizationRef: string;
    playbookId: string;
    version: number;
    assignedBy: string;
  }): OnboardingPlan {
    const playbook = this.#playbooks.get(input.playbookId)?.find((p) => p.version === input.version);
    if (!playbook || playbook.status !== "published") throw forbidden("Playbook no publicado");
    const plan: OnboardingPlan = {
      id: opaqueId("plan"),
      tenantId: input.tenantId,
      organizationRef: input.organizationRef,
      playbookId: playbook.id,
      playbookVersion: playbook.version,
      assignedTo: null,
      assignedBy: input.assignedBy,
      stepState: playbook.steps.map((step) => ({
        key: step.key,
        state: "pending",
        evidenceRef: null,
        acceptedBy: null,
        documentRef: null,
        waitingOn: null,
      })),
      createdAt: nowIso(this.#clock),
      version: 0,
    };
    this.#plans.set(plan.id, plan);
    return plan;
  }

  submitDocument(input: {
    planId: string;
    tenantId: string;
    stepKey: string;
    documentRef: string;
    evidenceRef: string;
  }): OnboardingPlan {
    const plan = this.#require(input.planId, input.tenantId);
    if (!input.documentRef || !input.evidenceRef) throw invalid("Documento sin evidencia");
    return this.#patchStep(plan, input.stepKey, {
      state: "waiting",
      documentRef: input.documentRef,
      evidenceRef: input.evidenceRef,
      waitingOn: "operator",
      acceptedBy: null,
    });
  }

  /** Recibir un documento no implica que sea correcto: hace falta aceptación humana. */
  acceptStep(input: { planId: string; tenantId: string; stepKey: string; acceptedBy: string }): OnboardingPlan {
    const plan = this.#require(input.planId, input.tenantId);
    const step = plan.stepState.find((s) => s.key === input.stepKey);
    if (!step) throw invalid("Paso desconocido");
    if (step.state !== "waiting") throw conflict("El paso no está pendiente de aceptación");
    if (!step.evidenceRef) throw forbidden("Aceptación sin evidencia");
    return this.#patchStep(plan, input.stepKey, {
      state: "done",
      acceptedBy: input.acceptedBy,
      waitingOn: null,
    });
  }

  /** Nueva versión del playbook: no marca pasos antiguos como cumplidos. */
  upgradePlan(planId: string, tenantId: string, version: number): OnboardingPlan {
    const plan = this.#require(planId, tenantId);
    const playbook = this.#playbooks.get(plan.playbookId)?.find((p) => p.version === version);
    if (!playbook) throw forbidden("Versión de playbook inexistente");
    const existing = new Map(plan.stepState.map((s) => [s.key, s]));
    const migrated: PlanStep[] = playbook.steps.map((step) => {
      const previous = existing.get(step.key);
      return previous ?? {
        key: step.key,
        state: "pending",
        evidenceRef: null,
        acceptedBy: null,
        documentRef: null,
        waitingOn: null,
      };
    });
    const next: OnboardingPlan = {
      ...plan,
      playbookVersion: version,
      stepState: migrated,
      version: plan.version + 1,
    };
    this.#plans.set(planId, next);
    return next;
  }

  #patchStep(plan: OnboardingPlan, stepKey: string, patch: Partial<PlanStep>): OnboardingPlan {
    const stepState = plan.stepState.map((step) =>
      step.key === stepKey ? { ...step, ...patch } : step,
    );
    const next: OnboardingPlan = { ...plan, stepState, version: plan.version + 1 };
    this.#plans.set(plan.id, next);
    return next;
  }

  #require(planId: string, tenantId: string): OnboardingPlan {
    const plan = this.#plans.get(planId);
    if (!plan || plan.tenantId !== tenantId) throw forbidden("Plan no encontrado");
    return plan;
  }
}
