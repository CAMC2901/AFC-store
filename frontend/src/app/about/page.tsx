import Image from 'next/image';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { IconLeaf, IconShield, IconSparkle, IconTruck } from '@/components/ui/Icons';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Acerca de AFC' };

const values = [
  { icon: IconLeaf, title: 'Sostenible por diseño', copy: 'Madera certificada FSC, fieltro de PET reciclado y acabados de bajo VOC en cada colección.' },
  { icon: IconSparkle, title: 'Artesanía con intención', copy: 'Cada pieza es fabricada por talleres aliados con décadas de experiencia en carpintería.' },
  { icon: IconTruck, title: 'Cuidado white-glove', copy: 'Nuestro equipo entrega, instala y arma cada pedido — y retira los empaques por ti.' },
  { icon: IconShield, title: 'Hecho para durar', copy: 'Garantía estructural de 10 años y soporte de por vida en cada original de AFC.' },
];

const milestones = [
  { year: '2016', title: 'El primer showroom', copy: 'AFC abre un único espacio de 900 pies cuadrados en Brooklyn con 12 piezas de mobiliario.' },
  { year: '2019', title: 'Se funda el estudio de diseño', copy: 'Un estudio interno comienza a diseñar piezas originales, eliminando intermediarios.' },
  { year: '2022', title: 'Compromiso sostenible', copy: 'Todos los productos de madera cambian a fuentes certificadas FSC; se elimina el empaque de plástico.' },
  { year: '2026', title: '50,000 hogares', copy: 'Más de 50,000 clientes amueblados en toda Norteamérica — y seguimos creciendo.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[52vh] items-center overflow-hidden bg-ink text-ivory">
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80"
          alt="Interiores elaborados por AFC"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 to-ink/40" />
        <div className="container-afc relative py-24">
          <Reveal>
            <p className="eyebrow text-gold">Nuestra historia</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
              Muebles que respetan el espacio que habitan
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ivory/80">
              AFC comenzó con una creencia simple: los muebles con los que vives cada día deben
              merecer ser amados. Diseñamos piezas originales, utilizamos materiales honestos y
              entregamos con cuidado white-glove.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="container-afc py-20">
        <SectionHeading
          eyebrow="En lo que creemos"
          title="Cuatro promesas que cumplimos"
          align="center"
        />
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <RevealItem key={v.title}>
              <div className="h-full rounded-2xl border border-line bg-surface p-6 text-center transition-shadow hover:shadow-card-hover">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
                  <v.icon size={24} />
                </span>
                <h3 className="mt-4 font-display text-lg">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">{v.copy}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Milestones */}
      <section className="bg-ink py-20 text-ivory">
        <div className="container-afc">
          <SectionHeading eyebrow="El recorrido" title="De una sala a 50,000 hogares" align="left" />
          <div className="grid gap-10 sm:grid-cols-2">
            {milestones.map((m) => (
              <Reveal key={m.year} className="flex gap-6">
                <span className="font-display text-5xl font-bold text-gold">{m.year}</span>
                <div className="border-l border-ivory/15 pl-6">
                  <h3 className="font-display text-xl">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/70">{m.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trade program */}
      <section id="trade" className="container-afc py-20">
        <Reveal className="grid items-center gap-10 rounded-3xl bg-mist p-8 lg:grid-cols-2 lg:p-14">
          <div>
            <p className="eyebrow">AFC Trade</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Para diseñadores y arquitectos</h2>
            <p className="mt-4 leading-relaxed text-charcoal">
              Los miembros Trade disfrutan de precios de estudio, gerentes de cuenta dedicados y
              acceso anticipado a nuevas colecciones. Escribe a{' '}
              <a className="font-semibold text-gold-dark" href="mailto:trade@afcfurniture.com">trade@afcfurniture.com</a>{' '}
              para postularte.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            {[
              { value: '15%', label: 'Descuento Trade' },
              { value: '48h', label: 'Respuesta de muestras' },
              { value: '50k+', label: 'Hogares amueblados' },
              { value: '4.9★', label: 'Calificación promedio' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-surface p-6 shadow-card">
                <p className="font-display text-3xl font-semibold text-gold-dark">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/60">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
