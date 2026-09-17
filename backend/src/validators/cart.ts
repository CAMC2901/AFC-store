import { z } from 'zod';

const productId = z.string().min(1).max(64);
const quantity = z.coerce.number().int().min(1).max(99);

export const addToCartSchema = z.object({
  productId,
  quantity: quantity.default(1),
});

export const updateCartItemSchema = z.object({
  productId,
  quantity,
});

export const removeCartItemSchema = z.object({
  productId,
});

export const couponSchema = z.object({
  code: z.string().trim().min(1).max(40),
});

export const couponPreviewSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.coerce.number().min(0),
});

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  line1: z.string().trim().min(2).max(120),
  line2: z.string().trim().max(120).optional().or(z.literal('')),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(80).toUpperCase().default('US'),
});

const contactSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  contact: contactSchema,
  couponCode: z.string().trim().max(40).optional().or(z.literal('')),
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
  // Accepted for future payment gateway integration.
  paymentMethod: z.string().trim().max(40).default('cod'),
});

export const estimateShippingSchema = z.object({
  couponCode: z.string().trim().max(40).optional().or(z.literal('')),
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
});
