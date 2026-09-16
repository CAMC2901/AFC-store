/**
 * Repository interfaces.
 *
 * These contracts mirror what Prisma will provide once PostgreSQL is enabled.
 * The services depend ONLY on these interfaces, so swapping the in-memory
 * implementation for a Prisma implementation is a one-file change
 * (see src/repositories/index.ts).
 */

import {
  Address,
  Category,
  Coupon,
  NewsletterSubscriber,
  Order,
  OrderContact,
  OrderAddress,
  OrderItem,
  PaginatedResult,
  Product,
  ProductFilters,
  Testimonial,
  User,
  WishlistItem,
} from '../types';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'ADMIN' | 'CUSTOMER';
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  isActive?: boolean;
}

export interface CreateAddressInput {
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {
  isDefault?: boolean;
}

export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  contact: OrderContact;
}

export interface CreateCouponInput {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive?: boolean;
  usageLimit?: number;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<PaginatedResult<User>>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User | null>;
  setRefreshToken(id: string, token: string | null): Promise<User | null>;
  addAddress(userId: string, input: CreateAddressInput): Promise<Address[]>;
  updateAddress(userId: string, addressId: string, input: UpdateAddressInput): Promise<Address[]>;
  removeAddress(userId: string, addressId: string): Promise<Address[]>;
  setDefaultAddress(userId: string, addressId: string): Promise<Address[]>;
  count(): Promise<number>;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  findAll(filters: ProductFilters): Promise<PaginatedResult<Product>>;
  findRelated(product: Product, limit?: number): Promise<Product[]>;
  create(input: Partial<Product>): Promise<Product>;
  update(id: string, input: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  adjustStock(id: string, delta: number): Promise<Product | null>;
  addRating(id: string, rating: number): Promise<Product | null>;
  count(): Promise<number>;
  minMaxPrice(): Promise<{ min: number; max: number }>;
  topSelling(limit: number): Promise<Product[]>;
}

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  create(input: Partial<Category>): Promise<Category>;
  update(id: string, input: Partial<Category>): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
}

export interface ICartRepository {
  getCart(userId: string): Promise<Array<{ productId: string; quantity: number }>>;
  saveCart(userId: string, items: Array<{ productId: string; quantity: number }>): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUser(userId: string, page: number, limit: number): Promise<PaginatedResult<Order>>;
  findAll(page: number, limit: number, status?: string): Promise<PaginatedResult<Order>>;
  create(input: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, status: string): Promise<Order | null>;
  updatePaymentStatus(id: string, status: string): Promise<Order | null>;
  count(): Promise<number>;
  revenue(): Promise<number>;
  ordersByStatus(): Promise<Array<{ status: string; count: number }>>;
  recent(limit: number): Promise<Order[]>;
  all(): Promise<Order[]>;
}

export interface ICouponRepository {
  findByCode(code: string): Promise<Coupon | null>;
  findAll(): Promise<Coupon[]>;
  create(input: CreateCouponInput): Promise<Coupon>;
  update(id: string, input: Partial<Coupon>): Promise<Coupon | null>;
  delete(id: string): Promise<boolean>;
  incrementUsage(code: string, userId?: string): Promise<void>;
  validate(code: string, subtotal: number, userId?: string): Promise<Coupon | null>;
  hasUserUsed(code: string, userId: string): Promise<boolean>;
}

export interface IWishlistRepository {
  getWishlist(userId: string): Promise<WishlistItem[]>;
  add(userId: string, productId: string): Promise<WishlistItem[]>;
  remove(userId: string, productId: string): Promise<WishlistItem[]>;
  has(userId: string, productId: string): Promise<boolean>;
}

export interface INewsletterRepository {
  subscribe(email: string): Promise<NewsletterSubscriber>;
  findByEmail(email: string): Promise<NewsletterSubscriber | null>;
}

export interface ITestimonialRepository {
  findAll(): Promise<Testimonial[]>;
}
