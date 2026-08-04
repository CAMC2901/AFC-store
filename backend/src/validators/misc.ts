import { z } from 'zod';

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(3000),
});

export const wishlistProductIdSchema = z.object({
  productId: z.string().min(1).max(64),
});

export const couponCreateSchema = z.object({
  code: z.string().trim().min(2).max(40),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minSubtotal: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  usageLimit: z.number().int().min(1).optional(),
});

export const couponUpdateSchema = couponCreateSchema.partial();

export const couponIdSchema = z.object({
  id: z.string().min(1).max(64),
});
