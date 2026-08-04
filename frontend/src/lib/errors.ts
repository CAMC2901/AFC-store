import { AxiosError } from 'axios';
import type { ApiErrorBody } from '@/types';

/**
 * Extracts a human-readable message from an API error.
 * Prefers flattened Zod field errors for forms.
 */
export const getErrorMessage = (error: unknown, fallback = 'Algo salió mal. Inténtalo de nuevo.'): string => {
  const axiosError = error as AxiosError<ApiErrorBody> | undefined;
  const body = axiosError?.response?.data;
  if (body?.message) return body.message;
  if (axiosError?.message && axiosError.message !== 'Request failed with status code 401') {
    return axiosError.message;
  }
  return fallback;
};

/** Returns field-level validation errors from a Zod-flattened API response. */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  const axiosError = error as AxiosError<ApiErrorBody> | undefined;
  const errors = axiosError?.response?.data?.errors;
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [key, messages?.[0] ?? 'Valor no válido'])
  );
};
