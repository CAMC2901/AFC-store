import { getStore, newId } from '../data/store';
import { Order, Product, User } from '../types';
import {
  Address,
  Category,
  Coupon,
  NewsletterSubscriber,
  PaginatedResult,
  ProductFilters,
  Testimonial,
  WishlistItem,
} from '../types';
import {
  CreateAddressInput,
  CreateCouponInput,
  CreateOrderInput,
  CreateUserInput,
  ICategoryRepository,
  ICartRepository,
  ICouponRepository,
  INewsletterRepository,
  IOrderRepository,
  IProductRepository,
  ITestimonialRepository,
  IUserRepository,
  IWishlistRepository,
  UpdateAddressInput,
  UpdateUserInput,
} from './types';
import { clamp, slugify, toNumber } from '../utils/helpers';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants';

const sanitizeUser = (user: User) => {
  const { passwordHash, refreshToken: _rt, ...safe } = user;
  return safe;
};

export class InMemoryUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return getStore().users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return getStore().users.find((u) => u.email === email.toLowerCase()) ?? null;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<User>> {
    const { users } = getStore();
    const total = users.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = users.slice(start, start + limit);
    return {
      items,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async create(input: CreateUserInput): Promise<User> {
    const store = getStore();
    const now = new Date().toISOString();
    const user: User = {
      id: newId('usr'),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role ?? 'CUSTOMER',
      isActive: true,
      refreshToken: null,
      addresses: [],
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(user);
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    if (input.firstName !== undefined) user.firstName = input.firstName;
    if (input.lastName !== undefined) user.lastName = input.lastName;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.email !== undefined) user.email = input.email.toLowerCase();
    if (input.isActive !== undefined) user.isActive = input.isActive;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  async setRefreshToken(id: string, token: string | null): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    user.refreshToken = token;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  async addAddress(userId: string, input: CreateAddressInput): Promise<Address[]> {
    const user = await this.findById(userId);
    if (!user) return [];
    const address: Address = {
      id: newId('adr'),
      label: input.label,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      isDefault: input.isDefault ?? user.addresses.length === 0,
    };
    if (address.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push(address);
    user.updatedAt = new Date().toISOString();
    return [...user.addresses];
  }

  async updateAddress(userId: string, addressId: string, input: UpdateAddressInput): Promise<Address[]> {
    const user = await this.findById(userId);
    if (!user) return [];
    const target = user.addresses.find((a) => a.id === addressId);
    if (!target) return user.addresses;
    Object.assign(target, input);
    if (input.isDefault) user.addresses.forEach((a) => (a.id !== addressId ? (a.isDefault = false) : a));
    user.updatedAt = new Date().toISOString();
    return [...user.addresses];
  }

  async removeAddress(userId: string, addressId: string): Promise<Address[]> {
    const user = await this.findById(userId);
    if (!user) return [];
    const remaining = user.addresses.filter((a) => a.id !== addressId);
    user.addresses = remaining;
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    user.updatedAt = new Date().toISOString();
    return [...user.addresses];
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address[]> {
    const user = await this.findById(userId);
    if (!user) return [];
    if (!user.addresses.some((a) => a.id === addressId)) return user.addresses;
    user.addresses.forEach((a) => (a.isDefault = a.id === addressId));
    user.updatedAt = new Date().toISOString();
    return [...user.addresses];
  }

  async count(): Promise<number> {
    return getStore().users.length;
  }
}

export class InMemoryProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    return getStore().products.find((p) => p.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return getStore().products.find((p) => p.slug === slug) ?? null;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return getStore().products.filter((p) => ids.includes(p.id) && p.isActive);
  }

  async findAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    const store = getStore();
    let items = store.products.filter((p) => p.isActive);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    if (filters.categorySlug) {
      items = items.filter((p) => p.categorySlug === filters.categorySlug);
    }
    if (filters.minPrice !== undefined) items = items.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) items = items.filter((p) => p.price <= filters.maxPrice!);
    if (filters.brand) items = items.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
    if (filters.material) {
      const m = filters.material.toLowerCase();
      items = items.filter((p) => (p.material ?? '').toLowerCase().includes(m));
    }
    if (filters.color) {
      const c = filters.color.toLowerCase();
      items = items.filter((p) => (p.color ?? '').toLowerCase().includes(c));
    }
    if (filters.inStockOnly) items = items.filter((p) => p.stock > 0);
    if (filters.featuredOnly) items = items.filter((p) => p.featured);

    switch (filters.sortBy) {
      case 'price_asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        items.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      default:
        break;
    }

    const total = items.length;
    const page = clamp(toNumber(filters.page, 1), 1, Number.MAX_SAFE_INTEGER);
    const limit = clamp(toNumber(filters.limit, DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return {
      items: paged,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async findRelated(product: Product, limit = 4): Promise<Product[]> {
    const store = getStore();
    const related = store.products.filter(
      (p) =>
        p.id !== product.id &&
        p.isActive &&
        (p.categoryId === product.categoryId || p.tags.some((t) => product.tags.includes(t)))
    );
    const dedup = Array.from(new Map(related.map((p) => [p.id, p])).values());
    return dedup.sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  async create(input: Partial<Product>): Promise<Product> {
    const store = getStore();
    const now = new Date().toISOString();
    const product: Product = {
      id: newId('prd'),
      name: input.name ?? 'Untitled',
      slug: input.slug ?? slugify(input.name ?? 'untitled'),
      description: input.description ?? '',
      longDescription: input.longDescription,
      categoryId: input.categoryId ?? 'cat_decor',
      categorySlug: input.categorySlug ?? 'decor',
      categoryName: input.categoryName ?? 'Decor & Accents',
      brand: input.brand ?? 'AFC Studio',
      price: input.price ?? 0,
      compareAtPrice: input.compareAtPrice,
      currency: input.currency ?? 'USD',
      images: input.images ?? [],
      sku: input.sku ?? newId('SKU').toUpperCase(),
      stock: input.stock ?? 0,
      material: input.material,
      color: input.color,
      dimensions: input.dimensions,
      weight: input.weight,
      featured: input.featured ?? false,
      isActive: input.isActive ?? true,
      rating: input.rating ?? 0,
      reviewCount: input.reviewCount ?? 0,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    store.products.push(product);
    return product;
  }

  async update(id: string, input: Partial<Product>): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;
    Object.assign(product, input, { id: product.id, updatedAt: new Date().toISOString() });
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    store.products.splice(index, 1);
    return true;
  }

  async adjustStock(id: string, delta: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;
    product.stock = Math.max(0, product.stock + delta);
    product.updatedAt = new Date().toISOString();
    return product;
  }

  async count(): Promise<number> {
    return getStore().products.filter((p) => p.isActive).length;
  }

  async minMaxPrice(): Promise<{ min: number; max: number }> {
    const prices = getStore().products.filter((p) => p.isActive).map((p) => p.price);
    if (prices.length === 0) return { min: 0, max: 1000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }

  async topSelling(limit: number): Promise<Product[]> {
    return [...getStore().products]
      .filter((p) => p.isActive)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit);
  }
}

export class InMemoryCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    return getStore().categories.find((c) => c.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return getStore().categories.find((c) => c.slug === slug) ?? null;
  }

  async findAll(): Promise<Category[]> {
    return [...getStore().categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async create(input: Partial<Category>): Promise<Category> {
    const store = getStore();
    const category: Category = {
      id: newId('cat'),
      name: input.name ?? 'Category',
      slug: input.slug ?? slugify(input.name ?? 'category'),
      description: input.description,
      imageUrl: input.imageUrl,
      sortOrder: input.sortOrder ?? 99,
    };
    store.categories.push(category);
    return category;
  }

  async update(id: string, input: Partial<Category>): Promise<Category | null> {
    const category = await this.findById(id);
    if (!category) return null;
    Object.assign(category, input, { id: category.id });
    return category;
  }

  async delete(id: string): Promise<boolean> {
    const store = getStore();
    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.categories.splice(index, 1);
    return true;
  }
}

export class InMemoryCartRepository implements ICartRepository {
  async getCart(userId: string): Promise<Array<{ productId: string; quantity: number }>> {
    return getStore().carts[userId] ?? [];
  }

  async saveCart(userId: string, items: Array<{ productId: string; quantity: number }>): Promise<void> {
    getStore().carts[userId] = items;
  }

  async clearCart(userId: string): Promise<void> {
    delete getStore().carts[userId];
  }
}

export class InMemoryOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    return getStore().orders.find((o) => o.id === id) ?? null;
  }

  async findByUser(userId: string, page: number, limit: number): Promise<PaginatedResult<Order>> {
    const orders = getStore().orders.filter((o) => o.userId === userId);
    const total = orders.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return {
      items: orders.slice(start, start + limit),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async findAll(page: number, limit: number, status?: string): Promise<PaginatedResult<Order>> {
    const orders = status ? getStore().orders.filter((o) => o.status === status) : getStore().orders;
    const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return {
      items: sorted.slice(start, start + limit),
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const store = getStore();
    const now = new Date().toISOString();
    const order: Order = {
      id: newId('ord'),
      userId: input.userId,
      items: input.items.map((i) => ({ ...i })),
      subtotal: input.subtotal,
      shipping: input.shipping,
      discount: input.discount,
      tax: input.tax,
      total: input.total,
      couponCode: input.couponCode,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      contact: input.contact,
      createdAt: now,
      updatedAt: now,
    };
    store.orders.unshift(order);
    return order;
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;
    order.status = status as Order['status'];
    order.updatedAt = new Date().toISOString();
    return order;
  }

  async updatePaymentStatus(id: string, status: string): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;
    order.paymentStatus = status as Order['paymentStatus'];
    order.updatedAt = new Date().toISOString();
    return order;
  }

  async count(): Promise<number> {
    return getStore().orders.length;
  }

  async revenue(): Promise<number> {
    return getStore().orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);
  }

  async ordersByStatus(): Promise<Array<{ status: string; count: number }>> {
    const counts = new Map<string, number>();
    for (const o of getStore().orders) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    return Array.from(counts, ([status, count]) => ({ status, count }));
  }

  async recent(limit: number): Promise<Order[]> {
    return [...getStore().orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}

export class InMemoryCouponRepository implements ICouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    return getStore().coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) ?? null;
  }

  async findAll(): Promise<Coupon[]> {
    return [...getStore().coupons];
  }

  async create(input: CreateCouponInput): Promise<Coupon> {
    const store = getStore();
    const coupon: Coupon = {
      id: newId('cpn'),
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      minSubtotal: input.minSubtotal ?? 0,
      maxDiscount: input.maxDiscount,
      expiresAt: input.expiresAt,
      isActive: input.isActive ?? true,
      usageLimit: input.usageLimit,
      usedCount: 0,
    };
    store.coupons.push(coupon);
    return coupon;
  }

  async update(id: string, input: Partial<Coupon>): Promise<Coupon | null> {
    const coupon = getStore().coupons.find((c) => c.id === id) ?? null;
    if (!coupon) return null;
    Object.assign(coupon, input, { id: coupon.id });
    return coupon;
  }

  async delete(id: string): Promise<boolean> {
    const store = getStore();
    const index = store.coupons.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.coupons.splice(index, 1);
    return true;
  }

  async incrementUsage(code: string): Promise<void> {
    const coupon = await this.findByCode(code);
    if (coupon) coupon.usedCount += 1;
  }

  async validate(code: string, subtotal: number): Promise<Coupon | null> {
    const coupon = await this.findByCode(code);
    if (!coupon) return null;
    if (!coupon.isActive) return null;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) return null;
    if (subtotal < coupon.minSubtotal) return null;
    return coupon;
  }
}

export class InMemoryWishlistRepository implements IWishlistRepository {
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return getStore().wishlist.filter((w) => w.userId === userId);
  }

  async add(userId: string, productId: string): Promise<WishlistItem[]> {
    const store = getStore();
    const existing = store.wishlist.find((w) => w.userId === userId && w.productId === productId);
    if (!existing) {
      store.wishlist.push({ userId, productId, addedAt: new Date().toISOString() });
    }
    return this.getWishlist(userId);
  }

  async remove(userId: string, productId: string): Promise<WishlistItem[]> {
    const store = getStore();
    store.wishlist = store.wishlist.filter(
      (w) => !(w.userId === userId && w.productId === productId)
    );
    return this.getWishlist(userId);
  }

  async has(userId: string, productId: string): Promise<boolean> {
    return getStore().wishlist.some((w) => w.userId === userId && w.productId === productId);
  }
}

export class InMemoryNewsletterRepository implements INewsletterRepository {
  async subscribe(email: string): Promise<NewsletterSubscriber> {
    const store = getStore();
    const existing = store.newsletter.find((n) => n.email === email.toLowerCase());
    if (existing) return existing;
    const entry: NewsletterSubscriber = {
      id: newId('nws'),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    store.newsletter.push(entry);
    return entry;
  }

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return getStore().newsletter.find((n) => n.email === email.toLowerCase()) ?? null;
  }
}

export class InMemoryTestimonialRepository implements ITestimonialRepository {
  async findAll(): Promise<Testimonial[]> {
    return [...getStore().testimonials];
  }
}

export { sanitizeUser };
