import { apiClient } from '@/lib/api-client';
import type { Order, Paginated } from '@/types';

export interface CheckoutAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutPayload {
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  contact: { email: string; firstName: string; lastName: string; phone?: string };
  couponCode?: string;
  shippingMethod?: 'standard' | 'express';
}

export const OrdersApi = {
  async checkout(payload: CheckoutPayload): Promise<Order> {
    const { data } = await apiClient.post<{ data: { order: Order } }>('/user/checkout', payload);
    return data.data.order;
  },

  async estimate(payload: { couponCode?: string; shippingMethod?: 'standard' | 'express' }) {
    const { data } = await apiClient.post('/user/estimate', payload);
    return data.data;
  },

  async mine(params: { page?: number; limit?: number } = {}): Promise<Paginated<Order>> {
    const { data } = await apiClient.get<{ data: Paginated<Order> }>('/user/orders', { params });
    return data.data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<{ data: { order: Order } }>(`/user/orders/${id}`);
    return data.data.order;
  },
};

export const WishlistApi = {
  async list(): Promise<import('@/types').Product[]> {
    const { data } = await apiClient.get<{ data: import('@/types').Product[] }>('/user/wishlist');
    return data.data;
  },

  async toggle(productId: string): Promise<{ added: boolean }> {
    const { data } = await apiClient.post<{ data: { added: boolean } }>(`/user/wishlist/${productId}`);
    return data.data;
  },

  async remove(productId: string): Promise<void> {
    await apiClient.delete(`/user/wishlist/${productId}`);
  },
};
