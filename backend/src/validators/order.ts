import { z } from 'zod';
import { MAX_PAGE_SIZE, ORDER_STATUSES } from '../constants';

export const orderIdSchema = z.object({
  id: z.string().min(1).max(64),
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(10),
  status: z.enum(ORDER_STATUSES).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

export const addressIdSchema = z.object({
  addressId: z.string().min(1).max(64),
});

export const addressCreateSchema = z.object({
  label: z.string().trim().min(1).max(40),
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120).optional().or(z.literal('')).or(z.null()),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(2).max(80).default('Colombia'),
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = addressCreateSchema.partial();
