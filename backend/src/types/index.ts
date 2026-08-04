/** Role-based authorization levels. */
export type Role = 'ADMIN' | 'CUSTOMER';

export interface Dimensions {
  width?: number;
  height?: number;
  depth?: number;
  /** Free-form assembly note, e.g. "Some assembly required" */
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
  passwordHash: string;
  refreshToken?: string | null;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

/** The user object that is safe to send to the client (never exposes passwordHash). */
export type PublicUser = Omit<User, 'passwordHash' | 'refreshToken'>;

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

export interface OrderAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderContact {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
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
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  contact: OrderContact;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  userId: string;
  productId: string;
  addedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

/* ---------------- Pagination ---------------- */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
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

/* ---------------- Product filters ---------------- */

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  material?: string;
  color?: string;
  inStockOnly?: boolean;
  featuredOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';
  page?: number;
  limit?: number;
}
