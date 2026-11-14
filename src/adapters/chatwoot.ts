import { conflict, forbidden, invalid, unsupported } from "../lib/errors.ts";
import { hashCanonical, sha256Hex } from "../lib/ids.ts";
import type { Message } from "../contracts/dto.ts";
import type { HttpTransport } from "../integrations/transport.ts";

/**
 * Chatwoot: primer backend de conversaciones (CLI-C13/C14).
 * account_id/inbox_id NO son el tenantId del servicio; se vinculan explícitamente.
 * Crear una fila de mensaje no prueba entrega ni autoriza retry.
 */
export interface ChatwootBinding {
  tenantId: string;
  connectionId: string;
  accountId: string;
  inboxIds: readonly string[];
  /** Client/Application API: nunca token administrativo en navegador ni LLM. */
  apiTokenRef: string;
}

export interface ChatwootConversation {
  id: string;
  inboxId: string;
  status: "open" | "pending" | "resolved" | "snoozed";
  contactId: string | null;
  lastActivityAt: string;
  displayId: number | null;
}

export interface ChatwootMessage {
  id: string;
  conversationId: string;
  content: string;
  messageType: "incoming" | "outgoing" | "activity" | "template";
  private: boolean;
  createdAt: string;
  senderId: string | null;
  attachments: readonly { id: string; contentType: string }[];
  deleted: boolean;
}

export class ChatwootAdapter {
  readonly #transport: HttpTransport;
  readonly #baseUrl: string;
  readonly #token: () => Promise<string>;
  readonly #binding: ChatwootBinding;

  constructor(input: {
    transport: HttpTransport;
    baseUrl: string;
    token: () => Promise<string>;
    binding: ChatwootBinding;
  }) {
    this.#transport = input.transport;
    this.#baseUrl = input.baseUrl.replace(/\/$/u, "");
    this.#token = input.token;
    this.#binding = input.binding;
  }

