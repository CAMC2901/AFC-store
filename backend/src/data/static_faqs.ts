/**
 * Normaliza cualquier texto removiendo puntuación, acentos, caracteres especiales y espacios extra.
 * Permite que variaciones como "ho.la", "o.l.a", "¡Hóla!", "buen.os día.s" sean procesadas limpiamente.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes y acentos
    .replace(/[^a-z0-9\s]/g, '') // Elimina puntos, comas, signos de interrogación y caracteres especiales
    .replace(/\s+/g, ' ') // Colapsa múltiples espacios
    .trim();
}

export interface StaticFaq {
  keys: string[];
  response: string;
}

export const STATIC_FAQS: StaticFaq[] = [
  // SALUDOS Y CORTESÍA (Evita consumo innecesario de tokens en la API de Groq)
  {
    keys: [
      'hola', 'ola', 'holaa', 'holaaa', 'buenas', 'buenas tardes', 'buenos dias', 'buenas noches',
      'saludos', 'que tal', 'hey', 'hello', 'hi', 'buenas buenas', 'hola asistente'
    ],
    response:
      '¡Hola! Bienvenido a **AFC Furniture** 🛋️. Soy tu asistente virtual de diseño de interiores. ¿En qué te puedo ayudar hoy? Puedes preguntarme sobre nuestro catálogo de muebles, tienda en Barranquilla, envíos gratis o garantías.',
  },
  {
    keys: [
      'gracias', 'muchas gracias', 'mil gracias', 'perfecto gracias', 'excelente gracias', 'ok gracias'
    ],
    response:
      '¡Con mucho gusto! 😊 En AFC Furniture estamos para servirte. Si tienes alguna otra duda o consulta sobre nuestros muebles, estaré encantado de ayudarte.',
  },
  {
    keys: [
      'chao', 'adios', 'hasta luego', 'nos vemos', 'bye', 'hasta pronto'
    ],
    response:
      '¡Gracias por visitar **AFC Furniture**! 👋 Esperamos verte pronto de nuevo. ¡Que tengas un excelente día!',
  },
  {
    keys: [
      'vale', 'ok', 'listo', 'entendido', 'esta bien', 'perfecto', 'excelente'
    ],
    response:
      '¡Excelente! Si necesitas algo más o deseas consultar algún producto de nuestra colección, aquí estaré. 😊',
  },
  {
    keys: [
      'otra pregunta', 'tengo otra pregunta', 'otra duda', 'tengo una duda', 'tengo una pregunta', 'otra consulta', 'tengo otra duda'
    ],
    response:
      '¡Claro que sí! 😊 Cuéntame, ¿qué otra duda tienes sobre nuestros muebles, envíos, tienda en Barranquilla o garantías? Estoy para ayudarte.',
  },

  // UBICACIÓN Y SHOWROOM EN BARRANQUILLA
  {
    keys: [
      'donde quedan', 'donde estan ubicados', 'direccion', 'donde queda la tienda',
      'showroom', 'sala de exposicion', 'donde estan', 'ubicacion', 'tienda fisica', 'barranquilla'
    ],
    response:
      '📍 Nuestra sala de exposición principal (Showroom) se encuentra ubicada en **Calle 76 # 54-11, Barrio Alto Prado, Barranquilla, Colombia**. ¡Te esperamos con gusto para que conozcas la colección completa!',
  },
  {
    keys: [
      'horario', 'horarios', 'que horas abren', 'horario de atencion', 'a que hora cierran'
    ],
    response:
      '🕒 Nuestro horario de atención en la sala de exhibición en Barranquilla es:\n- **Lunes a Sábado:** 9:00 AM a 7:00 PM (Jornada continua).\n- **Domingos y Festivos:** 10:00 AM a 4:00 PM.',
  },

  // CONTACTO Y ATENCIÓN AL CLIENTE
  {
    keys: [
      'telefono', 'celular', 'whatsapp', 'numero de contacto', 'contacto', 'correo', 'email'
    ],
    response:
      '📞 Puedes contactarnos directamente a través de:\n- **WhatsApp / Teléfono:** +57 (300) 123-4567\n- **Correo electrónico:** contacto@afcfurniture.com\n- **Showroom:** Calle 76 # 54-11, Alto Prado, Barranquilla.',
  },

  // ENVIOS Y ENTREGAS EN COLOMBIA
  {
    keys: [
      'envio gratis', 'cuanto cuesta el envio', 'costo de envio', 'politica de envio',
      'envios a colombia', 'hacen envios', 'cuanto demora el envio', 'tiempos de entrega'
    ],
    response:
      '🚚 **Información de Envíos en AFC Furniture:**\n- **Envío GRATIS:** En compras superiores a **$1.499.000 COP** a nivel nacional.\n- **Tarifa Estándar:** $45.000 COP para compras inferiores a $1.499.000 COP.\n- **Tiempos de entrega:** 1 a 3 días hábiles en Barranquilla; 3 a 5 días hábiles a Bogotá, Medellín, Cali, Cartagena y resto del país.',
  },

  // GARANTÍA Y DEVOLUCIONES
  {
    keys: [
      'garantia', 'cuanto tiempo de garantia', 'politica de devolucion', 'cambios y devoluciones', 'devoluciones'
    ],
    response:
      '🛡️ **Garantía y Devoluciones:**\n- **10 Años de Garantía Estructural:** Cubre armazón y defectos de fabricación en todos los muebles.\n- **2 Años de Garantía:** En telas, cueros, espumas y herrajes.\n- **Devolución en 30 días:** Cuentas con 30 días calendario para solicitar cambio o devolución total si el producto no cumple tus expectativas.',
  },

  // MÉTODOS DE PAGO Y MONEDA
  {
    keys: [
      'metodos de pago', 'como puedo pagar', 'tarjetas', 'pse', 'efectivo', 'pago contraentrega', 'moneda'
    ],
    response:
      '💳 Aceptamos los siguientes métodos de pago en Pesos Colombianos ($ COP):\n- Tarjetas de Crédito y Débito (Visa, Mastercard, Amex)\n- Transferencias PSE, Bancolombia, Nequi y Daviplata\n- Pago contra entrega o en showroom en Barranquilla.',
  },

  // CUPONES Y DESCUENTOS
  {
    keys: [
      'cupon', 'cupones', 'descuento', 'descuentos', 'codigo promocional', 'ofertas'
    ],
    response:
      '🎁 Puedes utilizar nuestros cupones vigentes al momento del checkout:\n- **`WELCOME10`**: 10% de descuento en tu primera compra.\n- **`AFCVERANO`**: $200.000 COP de descuento adicional en productos seleccionados.',
  },

  // CUIDADO DE MUEBLES Y MANTENIMIENTO
  {
    keys: [
      'cuidado', 'mantenimiento', 'limpieza', 'como limpiar', 'limpiar cuero', 'limpiar terciopelo', 'limpiar madera'
    ],
    response:
      '✨ **Guía de Cuidado de Muebles AFC:**\n- **Madera Maciza:** Limpiar con paño suave seco. Evitar la exposición directa al agua.\n- **Cuero Top Grain:** Hidratar con bálsamo especial cada 6 meses y remover manchas con paño húmedo.\n- **Terciopelo:** Cepillar suavemente y limpiar manchas con espuma neutra instantánea.',
  },

  // CANCELACIÓN DE PEDIDOS
  {
    keys: [
      'cancelar', 'cancelacion', 'anular pedido', 'cancelar compra'
    ],
    response:
      '📝 Puedes solicitar la cancelación de tu pedido de forma gratuita dentro de las primeras **24 horas** posteriores a tu compra contactándonos por WhatsApp al **+57 (300) 123-4567** o a soporte@afcfurniture.com.',
  },
];

/**
 * Busca si una entrada del usuario coincide con una pregunta o saludo estático de la lista.
 */
export function findStaticAnswer(userQuery: string): string | null {
  const normalized = normalizeText(userQuery);
  if (!normalized) return null;

  for (const entry of STATIC_FAQS) {
    for (const key of entry.keys) {
      const normalizedKey = normalizeText(key);
      // Coincidencia exacta o coincidencia completa de palabras
      if (
        normalized === normalizedKey ||
        normalized === `hola ${normalizedKey}` ||
        normalized === `${normalizedKey} hola`
      ) {
        return entry.response;
      }
    }
  }

  return null;
}

