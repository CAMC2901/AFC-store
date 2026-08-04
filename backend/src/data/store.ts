import { hashPassword } from '../utils/password';
import { randomId } from '../utils/helpers';
import { categoriesSeed } from '../data/categories';
import { productsSeed } from '../data/products';
import { usersSeed } from '../data/users';
import { couponsSeed, testimonialsSeed } from '../data/coupons';
import {
  Address,
  Category,
  Coupon,
  NewsletterSubscriber,
  Order,
  Product,
  Testimonial,
  User,
  WishlistItem,
} from '../types';

/**
 * In-memory data store.
 *
 * This acts as a stand-in for Prisma/PostgreSQL. Each collection mirrors a
 * table in the Prisma blueprint (see src/config/database.ts). Repositories
 * read/write through this store; swapping to Prisma means replacing the
 * repository implementations only.
 */
export interface Store {
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  wishlist: WishlistItem[];
  testimonials: Testimonial[];
  newsletter: NewsletterSubscriber[];
  /** Cart keyed by userId -> line items */
  carts: Record<string, Array<{ productId: string; quantity: number }>>;
  refreshTokens: Map<string, string>;
}

let store: Store | null = null;

export const getStore = (): Store => {
  if (!store) {
    throw new Error('Store not initialized. Call initStore() first.');
  }
  return store;
};

export async function initStore(): Promise<Store> {
  if (store) return store;

  const now = new Date().toISOString();

  const users: User[] = [];
  for (const u of usersSeed) {
    const id = `usr_${users.length + 1}`;
    users.push({
      id,
      email: u.email.toLowerCase(),
      passwordHash: await hashPassword(u.plainPassword),
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      role: u.role,
      isActive: true,
      refreshToken: null,
      addresses: u.addresses.map((a, i) => ({
        id: `adr_${id}_${i + 1}`,
        ...a,
      })),
      createdAt: now,
      updatedAt: now,
    });
  }

  store = {
    users,
    categories: [...categoriesSeed],
    products: [...productsSeed],
    orders: [],
    coupons: [...couponsSeed],
    wishlist: [],
    testimonials: [...testimonialsSeed],
    newsletter: [],
    carts: {},
    refreshTokens: new Map(),
  };

  return store;
}

/** Helper to mint ids in a way that mirrors cuid() from Prisma. */
export const newId = (prefix: string): string => randomId(prefix);

/** Helper to count product per category (used to enrich category payloads). */
export const productCountByCategory = (categoryId: string): number =>
  getStore().products.filter((p) => p.categoryId === categoryId && p.isActive).length;

/** Resolve an Address payload from a User. */
export const findAddress = (user: User, addressId: string): Address | undefined =>
  user.addresses.find((a) => a.id === addressId);
