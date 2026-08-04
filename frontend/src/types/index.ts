export type Role = 'ADMIN' | 'CUSTOMER';

export interface Dimensions {
  width?: number;
  height?: number;
  depth?: number;
  assembly?: string;
  unit?: 'in' | 'cm';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  sku: string;
  stock: number;
  material?: string;
  color?: string;
  dimensions?: Dimensions;
  weight?: number;
  featured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  productCount?: number;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  contact: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  stock: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  freeShippingEligible: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type SortBy = 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  material?: string;
  color?: string;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface AdminSummary {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus: Array<{ status: string; count: number }>;
  recentOrders: Order[];
}
