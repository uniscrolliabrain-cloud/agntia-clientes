import { invalid } from "../lib/errors.ts";
import { sha256Hex } from "../lib/ids.ts";

/**
 * Evidencia adjunta (CLI-C21). Allowlist de MIME real por magic bytes, tamaño,
 * cuarentena, sanitización y protección de fórmulas CSV. Nada se ejecuta.
 */
export interface AttachmentPolicy {
  allowedMime: readonly string[];
  maxBytes: number;
  quarantine: boolean;
}

export const DEFAULT_ATTACHMENT_POLICY: AttachmentPolicy = {
  allowedMime: ["application/pdf", "image/png", "image/jpeg", "text/plain", "text/csv"],
  maxBytes: 10 * 1024 * 1024,
  quarantine: true,
};

export interface StoredAttachment {
  ref: string;
  mime: string;
  bytes: number;
  hash: string;
  quarantined: boolean;
  sanitizedText: string | null;
  reasonCodes: string[];
}

const MAGIC: readonly { mime: string; bytes: readonly number[] }[] = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
];

export function sniffMime(content: Uint8Array): string | null {
  for (const entry of MAGIC) {
    if (entry.bytes.every((byte, index) => content[index] === byte)) return entry.mime;
  }
  const sample = Buffer.from(content.slice(0, 512)).toString("utf8");
  if (/^[\x09\x0a\x0d\x20-\x7e\u00a0-\uffff]*$/u.test(sample) && sample.trim().length > 0) {
    return "text/plain";
  }
  return null;
}

export function ingestAttachment(input: {
  ref: string;
  declaredMime: string;
  filename: string;
  content: Uint8Array;
  policy?: AttachmentPolicy;
}): StoredAttachment {
  const policy = input.policy ?? DEFAULT_ATTACHMENT_POLICY;
  if (input.content.byteLength > policy.maxBytes) throw invalid("Adjunto demasiado grande");
  if (input.filename.includes("..") || /[\\/]/u.test(input.filename)) {
    throw invalid("Nombre de archivo con ruta");
  }
  const mime = sniffMime(input.content);
  if (!mime || !policy.allowedMime.includes(mime)) {
    throw invalid("MIME no permitido");
  }
  if (input.declaredMime !== mime && !(input.declaredMime === "text/csv" && mime === "text/plain")) {
    throw invalid("MIME declarado no coincide con el contenido");
  }
  const reasonCodes: string[] = [];
  let sanitizedText: string | null = null;
  if (mime === "text/plain" || mime === "text/csv") {
    const text = Buffer.from(input.content).toString("utf8");
    sanitizedText = neutralizeCsv(text, input.declaredMime === "text/csv");
    if (sanitizedText !== text) reasonCodes.push("formula_neutralized");
    if (/<script|onerror=|javascript:/iu.test(text)) {
      reasonCodes.push("html_content_detected");
      sanitizedText = null;
    }
  }
  return {
    ref: input.ref,
    mime,
    bytes: input.content.byteLength,
    hash: sha256Hex(input.content),
    quarantined: policy.quarantine && reasonCodes.includes("html_content_detected"),
    sanitizedText,
    reasonCodes,
  };
}

/** CSV formula injection: se antepone una comilla a celdas que empiezan por = + - @. */
export function neutralizeCsv(text: string, isCsv: boolean): string {
  if (!isCsv) return text;
  return text
    .split("\n")
    .map((line) =>
      line
        .split(",")
        .map((cell) => (/^[=+\-@\t]/u.test(cell) ? `'${cell}` : cell))
        .join(","),
    )
    .join("\n");
}

/**
 * Un adjunto es evidencia: su texto no se interpreta como instrucciones,
 * y el llamador debe envolverlo como dato no confiable.
 */
export function asEvidence(attachment: StoredAttachment) {
  return {
    kind: "attachment_evidence" as const,
    ref: attachment.ref,
    hash: attachment.hash,
    trusted: false as const,
    text: attachment.sanitizedText,
  };
}
