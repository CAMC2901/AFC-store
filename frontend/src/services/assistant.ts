export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AssistantReply {
  reply: string;
  suggestions?: string[];
}

/**
 * AI advisor client.
 *
 * TODO(mock): Replace this stub with a real model integration. Two options:
 *   1. Keep a backend endpoint (e.g. POST /api/v1/assistant/chat) that proxies
 *      to an LLM, and call it here via `apiClient` from '@/lib/api-client'.
 *   2. Call your provider SDK directly (OpenAI, Anthropic, Gemini, etc.).
 *
 * The UI already handles typing animation, conversation history, suggested
 * prompts and errors — only this `ask` implementation needs to change.
 */
export const AssistantApi = {
  ask: async (messages: ChatMessage[]): Promise<AssistantReply> => {
    // SIMULATED RESPONSE — replaced when the model is connected.
    const last = [...messages].reverse().find((m) => m.role === 'user');
    await new Promise((r) => setTimeout(r, 900));
    return {
      reply: mockReply(last?.content ?? ''),
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

function mockReply(input: string): string {
  const q = input.toLowerCase();
  if (/(pago|pagar|pse|tarjeta|métodos|formas)/.test(q)) {
    return 'Aceptamos pagos por PSE, tarjetas de crédito y débito, y otros métodos a través de la pasarela de pago. Puedes elegir tu método al formalizar la compra en el checkout.';
  }
  if (/(enví|envio|entrega|envìo|domicilio|garant)/.test(q)) {
    return 'Ofrecemos entrega white-glove en las principales ciudades y garantía estructural de 10 años en nuestros muebles. El tiempo de entrega depende de tu ubicación.';
  }
  if (/(sofá|sofa|sala|mueble|recomend)/.test(q)) {
    return 'Podemos recomendarte según tu espacio. Explora nuestra colección de salas, comedores y dormitorios — cada pieza incluye dimensiones, materiales y disponibilidad para ayudarte a decidir.';
  }
  return 'Claro, déjame guiarte. ¿Buscas un tipo de mueble en particular, o quieres información sobre pagos, envíos o garantías?';
}