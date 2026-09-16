import { apiClient } from '@/lib/api-client';
import type { Address, AdminAnalytics, Coupon, Paginated, Product, User, Order } from '@/types';

export const AccountApi = {
  async updateProfile(payload: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'email'>>): Promise<User> {
    const { data } = await apiClient.patch<{ data: { user: User } }>('/account/profile', payload);
    return data.data.user;
  },

  async addresses(): Promise<Address[]> {
    const { data } = await apiClient.get<{ data: { addresses: Address[] } }>('/account/addresses');
    return data.data.addresses;
  },

  async addAddress(payload: Omit<Address, 'id'>): Promise<Address[]> {
    const { data } = await apiClient.post<{ data: { addresses: Address[] } }>('/account/addresses', payload);
    return data.data.addresses;
  },

  async updateAddress(addressId: string, payload: Partial<Omit<Address, 'id'>>): Promise<Address[]> {
    const { data } = await apiClient.patch<{ data: { addresses: Address[] } }>(
      `/account/addresses/${addressId}`,
      payload
    );
    return data.data.addresses;
  },

  async removeAddress(addressId: string): Promise<Address[]> {
    const { data } = await apiClient.delete<{ data: { addresses: Address[] } }>(
      `/account/addresses/${addressId}`
    );
    return data.data.addresses;
  },

  async setDefaultAddress(addressId: string): Promise<Address[]> {
    const { data } = await apiClient.post<{ data: { addresses: Address[] } }>(
      `/account/addresses/${addressId}/default`
    );
    return data.data.addresses;
  },
};

export const AdminApi = {
  async products(params: { page?: number; limit?: number } = {}): Promise<Paginated<Product>> {
    const { data } = await apiClient.get<{ data: Paginated<Product> }>('/admin/products', { params });
    return data.data;
  },

  async createProduct(payload: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.post<{ data: { product: Product } }>('/admin/products', payload);
    return data.data.product;
  },

  async updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
    const { data } = await apiClient.patch<{ data: { product: Product } }>(
      `/admin/products/${id}`,
      payload
    );
    return data.data.product;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`);
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    await apiClient.post(`/admin/products/${id}/stock`, { delta });
  },

  async categories() {
    const { data } = await apiClient.get<{ data: import('@/types').Category[] }>('/admin/categories');
    return data.data;
  },

  async createCategory(payload: { name: string; slug?: string; description?: string; imageUrl?: string; sortOrder?: number }) {
    const { data } = await apiClient.post<{ data: { category: import('@/types').Category } }>('/admin/categories', payload);
    return data.data.category;
  },

  async updateCategory(id: string, payload: Partial<{ name: string; slug: string; description: string; imageUrl: string; sortOrder: number }>) {
    const { data } = await apiClient.patch<{ data: { category: import('@/types').Category } }>(`/admin/categories/${id}`, payload);
    return data.data.category;
  },

  async deleteCategory(id: string) {
    await apiClient.delete(`/admin/categories/${id}`);
  },

  async orders(params: { page?: number; limit?: number; status?: string } = {}) {
    const { data } = await apiClient.get<{ data: Paginated<Order> }>('/admin/orders', { params });
    return data.data;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const { data } = await apiClient.patch<{ data: { order: Order } }>(
      `/admin/orders/${id}/status`,
      { status }
    );
    return data.data.order;
  },

  async customers(params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ data: Paginated<User> }>('/admin/customers', { params });
    return data.data;
  },

  async coupons(): Promise<Coupon[]> {
    const { data } = await apiClient.get<{ data: Coupon[] }>('/admin/coupons');
    return data.data;
  },

  async createCoupon(payload: Partial<Coupon>): Promise<Coupon> {
    const { data } = await apiClient.post<{ data: { coupon: Coupon } }>('/admin/coupons', payload);
    return data.data.coupon;
  },

  async updateCoupon(id: string, payload: Partial<Coupon>): Promise<Coupon> {
    const { data } = await apiClient.patch<{ data: { coupon: Coupon } }>(`/admin/coupons/${id}`, payload);
    return data.data.coupon;
  },

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/admin/coupons/${id}`);
  },

  async analytics(days = 30): Promise<AdminAnalytics> {
    const { data } = await apiClient.get<{ data: AdminAnalytics }>('/admin/analytics', {
      params: { days },
    });
    return data.data;
  },
};
