import { conflict, forbidden, invalid } from "../lib/errors.ts";
import { hashCanonical, opaqueId, sha256Hex } from "../lib/ids.ts";
import type { ApprovalBinding, AnswerProposal } from "../contracts/dto.ts";
import { parseInstant } from "../lib/time.ts";

/**
 * Aprobación ligada al payload exacto (CLI-C26).
 * - Preview puro no dispara writes remotos.
 * - Cambiar mensaje, destinatario, adjunto, tenant o política invalida la aprobación.
 * - Separación de funciones: quien propone no aprueba.
 */
export interface ApprovalSubject {
  tenantId: string;
  proposal: AnswerProposal;
  recipientRef: string;
  channel: string;
  attachmentHashes: readonly string[];
  expectedVersion: number;
  policyVersion: string;
}

export interface ApproverIdentity {
  actorId: string;
  kind: "human" | "agent" | "contact";
  capabilities: readonly string[];
}

export function buildApproval(
  subject: ApprovalSubject,
  approver: ApproverIdentity,
  options: { now: string; expiresAt: string; revocationVersion: number; proposerActorId: string },
): ApprovalBinding {
  if (approver.kind !== "human") throw forbidden("Solo un humano autenticado aprueba");
  if (!approver.capabilities.includes("reply.approve")) throw forbidden("Capacidad reply.approve ausente");
  if (approver.actorId === options.proposerActorId) {
    throw forbidden("El proponente no puede aprobar su propia propuesta");
  }
  if (subject.proposal.tenantId !== subject.tenantId) throw forbidden("Propuesta de otro tenant");
  if (parseInstant(options.expiresAt) <= parseInstant(options.now)) {
    throw invalid("Aprobación ya caducada al crearse");
  }
  return {
    id: opaqueId("apr"),
    tenantId: subject.tenantId,
    proposalHash: hashCanonical({
      body: subject.proposal.body,
      locale: subject.proposal.locale,
      citations: subject.proposal.citations,
    }),
    recipientHash: hashCanonical(subject.recipientRef),
    channelHash: hashCanonical(subject.channel),
    attachmentsHash: hashCanonical([...subject.attachmentHashes].sort()),
    actorId: approver.actorId,
    claimedRole: "human_reviewer",
    expectedVersion: subject.expectedVersion,
    policyVersion: subject.policyVersion,
    expiresAt: options.expiresAt,
    revocationVersion: options.revocationVersion,
    createdAt: options.now,
  };
}

export interface CommitCandidate {
  tenantId: string;
  proposal: AnswerProposal;
  recipientRef: string;
  channel: string;
  attachmentHashes: readonly string[];
  expectedVersion: number;
  policyVersion: string;
  caseVersion: number;
}

/** Revalidación final antes del efecto. Cualquier cambio material → 409. */
export function assertApprovalCovers(
  binding: ApprovalBinding,
  candidate: CommitCandidate,
  context: { now: string; revocationVersion: number },
): void {
  if (binding.tenantId !== candidate.tenantId) throw forbidden("Aprobación de otro tenant");
  if (binding.revocationVersion !== context.revocationVersion) {
    throw conflict("Revocación posterior a la aprobación");
  }
  if (parseInstant(binding.expiresAt) <= parseInstant(context.now)) {
    throw conflict("Aprobación caducada");
  }
  if (binding.expectedVersion !== candidate.caseVersion) {
    throw conflict("El caso cambió desde la aprobación");
  }
  if (binding.policyVersion !== candidate.policyVersion) {
    throw conflict("La política cambió desde la aprobación");
  }
  const proposalHash = hashCanonical({
    body: candidate.proposal.body,
    locale: candidate.proposal.locale,
    citations: candidate.proposal.citations,
  });
  if (proposalHash !== binding.proposalHash) throw conflict("El texto cambió desde la aprobación");
  if (hashCanonical(candidate.recipientRef) !== binding.recipientHash) {
    throw conflict("El destinatario cambió desde la aprobación");
  }
  if (hashCanonical(candidate.channel) !== binding.channelHash) {
    throw conflict("El canal cambió desde la aprobación");
  }
  const attachmentsHash = hashCanonical([...candidate.attachmentHashes].sort());
  if (attachmentsHash !== binding.attachmentsHash) {
    throw conflict("Los adjuntos cambiaron desde la aprobación");
  }
}

export function approvalFingerprint(binding: ApprovalBinding): string {
  return sha256Hex(
    [binding.proposalHash, binding.recipientHash, binding.channelHash, binding.attachmentsHash].join(":"),
  );
}
