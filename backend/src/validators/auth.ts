import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '../constants';

const email = z.string().trim().toLowerCase().email('Please enter a valid email address.');

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[0-9]/, 'Password must contain a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.');

const name = (field: string) =>
  z.string().trim().min(2, `${field} must be at least 2 characters.`).max(80);

export const registerSchema = z.object({
  email,
  password,
  firstName: name('First name'),
  lastName: name('Last name'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const refreshSchema = z.object({}).optional();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: password,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  });

export const updateProfileSchema = z.object({
  firstName: name('First name').optional(),
  lastName: name('Last name').optional(),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  email: email.optional(),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  email,
  resetToken: z.string().min(1, 'Reset code or token is required.'),
  newPassword: password,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
