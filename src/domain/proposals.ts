import { forbidden, invalid } from "../lib/errors.ts";
import { hashCanonical, opaqueId } from "../lib/ids.ts";
import type { AnswerProposal, Case as CaseDto, Contact } from "../contracts/dto.ts";
import type { KnowledgeBase, RetrievalResult } from "./knowledge.ts";

/**
 * Propuestas de respuesta (CLI-C25). El modelo interpreta y redacta; no elige
 * tenant, destinatario, capabilities ni tools. Verificación LLM ≠ autorización.
 */
export interface ModelRequest {
  tenantId: string;
  caseRef: string;
  locale: "es" | "en" | "fr";
  question: string;
  retrieval: RetrievalResult;
  allowedActions: readonly string[];
}

export interface ModelOutput {
  body: string;
  unsupportedClaims: string[];
  confidence: number | null;
  modelConfigRef: string;
}

export interface ModelGateway {
  readonly configRef: string;
  generate(request: ModelRequest): Promise<ModelOutput>;
}

/**
 * Gateway determinista para desarrollo y tests: no llama a ningún proveedor.
 * En producción se sustituye por un adaptador aprobado (región/retención/coste).
 */
export class DeterministicGateway implements ModelGateway {
  readonly configRef = "model/local-deterministic-v1";

  async generate(request: ModelRequest): Promise<ModelOutput> {
    if (request.retrieval.abstained) {
      return {
        body:
          request.locale === "en"
            ? "I do not have authorized information to answer this yet; a specialist will review it."
            : request.locale === "fr"
              ? "Je n'ai pas encore d'information autorisée pour répondre ; un spécialiste va vérifier."
              : "No tengo información autorizada para responder esto todavía; lo revisará una persona especialista.",
        unsupportedClaims: [],
        confidence: null,
        modelConfigRef: this.configRef,
      };
    }
    const first = request.retrieval.citations[0];
    const body =
      request.locale === "en"
        ? `According to the current documentation: ${first?.quote ?? ""}`
        : request.locale === "fr"
          ? `D'après la documentation en vigueur : ${first?.quote ?? ""}`
          : `Según la documentación vigente: ${first?.quote ?? ""}`;
    return {
      body,
      unsupportedClaims: [],
      confidence: 0.6,
      modelConfigRef: this.configRef,
    };
  }
}

const FORBIDDEN_CLAIMS = [
  /hemos (reembolsado|devuelto el dinero)/iu,
  /refund (has been )?(processed|issued)/iu,
  /(contrato|acuerdo) (firmado|cerrado) por mí/iu,
  /transferencia (realizada|ejecutada)/iu,
];

export interface ProposeInput {
  tenantId: string;
  caseDto: CaseDto;
  contact: Contact;
  locale: "es" | "en" | "fr";
  question: string;
  acl: readonly string[];
  knowledge: KnowledgeBase;
  gateway: ModelGateway;
  now: string;
  policyRef: string;
}

export async function proposeReply(input: ProposeInput): Promise<AnswerProposal> {
  if (input.caseDto.tenantId !== input.tenantId || input.contact.tenantId !== input.tenantId) {
    throw forbidden("Caso o contacto de otro tenant");
  }
  if (input.caseDto.contactId !== input.contact.id) {
    throw invalid("El contacto no corresponde al caso");
  }
  const retrieval = input.knowledge.search({
    tenantId: input.tenantId,
    text: input.question,
    locale: input.locale,
    acl: input.acl,
    purpose: "case_reply",
    now: input.now,
  });
  const output = await input.gateway.generate({
    tenantId: input.tenantId,
    caseRef: input.caseDto.id,
    locale: input.locale,
    question: input.question,
    retrieval,
    allowedActions: input.caseDto.resolutionContract.allowedActions,
  });
  const unsupportedClaims = [
    ...output.unsupportedClaims,
    ...FORBIDDEN_CLAIMS.filter((pattern) => pattern.test(output.body)).map((p) => p.source),
  ];
  if (unsupportedClaims.length > 0) {
    throw invalid("La propuesta contiene afirmaciones de efecto no verificadas", {
      unsupportedClaims,
      policyRef: input.policyRef,
    });
  }
  return {
    id: opaqueId("prop"),
    tenantId: input.tenantId,
    caseRef: input.caseDto.id,
    contentRevision: input.caseDto.version,
    locale: input.locale,
    body: output.body,
    citations: retrieval.citations,
    unsupportedClaims,
    modelConfigRef: output.modelConfigRef,
    policyRef: input.policyRef,
    confidence: output.confidence,
    createdAt: input.now,
  };
}

export function proposalHash(proposal: AnswerProposal): string {
  return hashCanonical({
    body: proposal.body,
    locale: proposal.locale,
    citations: proposal.citations.map((c) => `${c.articleId}#${c.version}#${c.chunkRef}`),
  });
}
