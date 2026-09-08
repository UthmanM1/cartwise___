import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';

export function ProductGrid({ products, savedIds = [] }: { products: Product[]; savedIds?: string[] }) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} saved={savedIds.includes(p.id)} />
      ))}
    </div>
  );
}
