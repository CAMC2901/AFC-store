import { Product } from '../types';
import { repositories } from '../repositories/container';
import { env } from '../config/env';
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  BRAND,
} from '../constants';
import { findStaticAnswer, normalizeText } from '../data/static_faqs';
import { searchContext } from './rag.service';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantResult {
  reply: string;
  provider: 'groq' | 'gemini' | 'ollama';
  cached?: boolean;
}

// Response cache (Memoria Caché para consultas procesadas previamente)
const responseCache = new Map<string, string>();

/**
 * Extrae y expande términos de búsqueda incluyendo variaciones en singular/plural.
 */
function extractSearchTerms(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  const terms = new Set<string>();

  for (const word of words) {
    terms.add(word);
    if (word.endsWith('s') && word.length > 3) {
      if (word.endsWith('es')) {
        terms.add(word.slice(0, -2));
      }
      terms.add(word.slice(0, -1));
    }
  }

  return Array.from(terms);
}

/**
 * RAG Context builder combining database items and knowledge_base.txt vector chunks.
 */
async function buildContext(userQuery: string): Promise<string> {
  const ragContext = await searchContext(userQuery, 3);
  const searchTerms = extractSearchTerms(userQuery);

  const [productPage, categories, priceRange] = await Promise.all([
    repositories.products.findAll({ page: 1, limit: 30 }),
    repositories.categories.findAll(),
    repositories.products.minMaxPrice(),
  ]);

  let relevantProducts = productPage.items;
  if (searchTerms.length > 0) {
    const matched = productPage.items.filter((p: Product) =>
      searchTerms.some(
        (term) =>
          p.name.toLowerCase().includes(term) ||
          p.categoryName.toLowerCase().includes(term) ||
          p.categorySlug.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
      )
    );
    if (matched.length > 0) {
      relevantProducts = matched.slice(0, 10);
    } else {
      relevantProducts = productPage.items.slice(0, 8);
    }
  } else {
    relevantProducts = productPage.items.slice(0, 8);
  }

  const fmt = (n: number) => n.toLocaleString('es-CO');

  const productLines = relevantProducts.map((p: Product) => {
    const inStock = p.stock > 0 ? `Disponible (${p.stock} un.)` : 'Agotado';
    const compare = p.compareAtPrice ? ` (antes $${fmt(p.compareAtPrice)})` : '';
    return (
      `- ${p.name} | Cat: ${p.categoryName} | $${fmt(p.price)} COP${compare} | ${inStock} | ` +
      `Material: ${p.material ?? 'N/D'} | ${p.description.slice(0, 120)}...`
    );
  });

  const categoryLines = categories.map((c) => `- ${c.name} (${c.slug})`);

  return `
# DOCUMENTACIÓN DE CONOCIMIENTO (RAG CHUNKS)
${ragContext}

# INFORMACIÓN OFICIAL Y CATÁLOGO DE AFC FURNITURE
## Tienda & Showroom
- Marca: ${BRAND.name} — ${BRAND.tagline}
- Showroom: ${BRAND.address}
- Contacto: ${BRAND.email} | WhatsApp: +${BRAND.whatsappNumber}

## Catálogo de Productos Relevantes (Precios en COP)
${productLines.join('\n') || '- (sin productos)'}

## Categorías Disponibles
${categoryLines.join('\n') || '- (sin categorías)'}

## Rango de Precios del Catálogo
- Precios desde $${fmt(priceRange.min)} COP hasta $${fmt(priceRange.max)} COP.

## Políticas Generales
- Envío Gratis a nivel nacional en compras >= $${fmt(FREE_SHIPPING_THRESHOLD)} COP. Envío estándar: $${fmt(STANDARD_SHIPPING_FEE)} COP.
- Garantía de satisfacción de 30 días con reembolso completo.
- Garantía estructural de 10 años en marcos de madera dura.
`.trim();
}

/**
 * Builds standard chat payload with system context and conversation history.
 */
