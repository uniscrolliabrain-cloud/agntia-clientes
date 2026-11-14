import { z } from "zod";
import { forbidden } from "../lib/errors.ts";
import type { ClientesClient } from "../sdk/client.ts";

/**
 * Tools nominadas (CLI-C34). Inputs excluyen tenant/actor/capabilities: se
 * resuelven en servidor. approve/send/merge/export_all/refund/admin NO son tools.
 */
export interface AgentTool<I extends z.ZodTypeAny, O> {
  name: string;
  description: string;
  input: I;
  handler: (input: z.infer<I>) => Promise<O>;
}

const CaseId = z.string().min(3).max(200);

export function createAgentTools(client: ClientesClient): AgentTool<z.ZodTypeAny, unknown>[] {
  const readCase: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_case_read",
    description: "Lee un caso autorizado del tenant del principal.",
    input: z.object({ caseId: CaseId }).strict(),
    handler: async (input) => client.getCase((input as { caseId: string }).caseId),
  };

  const timeline: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_case_timeline",
    description: "Lista los casos del tenant con su estado (sin contenido privado).",
    input: z.object({}).strict(),
    handler: async () => client.listCases(),
  };

  const search: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_knowledge_search",
    description: "Busca conocimiento autorizado; se abstiene sin evidencia.",
    input: z
      .object({
        query: z.string().min(3).max(500),
        locale: z.enum(["es", "en", "fr"]).default("es"),
      })
      .strict(),
    handler: async (input) => {
      const typed = input as { query: string; locale: "es" | "en" | "fr" };
      return client.searchKnowledge(typed.query, typed.locale);
    },
  };

  const propose: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_answer_propose",
    description: "Genera un borrador con citas. No envía ni aprueba nada.",
    input: z
      .object({
        caseId: CaseId,
        locale: z.enum(["es", "en", "fr"]).default("es"),
        question: z.string().min(3).max(2000),
        acl: z.array(z.string().max(120)).max(10).default(["support"]),
      })
      .strict(),
    handler: async (input) => {
      const typed = input as { caseId: string; locale: "es" | "en" | "fr"; question: string; acl: string[] };
      return client.proposeReply(typed.caseId, {
        locale: typed.locale,
        question: typed.question,
        acl: typed.acl,
      });
    },
  };

  const handoffPropose: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_handoff_propose",
    description: "Propone escalado humano con motivo y fuentes mínimas.",
    input: z
      .object({
        caseRef: CaseId,
        conversationRef: CaseId,
        reason: z.enum(["customer_request", "identity_doubt", "legal_risk", "sensitive_data", "uncertain_outcome"]),
        summaryRefs: z.array(z.string().max(400)).min(1).max(10),
      })
      .strict(),
    handler: async (input) => {
      throw forbidden("El escalado requiere la ruta autenticada /v1/clientes/handoffs");
    },
  };

  const healthExplain: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_health_explain",
    description: "Explica el informe y sus huecos de datos sin inventar valores.",
    input: z.object({}).strict(),
    handler: async () => client.report(),
  };

  const reportRead: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_report_read",
    description: "Lee el snapshot de reporte reproducible del tenant.",
    input: z.object({}).strict(),
    handler: async () => client.report(),
  };

  const integrationHealth: AgentTool<z.ZodTypeAny, unknown> = {
    name: "clientes_integration_health",
    description: "Devuelve el capability report sin credenciales.",
    input: z.object({}).strict(),
    handler: async () => {
      throw forbidden("Capability report requiere conexión nominada por el operador");
    },
  };

  return [
    readCase,
    timeline,
    search,
    propose,
    handoffPropose,
    healthExplain,
    reportRead,
    integrationHealth,
  ];
}

/** Nombres prohibidos: se comprueba en tests y en el catálogo. */
export const FORBIDDEN_TOOL_NAMES = [
  "approve",
  "send",
  "merge",
  "export_all",
  "refund",
  "admin",
  "sql",
  "http",
  "shell",
] as const;
