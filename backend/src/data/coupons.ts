import { Coupon, Testimonial } from '../types';

export const couponsSeed: Coupon[] = [
  {
    id: 'cpn_01',
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minSubtotal: 700000,
    maxDiscount: 600000,
    isActive: true,
    usedCount: 42,
  },
  {
    id: 'cpn_02',
    code: 'AFCGOLD50',
    type: 'FIXED',
    value: 150000,
    minSubtotal: 500000,
    isActive: true,
    usedCount: 17,
  },
  {
    id: 'cpn_03',
    code: 'SUMMER15',
    type: 'PERCENTAGE',
    value: 15,
    minSubtotal: 1500000,
    maxDiscount: 1000000,
    expiresAt: '2026-12-31T23:59:59.000Z',
    isActive: true,
    usedCount: 8,
  },
  {
    id: 'cpn_04',
    code: 'EXPIRED10',
    type: 'PERCENTAGE',
    value: 10,
    minSubtotal: 200000,
    expiresAt: '2025-01-01T00:00:00.000Z',
    isActive: true,
    usedCount: 99,
  },
];

export const testimonialsSeed: Testimonial[] = [
  {
    id: 'tst_01',
    name: 'Maya Chen',
    role: 'Diseñadora de interiores, Chicago',
    roleEn: 'Interior Designer, Chicago',
    content:
      'Las piezas de AFC se han convertido en mi primera opción para proyectos de clientes. El sofá Aurelia es escultural y a la vez infinitamente cómodo — y la entrega fue impecable.',
    contentEn:
      'AFC pieces have become my go-to for client projects. The Aurelia sofa is sculptural yet endlessly comfortable — and delivery was flawless.',
    rating: 5,
  },
  {
    id: 'tst_02',
    name: 'James Okafor',
    role: 'Propietario de hogar, Atlanta',
    roleEn: 'Homeowner, Atlanta',
    content:
      'La cama Haven transformó por completo nuestra suite principal. La calidad de construcción es sobresaliente y el equipo nos mantuvo informados en cada paso.',
    contentEn:
      'The Haven bed completely transformed our master suite. Build quality is outstanding and the team kept us updated at every step.',
    rating: 5,
  },
  {
    id: 'tst_03',
    name: 'Priya Natarajan',
    role: 'Product Manager, Seattle',
    roleEn: 'Product Manager, Seattle',
    content:
      'Pedí el escritorio Meridian para mi oficina en casa. Diseño limpio, madera real y la gestión de cables es un salvavidas. Muy recomendable.',
    contentEn:
      'Ordered the Meridian desk for my home office. Clean design, real wood, and the cable management is a lifesaver. Highly recommend.',
    rating: 4.8,
  },
  {
    id: 'tst_04',
    name: 'Lucas Meyer',
    role: 'Propietario de restaurante, Portland',
    roleEn: 'Restaurant Owner, Portland',
    content:
      'Amueblamos nuestro comedor con la mesa Gather y las sillas Onyx. Los clientes preguntan constantemente de dónde es el mobiliario.',
    contentEn:
      'We furnished our dining room with the Gather table and Onyx chairs. Guests constantly ask where the furniture is from.',
    rating: 5,
  },
  {
    id: 'tst_05',
    name: 'Sofia Marchetti',
    role: 'Arquitecta, Miami',
    roleEn: 'Architect, Miami',
    content:
      'Por fin una marca de mobiliario que respeta la proporción y la materialidad. El servicio personalizado de nuestro programa comercial es de primer nivel.',
    contentEn:
      'Finally a furniture brand that respects both proportion and materiality. The custom service for our trade program is world-class.',
    rating: 4.9,
  },
];
