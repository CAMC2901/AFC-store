import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { RevealGroup, RevealItem } from '@/components/ui/Reveal';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <RevealGroup className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <RevealItem key={product.id}>
          <ProductCard product={product} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
