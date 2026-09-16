'use client';

import { useState } from 'react';
import { WHATSAPP } from '@/constants';
import { useI18n } from '@/i18n';
import { useSupportStore } from '@/store/useSupportStore';
import { buildWhatsAppLink } from '@/lib/utils';
import { IconClose, IconWhatsApp } from '@/components/ui/Icons';

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const context = useSupportStore((s) => s.context);
  const { t } = useI18n();

  const base = (message: string) => buildWhatsAppLink(WHATSAPP.number, message);
  const ctxSuffix = context ? ` (${context})` : '';

  const quickLinks = [
    { key: 'support', label: t('support.support'), message: `¡Hola! Me gustaría hablar con AFC.${ctxSuffix}` },
    {
      key: 'product',
      label: t('support.productInquiry'),
      message: context
        ? `Hola AFC, me gustaría más detalles sobre: ${context}.`
        : `Hola AFC, ¿podrías recomendarme muebles?`,
    },
    { key: 'order', label: t('support.orderInquiry'), message: "Hola AFC, ¿podrías ayudarme con mi pedido?" },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 origin-bottom-right animate-scale-in rounded-3xl border border-line bg-surface p-3 shadow-card-hover">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="font-display text-lg text-ink">AFC {t('support.title')}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('support.close')}
              className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-mist"
            >
              <IconClose size={18} />
            </button>
          </div>
          <p className="mb-3 px-2 text-xs text-charcoal">{t('support.best')}</p>
          <div className="flex flex-col gap-1">
            {quickLinks.map((q) => (
              <a
                key={q.key}
                href={base(q.message)}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-mist"
              >
                {q.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {open && (
          <span className="animate-fade-in rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-charcoal shadow-card">
            {t('support.title')}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? t('support.close') : t('support.title')}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
        >
          {open ? <IconClose size={26} /> : <IconWhatsApp size={28} />}
        </button>
      </div>
    </div>
  );
}