async function buildChatPayload(messages: ChatTurn[]): Promise<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>> {
  const recentMessages = messages.slice(-6);
  const lastUserMsg = [...recentMessages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const context = await buildContext(lastUserMsg);

  const systemMessageContent = `
# REGLAS DEL ASISTENTE VIRTUAL DE AFC FURNITURE
1. Eres el asesor comercial virtual de AFC Furniture en Barranquilla, Colombia. Responde de forma amable, cercana, natural y humana en español.
2. PROHIBIDO USAR ASTERISCOS Y MARKDOWN: Está ESTRICTAMENTE PROHIBIDO usar asteriscos (* o **) para poner textos en negrita o cursiva. NUNCA utilices tablas markdown. Escribe TODO en texto plano puro.
3. LISTAS Y ESPACIADO ORDENADO: Cuando recomiendes productos o des información extensa, usa siempre guiones simples (-) para las listas. Deja SIEMPRE un salto de línea en blanco (doble Enter) antes y después de cada producto o viñeta para que la lectura sea separada, limpia y estética.
4. SÍNTESIS Y CONCISIÓN: Cuando recomiendes productos, presenta máximo 2 opciones destacadas por consulta. No agobies al cliente con textos largos.
5. INFORMACIÓN OFICIAL: Utiliza ÚNICAMENTE la información y precios del CONTEXTO. No inventes nada. Formatea los precios como "$1.500.000 COP".
6. MANEJO DE CONVERSACIÓN: Si el usuario saluda o agradece, responde amablemente en 1 oración corta. Si hace preguntas ajenas a la tienda, indícale amablemente que solo brindas soporte sobre los muebles de AFC Furniture. NUNCA incluyas etiquetas HTML ni XML en tus respuestas.

# CONTEXTO OFICIAL Y CATÁLOGO DE AFC FURNITURE:
${context}
`.trim();

  const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemMessageContent },
  ];

  for (const m of recentMessages) {
    const cleanContent = m.content.replace(/<\/?msg>/gi, '').replace(/<[^>]*>/g, '').trim();
    if (cleanContent) {
      apiMessages.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: cleanContent,
      });
    }
  }

  return apiMessages;
}

function isProviderFailure(status: number): boolean {
  return status === 400 || status === 401 || status === 403 || status === 404 || status === 429;
}

