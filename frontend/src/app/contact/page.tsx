'use client';

import { useState } from 'react';
import { MiscApi } from '@/services/products';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { IconCheck, IconMail, IconPin, IconPhone, IconWhatsApp } from '@/components/ui/Icons';
import { getErrorMessage } from '@/lib/errors';
import toast from 'react-hot-toast';

const channels = [
  { icon: IconPhone, title: 'Llámanos', value: '+57 (300) 123-4567', href: 'tel:+573001234567', sub: 'Lun–Sáb, 8am–7pm COT' },
  { icon: IconMail, title: 'Correo', value: 'care@afcfurniture.com', href: 'mailto:care@afcfurniture.com', sub: 'Respondemos en menos de 24 horas' },
  { icon: IconPin, title: 'Sala de exposición', value: 'Calle 76 # 54-11, Alto Prado, Barranquilla', sub: 'Con cita previa' },
  { icon: IconWhatsApp, title: 'WhatsApp', value: 'Chatea con nuestro equipo', href: 'https://wa.me/573001234567', sub: 'Respuesta más rápida' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await MiscApi.sendContact(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      toast.success('¡Mensaje enviado!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-afc py-16">
      <Reveal className="mb-12 max-w-2xl">
        <p className="eyebrow mb-3">Contáctanos</p>
        <h1 className="font-display text-4xl sm:text-5xl">Nos encantaría saber de ti</h1>
        <p className="mt-4 text-charcoal">
          ¿Preguntas sobre una pieza, la entrega o un proyecto a medida? Nuestro equipo está aquí
          para ayudarte.
        </p>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Channels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
          {channels.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:border-gold hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
                <c.icon size={22} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-charcoal/60">{c.title}</p>
                <p className="font-semibold text-ink group-hover:text-gold-dark">{c.value}</p>
                <p className="text-xs text-charcoal/60">{c.sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={submit} className="card space-y-5 p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Tu nombre" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Correo electrónico" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <Input label="Asunto" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            <div>
              <label className="label" htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                rows={6}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input resize-none"
                placeholder="Cuéntanos sobre tu proyecto o consulta…"
              />
            </div>
            <Button type="submit" loading={sending} size="lg">
              {sent ? <IconCheck size={16} /> : null}
              {sent ? 'Mensaje enviado' : 'Enviar mensaje'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