  #assertInbox(inboxId: string): void {
    if (!this.#binding.inboxIds.includes(inboxId)) {
      throw forbidden("inbox no vinculado a este tenant");
    }
  }

  async listConversations(inboxId: string, page = 1): Promise<ChatwootConversation[]> {
    this.#assertInbox(inboxId);
    const response = await this.#transport.send({
      method: "GET",
      url: `${this.#baseUrl}/api/v1/accounts/${this.#binding.accountId}/inboxes/${inboxId}/conversations?page=${page}`,
      headers: { api_access_token: await this.#token(), Accept: "application/json" },
    });
    if (response.status === 401 || response.status === 403) {
      throw forbidden("Chatwoot: permiso insuficiente");
    }
    if (response.status !== 200) throw unsupported(`Chatwoot list: HTTP ${response.status}`);
    const parsed = JSON.parse(response.body) as { payload?: unknown };
    if (!Array.isArray(parsed.payload)) throw invalid("Respuesta Chatwoot inesperada");
    return parsed.payload.map((raw) => mapConversation(raw as Record<string, unknown>));
  }

  async listMessages(conversationId: string, inboxId: string): Promise<ChatwootMessage[]> {
    this.#assertInbox(inboxId);
    const response = await this.#transport.send({
      method: "GET",
      url: `${this.#baseUrl}/api/v1/accounts/${this.#binding.accountId}/conversations/${conversationId}/messages`,
      headers: { api_access_token: await this.#token(), Accept: "application/json" },
    });
    if (response.status !== 200) throw unsupported(`Chatwoot messages: HTTP ${response.status}`);
    const parsed = JSON.parse(response.body) as { payload?: unknown };
    if (!Array.isArray(parsed.payload)) throw invalid("Respuesta Chatwoot inesperada");
    return parsed.payload
      .map((raw) => mapMessage(raw as Record<string, unknown>))
      .filter((m) => !m.deleted);
  }

  /**
   * Writeback: exige intent aprobado; solo create, sin delete ni retry arbitrario.
   * Devuelve el id remoto; si la respuesta se pierde, el llamador debe reconciliar.
   */
  async createMessage(input: {
    conversationId: string;
    inboxId: string;
    content: string;
    isPrivate: boolean;
    approvalRef: string;
  }): Promise<{ remoteId: string; sourceHash: string }> {
    this.#assertInbox(input.inboxId);
    if (!input.approvalRef) throw forbidden("Writeback sin aprobación vinculada");
    const response = await this.#transport.send({
      method: "POST",
      url: `${this.#baseUrl}/api/v1/accounts/${this.#binding.accountId}/conversations/${input.conversationId}/messages`,
      headers: {
        api_access_token: await this.#token(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: input.content,
        message_type: "outgoing",
        private: input.isPrivate,
      }),
    });
    if (response.status === 401 || response.status === 403) {
      throw forbidden("Chatwoot: sin permiso de escritura");
    }
    if (response.status === 422) throw invalid("Chatwoot rechazó el mensaje");
    if (response.status >= 500 || response.status === 0) {
      throw conflict("Resultado incierto en Chatwoot: reconciliar antes de reintentar");
    }
    const parsed = JSON.parse(response.body) as { id?: number };
    if (typeof parsed.id !== "number") {
      throw conflict("Chatwoot respondió sin id: no se puede afirmar persistencia");
    }
    return { remoteId: String(parsed.id), sourceHash: sha256Hex(response.body) };
  }

  /** Reconciliación segura: busca por hash de contenido y autor. */
  async findMessageByContent(
    conversationId: string,
    inboxId: string,
    content: string,
  ): Promise<ChatwootMessage | null> {
    const messages = await this.listMessages(conversationId, inboxId);
    const target = hashCanonical(content);
    return messages.find((m) => hashCanonical(m.content) === target) ?? null;
  }

  /** Mapea a Message del servicio conservando visibilidad y origen. */
  toServiceMessage(message: ChatwootMessage, tenantId: string): Message {
    return {
      id: `msg_${message.id}`,
      tenantId,
      channel: "chatwoot",
      connectionId: this.#binding.connectionId,
      remoteId: message.id,
      conversationRef: `conv_${message.conversationId}`,
      caseRef: null,
      direction: message.messageType === "incoming" ? "inbound" : "outbound",
      visibility: message.private ? "internal" : "public",
      contentRef: `chatwoot:message:${message.id}`,
      attachmentRefs: message.attachments.map((a) => `chatwoot:attachment:${a.id}`),
      occurredAt: message.createdAt,
      receivedAt: message.createdAt,
      sourceHash: sha256Hex(JSON.stringify(message)),
      deliveryState: message.messageType === "outgoing" ? "accepted" : "received",
    };
  }
}

function mapConversation(raw: Record<string, unknown>): ChatwootConversation {
  const meta = (raw.meta ?? {}) as Record<string, unknown>;
  const sender = (meta.sender ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id),
    inboxId: String(raw.inbox_id),
    status: (raw.status as ChatwootConversation["status"]) ?? "open",
    contactId: sender.id !== undefined ? String(sender.id) : null,
    lastActivityAt: new Date(Number(raw.timestamp ?? 0) * 1000).toISOString(),
    displayId: typeof raw.display_id === "number" ? raw.display_id : null,
  };
}

function mapMessage(raw: Record<string, unknown>): ChatwootMessage {
  const sender = (raw.sender ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id),
    conversationId: String(raw.conversation_id),
    content: typeof raw.content === "string" ? raw.content : "",
    messageType: (raw.message_type as ChatwootMessage["messageType"]) ?? "incoming",
    private: raw.private === true,
    createdAt: new Date(Number(raw.created_at ?? 0) * 1000).toISOString(),
    senderId: sender.id !== undefined ? String(sender.id) : null,
    attachments: Array.isArray(raw.attachments)
      ? (raw.attachments as Record<string, unknown>[]).map((a) => ({
          id: String(a.id),
          contentType: String(a.content_type ?? "application/octet-stream"),
        }))
      : [],
    deleted: raw.content_attributes !== undefined && raw.deleted === true,
  };
}
