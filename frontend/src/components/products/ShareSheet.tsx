'use client';

import { useState } from 'react';
import { SITE } from '@/constants';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconFacebook,
  IconMail,
  IconQr,
  IconShare,
  IconWhatsApp,
} from '@/components/ui/Icons';
import toast from 'react-hot-toast';

export function ShareSheet({
  open,
  onClose,
  productName,
  shareUrl,
}: {
  open: boolean;
  onClose: () => void;
  productName: string;
  shareUrl: string;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const url = typeof window !== 'undefined' ? shareUrl : `${SITE.url}${shareUrl}`;
  const text = encodeURIComponent(`${productName} — ${SITE.name}`);
  const link = encodeURIComponent(url);

  const channels = [
    {
      id: 'whatsapp',
      label: t('share.whatsapp'),
      href: `https://wa.me/?text=${encodeURIComponent(`${productName} — ${SITE.name} ${url}`)}`,
    },
    { id: 'facebook', label: t('share.facebook'), href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    { id: 'x', label: t('share.x'), href: `https://twitter.com/intent/tweet?text=${text}&url=${link}` },
    { id: 'email', label: t('share.email'), href: `mailto:?subject=${text}&body=${link}` },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('share.copied'));
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('No se pudo copiar el enlace.');
    }
  };

  const iconFor = (id: string) =>
    id === 'facebook' ? <IconFacebook size={20} /> : id === 'email' ? <IconMail size={20} /> : <IconShare size={20} />;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-overlay/50 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="relative z-10 w-full max-w-md animate-scale-in rounded-t-3xl bg-surface p-6 shadow-drawer sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">{t('share.title')}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-charcoal transition-colors hover:bg-mist">
            <IconClose size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {channels.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-line p-3 text-xs font-medium text-ink transition-colors hover:border-gold hover:bg-mist"
            >
              {c.id === 'whatsapp' ? <IconWhatsApp size={20} /> : iconFor(c.id)}
              {c.label}
            </a>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-mist px-4 py-3 text-left transition-colors hover:border-gold"
        >
          <span className="truncate text-xs text-charcoal">{url}</span>
          <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', copied ? 'bg-emerald-100 text-emerald-700' : 'bg-surface text-ink')}>
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            {copied ? t('share.copied') : t('share.copy')}
          </span>
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-mist py-3 text-xs text-charcoal">
          <IconQr size={18} />
          {t('share.qrSoon')}
        </div>
      </div>
    </div>
  );
}