async function callGroq(messages: ChatTurn[]): Promise<string> {
  const { groqApiKey, groqModel } = env.assistant;
  if (!groqApiKey) throw Object.assign(new Error('No Groq API key'), { code: 'NO_KEY' });

  const apiMessages = await buildChatPayload(messages);
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: apiMessages,
      temperature: 0.4,
      max_tokens: 450,
    }),
  });

  if (!res.ok) {
    if (isProviderFailure(res.status)) {
      throw Object.assign(new Error(`Groq failed (${res.status})`), { code: 'PROVIDER' });
    }
    throw new Error(`Groq error: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let reply = data.choices?.[0]?.message?.content?.trim() ?? '';
  reply = reply.replace(/<\/?msg>/gi, '').trim();
  return reply;
}

async function callOllama(messages: ChatTurn[]): Promise<string> {
  const { ollamaUrl, ollamaModel } = env.assistant;
  if (!ollamaUrl) throw Object.assign(new Error('No Ollama URL'), { code: 'NO_OLLAMA' });

  const apiMessages = await buildChatPayload(messages);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: ollamaModel || 'phi3',
        messages: apiMessages,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status}`);
    }

    const data = (await res.json()) as { message?: { content?: string } };
    let reply = data.message?.content?.trim() ?? '';
    reply = reply.replace(/<\/?msg>/gi, '').trim();
    return reply;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateSmartFallbackReply(messages: ChatTurn[]): Promise<string> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const queryLower = lastUserMsg.toLowerCase();

  const [productPage] = await Promise.all([
    repositories.products.findAll({ page: 1, limit: 30 }),
  ]);

  const fmt = (n: number) => n.toLocaleString('es-CO');

  if (queryLower.includes('envio') || queryLower.includes('envío') || queryLower.includes('despacho') || queryLower.includes('entrega')) {
    return `Ofrecemos Envío Gratis a nivel nacional en compras superiores a $${fmt(FREE_SHIPPING_THRESHOLD)} COP (1-3 días en Barranquilla).`;
  }

  if (queryLower.includes('garantia') || queryLower.includes('garantía') || queryLower.includes('devolucion') || queryLower.includes('devolución')) {
    return `Todos nuestros muebles cuentan con 10 años de garantía estructural y 30 días de prueba en casa con reembolso completo.`;
  }

  if (queryLower.includes('contacto') || queryLower.includes('telefono') || queryLower.includes('teléfono') || queryLower.includes('direccion') || queryLower.includes('dirección') || queryLower.includes('ubica') || queryLower.includes('barranquilla')) {
    return `Nos encantaría atenderte en nuestro Showroom en la Calle 76 # 54-11, Alto Prado, Barranquilla, o por WhatsApp al +57 (300) 123-4567.`;
  }

  const searchTerms = extractSearchTerms(lastUserMsg);

  const matched = productPage.items.filter((p: Product) => {
    return searchTerms.some(
      (term) =>
        p.name.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term) ||
        p.categorySlug.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.material ?? '').toLowerCase().includes(term) ||
        (p.color ?? '').toLowerCase().includes(term) ||
        p.tags.some((t) => t.toLowerCase().includes(term))
    );
  });

  if (matched.length > 0) {
    const list = matched
      .slice(0, 2)
      .map((p) => `- ${p.name} — $${fmt(p.price)} COP (${p.categoryName})\n  ${p.description.slice(0, 90)}...`)
      .join('\n\n\n');
    return `Aquí tienes opciones destacadas en AFC Furniture:\n\n\n${list}\n\n\n¿Te gustaría ver más detalles de alguna?`;
  }

  return `¡Hola! Con gusto te asesoro. ¿Buscas muebles para tu sala, comedor, dormitorio u oficina? Dime qué necesitas y te muestro las mejores opciones.`;
}

export const AssistantService = {
  async chat(messages: ChatTurn[]): Promise<AssistantResult> {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const normalizedQuery = normalizeText(lastUserMsg);

    // 1. CAPA 1: Búsqueda en Preguntas Frecuentes y Saludos Estáticos (Ahorra 100% de tokens en la API)
    const staticReply = findStaticAnswer(lastUserMsg);
    if (staticReply) {
      return { reply: staticReply, provider: 'groq', cached: true };
    }

    // 2. CAPA 2: Base de Datos Caché de Respuestas Previas
    if (normalizedQuery && responseCache.has(normalizedQuery)) {
      const cachedReply = responseCache.get(normalizedQuery)!;
      return { reply: cachedReply, provider: 'groq', cached: true };
    }

    // 3. CAPA 3: Ejecución vía Groq AI -> Ollama -> Smart Fallback
    let reply = '';
    let provider: 'groq' | 'gemini' | 'ollama' = 'groq';
    let isFallback = false;

    try {
      reply = await callGroq(messages);
      provider = 'groq';
    } catch (groqErr) {
      console.warn('[assistant.service] Groq call failed, trying local Ollama fallback...', (groqErr as Error)?.message);
      try {
        reply = await callOllama(messages);
        provider = 'ollama';
      } catch (ollamaErr) {
        console.warn('[assistant.service] Ollama call failed, generating smart fallback...', (ollamaErr as Error)?.message);
        reply = await generateSmartFallbackReply(messages);
        provider = 'groq';
        isFallback = true;
      }
    }

    // Solo guardar en caché respuestas verdaderas generadas por modelos de IA (no fallbacks estáticos)
    if (normalizedQuery && reply && !isFallback) {
      responseCache.set(normalizedQuery, reply);
    }

    return { reply, provider };
  },
};

