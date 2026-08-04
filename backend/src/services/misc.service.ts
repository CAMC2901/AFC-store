import { repositories } from '../repositories/container';
import { ConflictError, NotFoundError } from '../utils/error';

export const NewsletterService = {
  async subscribe(email: string) {
    const existing = await repositories.newsletter.findByEmail(email);
    if (existing) throw new ConflictError('You are already subscribed.');
    return repositories.newsletter.subscribe(email);
  },
};

export const TestimonialService = {
  async list() {
    return repositories.testimonials.findAll();
  },
};

export const ContactService = {
  /** Validates + accepts a contact/inquiry submission (no DB persisted yet). */
  async submit(input: { name: string; email: string; subject: string; message: string }) {
    // Placeholder hook: in production, persist to a table or push to a CRM queue.
    return { receivedAt: new Date().toISOString(), ...input };
  },
};

export const CouponService = {
  async validateForUser(code: string, subtotal: number) {
    const coupon = await repositories.coupons.validate(code, subtotal);
    if (!coupon) throw new NotFoundError('This coupon code is invalid or expired.');
    return {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      discount:
        coupon.type === 'PERCENTAGE'
          ? Math.round(((subtotal * coupon.value) / 100) * 100) / 100
          : Math.min(coupon.value, subtotal),
    };
  },
};
