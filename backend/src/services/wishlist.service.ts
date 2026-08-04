import { repositories } from '../repositories/container';
import { NotFoundError } from '../utils/error';
import { Product } from '../types';

export const WishlistService = {
  async list(userId: string): Promise<Product[]> {
    const items = await repositories.wishlist.getWishlist(userId);
    const products = await repositories.products.findByIds(items.map((i) => i.productId));
    // Preserve order added
    return items
      .map((i) => products.find((p) => p.id === i.productId))
      .filter((p): p is Product => Boolean(p));
  },

  async toggle(userId: string, productId: string): Promise<{ added: boolean; products: Product[] }> {
    const product = await repositories.products.findById(productId);
    if (!product) throw new NotFoundError('Product');

    const has = await repositories.wishlist.has(userId, productId);
    if (has) {
      await repositories.wishlist.remove(userId, productId);
    } else {
      await repositories.wishlist.add(userId, productId);
    }

    const products = await this.list(userId);
    return { added: !has, products };
  },

  async remove(userId: string, productId: string): Promise<Product[]> {
    await repositories.wishlist.remove(userId, productId);
    return this.list(userId);
  },

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    return repositories.wishlist.has(userId, productId);
  },
};
