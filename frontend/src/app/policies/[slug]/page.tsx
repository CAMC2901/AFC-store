import { Accordion } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import type { Metadata } from 'next';

const policies: Record<string, { title: string; sections: Array<{ h: string; p: string }> }> = {
  shipping: {
    title: 'Envíos y entrega',
    sections: [
      { h: 'Opciones de entrega', p: 'La entrega estándar (5–7 días hábiles) es gratuita en pedidos superiores a $1.499 y cuesta $49 en el resto. La entrega express (2–3 días hábiles) está disponible por $89 en artículos en stock.' },
      { h: 'Servicio white-glove', p: 'Todos los pedidos de mobiliario incluyen entrega white-glove: nuestro equipo lleva los artículos al interior, los ensambla, los coloca en la habitación que elijas y retira todo el empaque.' },
      { h: 'Programación de la entrega', p: 'Recibirás un mensaje o correo para programar la entrega dentro de las 24 horas posteriores a la confirmación del pedido. Los horarios se confirman el día anterior a la entrega.' },
    ],
  },
  returns: {
    title: 'Devoluciones y reembolsos',
    sections: [
      { h: 'Garantía de satisfacción de 30 días', p: 'Si no quedas satisfecho dentro de los 30 días posteriores a la entrega, coordinaremos una recogida y emitiremos un reembolso completo del precio del producto.' },
      { h: 'Condiciones', p: 'Los artículos deben estar en condiciones reutilizables y sin desgaste significativo. Los pedidos personalizados y del Programa Trade son de venta final.' },
      { h: 'Tiempo de reembolso', p: 'Los reembolsos se emiten al método de pago original dentro de los 5–7 días hábiles posteriores a la recogida e inspección de los artículos.' },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    sections: [
      { h: 'Qué recopilamos', p: 'Recopilamos la información que proporcionas (nombre, correo, dirección de envío, teléfono) además de los datos transaccionales y analíticos necesarios para operar la tienda.' },
      { h: 'Cómo la usamos', p: 'Tus datos se utilizan para cumplir pedidos, brindar soporte, personalizar recomendaciones y (con tu consentimiento) enviar comunicaciones de marketing.' },
      { h: 'Tus derechos', p: 'Puedes acceder, corregir o eliminar tus datos personales en cualquier momento contactando a care@afcfurniture.com.' },
    ],
  },
  terms: {
    title: 'Términos de servicio',
    sections: [
      { h: 'Pedidos y precios', p: 'Todos los precios están en pesos colombianos (COP) e incluyen impuestos estimados donde se muestran. Nos reservamos el derecho de cancelar pedidos afectados por errores de precio o disponibilidad.' },
      { h: 'Seguridad de la cuenta', p: 'Eres responsable de proteger tus credenciales de acceso. Notifícanos de inmediato cualquier uso no autorizado.' },
      { h: 'Limitación de responsabilidad', p: 'En la máxima medida permitida por la ley, AFC no es responsable de daños indirectos, incidentales o consecuentes derivados del uso de los productos.' },
    ],
  },
  warranty: {
    title: 'Garantía',
    sections: [
      { h: 'Garantía estructural de 10 años', p: 'Todos los marcos de AFC están cubiertos durante 10 años contra defectos estructurales en materiales y fabricación.' },
      { h: 'Garantía de tapicería por 5 años', p: 'Las telas y espumas están cubiertas durante 5 años contra defectos de fabricación, incluidas costuras y compresión de cojines.' },
      { h: 'Cómo reclamar', p: 'Envía fotos del problema a warranty@afcfurniture.com con el número de tu pedido. Normalmente resolvemos las reclamaciones en 5 días hábiles.' },
    ],
  },
};

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const policy = policies[params.slug];
  const title = policy?.title ?? 'Política';

  return (
    <div className="container-afc max-w-3xl py-16">
      <Reveal className="mb-10">
        <p className="eyebrow mb-3">Políticas de AFC</p>
        <h1 className="font-display text-4xl">{title}</h1>
      </Reveal>

      {policy ? (
        <Accordion
          defaultOpen={0}
          items={policy.sections.map((s) => ({
            title: s.h,
            content: <p>{s.p}</p>,
          }))}
        />
      ) : (
        <p className="text-charcoal">Esta página de políticas no existe.</p>
      )}

      <p className="mt-10 rounded-2xl bg-mist p-5 text-sm text-charcoal">
        Última actualización: enero de 2026. ¿Preguntas sobre esta política?{' '}
        <a href="mailto:care@afcfurniture.com" className="font-semibold text-gold-dark">
          care@afcfurniture.com
        </a>
      </p>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return { title: policies[params.slug]?.title ?? 'Política' };
}
