import { forbidden, notFound } from "../lib/errors.ts";
import { hashCanonical, opaqueId } from "../lib/ids.ts";
import type { Citation, KnowledgeVersion } from "../contracts/dto.ts";

/**
 * Conocimiento versionado y RAG autorizado (CLI-C24).
 * ACL antes y después de recuperar; abstención si no hay evidencia vigente.
 */
export interface Chunk {
  articleId: string;
  version: number;
  chunkRef: string;
  text: string;
  acl: readonly string[];
  locale: "es" | "en" | "fr";
  status: KnowledgeVersion["status"];
  effectiveFrom: string;
  effectiveTo: string | null;
  tenantId: string;
}

export interface RetrievalQuery {
  tenantId: string;
  text: string;
  locale: "es" | "en" | "fr";
  acl: readonly string[];
  purpose: string;
  now: string;
  minScore?: number;
}

export interface RetrievalResult {
  citations: Citation[];
  chunks: Chunk[];
  abstained: boolean;
  reasonCodes: string[];
}

export class KnowledgeBase {
  readonly #chunks: Chunk[] = [];
  readonly #articles = new Map<string, KnowledgeVersion[]>();

  ingest(article: KnowledgeVersion): void {
    const versions = this.#articles.get(article.articleId) ?? [];
    if (versions.some((v) => v.version === article.version)) {
      throw forbidden("Versión de artículo duplicada");
    }
    versions.push(article);
    this.#articles.set(article.articleId, versions);
    this.#chunks.push(...splitIntoChunks(article));
  }

  publish(articleId: string, version: number, reviewerRef: string): void {
    const article = this.#articles.get(articleId)?.find((a) => a.version === version);
    if (!article) throw notFound("Artículo no encontrado");
    if (!article.sourceRefs.length) throw forbidden("Publicar sin fuente verificable");
    if (!reviewerRef) throw forbidden("Publicación sin revisor humano");
    article.status = "published";
    article.reviewerRef = reviewerRef;
    for (const chunk of this.#chunks) {
      if (chunk.articleId === articleId && chunk.version === version) chunk.status = "published";
    }
  }

  retire(articleId: string): void {
    for (const article of this.#articles.get(articleId) ?? []) article.status = "retired";
    for (const chunk of this.#chunks) {
      if (chunk.articleId === articleId) chunk.status = "retired";
    }
  }

  search(query: RetrievalQuery): RetrievalResult {
    const minScore = query.minScore ?? 0.2;
    // 1) Filtrado previo por tenant, ACL, idioma y vigencia.
    const candidates = this.#chunks.filter((chunk) => {
      if (chunk.tenantId !== query.tenantId) return false;
      if (chunk.status !== "published") return false;
      if (chunk.locale !== query.locale) return false;
      if (Date.parse(chunk.effectiveFrom) > Date.parse(query.now)) return false;
      if (chunk.effectiveTo && Date.parse(chunk.effectiveTo) < Date.parse(query.now)) return false;
      return chunk.acl.every((rule) => query.acl.includes(rule));
    });
    const scored = candidates
      .map((chunk) => ({ chunk, score: score(query.text, chunk.text) }))
      .filter((c) => c.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    // 2) Filtrado posterior: un score alto nunca supera una ACL ausente.
    const allowed = scored.filter((c) => c.chunk.acl.every((rule) => query.acl.includes(rule)));
    if (allowed.length === 0) {
      return { citations: [], chunks: [], abstained: true, reasonCodes: ["no_authorized_evidence"] };
    }
    return {
      citations: allowed.map(({ chunk }) => ({
        articleId: chunk.articleId,
        version: chunk.version,
        chunkRef: chunk.chunkRef,
        quote: chunk.text.slice(0, 240),
      })),
      chunks: allowed.map((c) => c.chunk),
      abstained: false,
      reasonCodes: [],
    };
  }

  versions(articleId: string): readonly KnowledgeVersion[] {
    return this.#articles.get(articleId) ?? [];
  }

  /** Borrado/retención: elimina chunks del índice (C24/C38). */
  purge(tenantId: string, articleId: string): number {
    let removed = 0;
    for (let i = this.#chunks.length - 1; i >= 0; i -= 1) {
      const chunk = this.#chunks[i]!;
      if (chunk.tenantId === tenantId && chunk.articleId === articleId) {
        this.#chunks.splice(i, 1);
        removed += 1;
      }
    }
    this.#articles.delete(articleId);
    return removed;
  }
}

function splitIntoChunks(article: KnowledgeVersion): Chunk[] {
  const sentences = article.body.split(/(?<=\.)\s+/u).filter(Boolean);
  const chunks: Chunk[] = [];
  let buffer = "";
  let index = 0;
  for (const sentence of sentences) {
    if ((buffer + sentence).length > 400 && buffer.length > 0) {
      chunks.push(makeChunk(article, index, buffer));
      index += 1;
      buffer = "";
    }
    buffer += `${sentence} `;
  }
  if (buffer.trim().length > 0) chunks.push(makeChunk(article, index, buffer.trim()));
  return chunks;
}

function makeChunk(article: KnowledgeVersion, index: number, text: string): Chunk {
  return {
    articleId: article.articleId,
    version: article.version,
    chunkRef: `${article.articleId}#v${article.version}#c${index}`,
    text,
    acl: article.acl,
    locale: article.locale,
    status: article.status,
    effectiveFrom: article.effectiveFrom,
    effectiveTo: article.effectiveTo,
    tenantId: article.tenantId,
  };
}

function score(queryText: string, chunkText: string): number {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .split(/[^a-z0-9áéíóúñ]+/u)
      .filter((token) => token.length > 2);
  const queryTokens = new Set(normalize(queryText));
  const chunkTokens = new Set(normalize(chunkText));
  if (queryTokens.size === 0) return 0;
  let hits = 0;
  for (const token of queryTokens) if (chunkTokens.has(token)) hits += 1;
  return hits / queryTokens.size;
}

export function knowledgeGapEvent(tenantId: string, caseRef: string, reason: string) {
  return {
    id: opaqueId("evt"),
    type: "clientes.knowledge.gap",
    tenantId,
    caseRef,
    reason,
    hash: hashCanonical({ tenantId, caseRef, reason }),
  };
}
