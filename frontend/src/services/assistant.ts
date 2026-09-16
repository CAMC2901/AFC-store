export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AssistantReply {
  reply: string;
  provider?: 'gemini' | 'ollama';
  suggestions?: string[];
}

/**
 * AI advisor client.
 *
 * Delegates to the backend endpoint `POST /api/v1/assistant/chat`, which:
 *   1. Builds an embedded RAG context (catalog + store policies in COP).
 *   2. Answers via Gemini (GEMINI_API_KEY on the server).
 *   3. Falls back to the local Ollama phi3 model when the Gemini key is
 *      missing, exhausted or rate-limited.
 * The API key never touches the browser.
 */
export const AssistantApi = {
  ask: async (messages: ChatMessage[]): Promise<AssistantReply> => {
    const res = await fetch('/api/v1/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map(({ role, content }) => ({ role, content })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Assistant request failed: ${res.status}`);
    }

    const payload = (await res.json()) as {
      data?: { reply?: string; provider?: 'gemini' | 'ollama' };
    };
    const reply = payload.data?.reply?.trim();
    if (!reply) throw new Error('Empty assistant reply');

    return {
      reply,
      provider: payload.data?.provider,
      suggestions: ['Ver productos', 'Políticas de envío', 'Métodos de pago', 'Garantía'],
    };
  },
};

export const ASSISTANT_SUGGESTIONS = [
  'Ayúdame a elegir un sofá',
  '¿Cuáles son los métodos de pago?',
  '¿Cómo funciona el envío?',
  '¿Qué garantía tienen los productos?',
];

export const ASSISTANT_WELCOME =
  '¡Hola! Soy el asistente de AFC Furniture. Puedo ayudarte a elegir muebles, conocer precios, envíos, pagos y garantías. ¿En qué te ayudo?';