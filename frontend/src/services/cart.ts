import { apiClient } from '@/lib/api-client';
import type { CartLine, CartTotals } from '@/types';

interface CartData {
  lines: CartLine[];
  count: number;
}

export const CartApi = {
  async get(): Promise<CartData> {
    const { data } = await apiClient.get<{ data: CartData }>('/cart');
    return data.data;
  },

  async add(productId: string, quantity = 1): Promise<CartData> {
    const { data } = await apiClient.post<{ data: CartData }>('/cart/items', { productId, quantity });
    return data.data;
  },

  async update(productId: string, quantity: number): Promise<{ lines: CartLine[] }> {
    const { data } = await apiClient.put<{ data: { lines: CartLine[] } }>('/cart/items', {
      productId,
      quantity,
    });
    return data.data;
  },

  async remove(productId: string): Promise<{ lines: CartLine[] }> {
    const { data } = await apiClient.delete<{ data: { lines: CartLine[] } }>('/cart/items', {
      data: { productId },
    });
    return data.data;
  },

  async clear(): Promise<void> {
    await apiClient.delete('/cart');
  },

  async totals(payload: { couponCode?: string; shippingMethod?: 'standard' | 'express' }): Promise<CartTotals> {
    const { data } = await apiClient.post<{ data: CartTotals }>('/cart/totals', payload);
    return data.data;
  },

  async validateCoupon(code: string, subtotal: number) {
    const { data } = await apiClient.post<{ data: unknown }>('/cart/coupon/validate', {
      code,
      subtotal,
    });
    return data.data;
  },
};
