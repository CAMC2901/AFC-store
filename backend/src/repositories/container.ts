import { env } from '../config/env';
import {
  ICartRepository,
  ICategoryRepository,
  ICouponRepository,
  INewsletterRepository,
  IOrderRepository,
  IProductRepository,
  ITestimonialRepository,
  IUserRepository,
  IWishlistRepository,
} from './types';
import {
  InMemoryCartRepository,
  InMemoryCategoryRepository,
  InMemoryCouponRepository,
  InMemoryNewsletterRepository,
  InMemoryOrderRepository,
  InMemoryProductRepository,
  InMemoryTestimonialRepository,
  InMemoryUserRepository,
  InMemoryWishlistRepository,
} from './index';
import {
  PrismaCartRepository,
  PrismaCategoryRepository,
  PrismaCouponRepository,
  PrismaNewsletterRepository,
  PrismaOrderRepository,
  PrismaProductRepository,
  PrismaTestimonialRepository,
  PrismaUserRepository,
  PrismaWishlistRepository,
} from './prisma';

export interface Repositories {
  users: IUserRepository;
  products: IProductRepository;
  categories: ICategoryRepository;
  carts: ICartRepository;
  orders: IOrderRepository;
  coupons: ICouponRepository;
  wishlist: IWishlistRepository;
  newsletter: INewsletterRepository;
  testimonials: ITestimonialRepository;
}

const buildRepositories = (): Repositories => {
  if (env.prismaEnabled) {
    console.log('[Repositories] Initializing Supabase/Prisma PostgreSQL persistence layer...');
    return {
      users: new PrismaUserRepository(),
      products: new PrismaProductRepository(),
      categories: new PrismaCategoryRepository(),
      carts: new PrismaCartRepository(),
      orders: new PrismaOrderRepository(),
      coupons: new PrismaCouponRepository(),
      wishlist: new PrismaWishlistRepository(),
      newsletter: new PrismaNewsletterRepository(),
      testimonials: new PrismaTestimonialRepository(),
    };
  }

  return {
    users: new InMemoryUserRepository(),
    products: new InMemoryProductRepository(),
    categories: new InMemoryCategoryRepository(),
    carts: new InMemoryCartRepository(),
    orders: new InMemoryOrderRepository(),
    coupons: new InMemoryCouponRepository(),
    wishlist: new InMemoryWishlistRepository(),
    newsletter: new InMemoryNewsletterRepository(),
    testimonials: new InMemoryTestimonialRepository(),
  };
};

export const repositories: Repositories = buildRepositories();
