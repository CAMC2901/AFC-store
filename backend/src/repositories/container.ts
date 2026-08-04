/**
 * Repository container.
 *
 * To switch persistence to PostgreSQL/Prisma, implement the interfaces from
 * ./types using PrismaClient and return them from this module. Everything
 * else (services, controllers, routes) stays untouched.
 */
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

export const repositories: Repositories = {
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
