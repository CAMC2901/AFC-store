import { Coupon, Testimonial } from '../types';

export const couponsSeed: Coupon[] = [
  {
    id: 'cpn_01',
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minSubtotal: 500,
    maxDiscount: 200,
    isActive: true,
    usedCount: 42,
  },
  {
    id: 'cpn_02',
    code: 'AFCGOLD50',
    type: 'FIXED',
    value: 50,
    minSubtotal: 300,
    isActive: true,
    usedCount: 17,
  },
  {
    id: 'cpn_03',
    code: 'SUMMER15',
    type: 'PERCENTAGE',
    value: 15,
    minSubtotal: 1000,
    maxDiscount: 350,
    expiresAt: '2026-12-31T23:59:59.000Z',
    isActive: true,
    usedCount: 8,
  },
  {
    id: 'cpn_04',
    code: 'EXPIRED10',
    type: 'PERCENTAGE',
    value: 10,
    minSubtotal: 100,
    expiresAt: '2025-01-01T00:00:00.000Z',
    isActive: true,
    usedCount: 99,
  },
];

export const testimonialsSeed: Testimonial[] = [
  {
    id: 'tst_01',
    name: 'Maya Chen',
    role: 'Interior Designer, Chicago',
    content:
      'AFC pieces have become my go-to for client projects. The Aurelia sofa is sculptural yet endlessly comfortable — and delivery was flawless.',
    rating: 5,
  },
  {
    id: 'tst_02',
    name: 'James Okafor',
    role: 'Homeowner, Atlanta',
    content:
      'The Haven bed completely transformed our master suite. Build quality is outstanding and the team kept us updated at every step.',
    rating: 5,
  },
  {
    id: 'tst_03',
    name: 'Priya Natarajan',
    role: 'Product Manager, Seattle',
    content:
      'Ordered the Meridian desk for my home office. Clean design, real wood, and the cable management is a lifesaver. Highly recommend.',
    rating: 4.8,
  },
  {
    id: 'tst_04',
    name: 'Lucas Meyer',
    role: 'Restaurant Owner, Portland',
    content:
      'We furnished our dining room with the Gather table and Onyx chairs. Guests constantly ask where the furniture is from.',
    rating: 5,
  },
  {
    id: 'tst_05',
    name: 'Sofia Marchetti',
    role: 'Architect, Miami',
    content:
      'Finally a furniture brand that respects both proportion and materiality. The custom service for our trade program is world-class.',
    rating: 4.9,
  },
];
