'use client';

import Link from 'next/link';
import { NAV_LINKS, SITE, WHATSAPP } from '@/constants';
import { useStoreConfig } from '@/hooks/useProducts';
import { IconFacebook, IconInstagram, IconMail, IconPinterest, IconPin, IconPhone, IconTwitter, IconWhatsApp } from '@/components/ui/Icons';

const policyLinks = [
  { label: 'Envíos y entrega', href: '/policies/shipping' },
  { label: 'Devoluciones y reembolsos', href: '/policies/returns' },
  { label: 'Política de privacidad', href: '/policies/privacy' },
  { label: 'Términos de servicio', href: '/policies/terms' },
  { label: 'Garantía', href: '/policies/warranty' },
];

const supportLinks = [
  { label: 'Sobre AFC', href: '/about' },
  { label: 'Contáctanos', href: '/contact' },
  { label: 'Rastrear tu pedido', href: '/account/orders' },
  { label: 'Programa para empresas', href: '/about#trade' },
  { label: 'Empleo', href: '/about#careers' },
];

export function Footer() {
  const { data: config } = useStoreConfig();
  const info = config?.storeInfo;

  const phoneDisplay = info?.phone || '+57 (300) 123-4567';
  const emailDisplay = info?.email || 'care@afcfurniture.com';
  const addressDisplay = info?.address || 'Calle 76 # 54-11, Alto Prado, Barranquilla';

  return (
    <footer className="mt-24 bg-ink text-ivory">
      {/* Newsletter band */}
      <div className="border-b border-ivory/10">
        <div className="container-afc flex flex-col items-center justify-between gap-6 py-12 lg:flex-row">
          <div className="max-w-md text-center lg:text-left">
            <h3 className="font-display text-2xl text-ivory">
              Únete a la lista privada de <span className="text-gold">AFC</span>
            </h3>
            <p className="mt-2 text-sm text-ivory/60">
              Acceso anticipado a colecciones, consejos de diseño y ofertas exclusivas para miembros. Sin spam.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main links */}
      <div className="container-afc grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ivory font-display text-lg font-bold text-ink">
              A
            </span>
            <span className="font-display text-xl font-bold text-ivory">
              AFC<span className="text-gold">.</span>
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ivory/60">
            {SITE.tagline} Mobiliario premium elaborado con intención, entregado con cuidado y diseñado para
            vivirse durante décadas.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { icon: IconInstagram, label: 'Instagram' },
              { icon: IconPinterest, label: 'Pinterest' },
              { icon: IconFacebook, label: 'Facebook' },
              { icon: IconTwitter, label: 'X' },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/15 text-ivory/70 transition-all hover:border-gold hover:bg-gold hover:text-ink"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Tienda" links={NAV_LINKS} />
        <FooterColumn title="Soporte" links={supportLinks} />
        <FooterColumn title="Políticas" links={policyLinks} />
      </div>

      {/* Contact strip */}
      <div className="border-t border-ivory/10">
        <div className="container-afc grid gap-4 py-8 text-sm text-ivory/60 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <IconPhone size={18} className="text-gold" />
            <div>
              <p className="text-xs uppercase tracking-widest text-ivory/40">Llámanos</p>
              <a href={`tel:${phoneDisplay.replace(/[^0-9+]/g, '')}`} className="hover:text-gold">
                {phoneDisplay}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IconMail size={18} className="text-gold" />
            <div>
              <p className="text-xs uppercase tracking-widest text-ivory/40">Correo</p>
              <a href={`mailto:${emailDisplay}`} className="hover:text-gold">
                {emailDisplay}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IconPin size={18} className="text-gold" />
            <div>
              <p className="text-xs uppercase tracking-widest text-ivory/40">Sala de exposición</p>
              <p>{addressDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ivory/10">
        <div className="container-afc flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/40 sm:flex-row">
          <p>© {new Date().getFullYear()} AFC Furniture. Todos los derechos reservados.</p>
          <a
            href={`https://wa.me/${WHATSAPP.number.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-ivory/60 transition-colors hover:text-gold"
          >
            <IconWhatsApp size={15} /> Escríbenos por WhatsApp
          </a>
          <div className="flex gap-4">
            <span>Pagos seguros</span>
            <span>Encriptación SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-ivory/60 transition-colors hover:text-ivory">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState } from 'react';
import toast from 'react-hot-toast';
import { MiscApi } from '@/services/products';
import { IconArrowRight } from '@/components/ui/Icons';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await MiscApi.subscribeNewsletter(email);
      toast.success('¡Bienvenido a la lista de AFC!');
      setEmail('');
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo suscribir. Inténtalo de nuevo.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-md items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu correo electrónico"
        className="w-full rounded-full border border-ivory/20 bg-ivory/5 px-5 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
        aria-label="Correo para el boletín"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-all hover:bg-gold-light disabled:opacity-60"
        aria-label="Suscribirse"
      >
        <IconArrowRight size={18} />
      </button>
    </form>
  );
}
