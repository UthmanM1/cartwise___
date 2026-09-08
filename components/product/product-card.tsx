import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { RatingStars } from '@/components/product/rating-stars';
import { PriceTag } from '@/components/product/price-tag';
import { AvailabilityBadge } from '@/components/product/availability-badge';
import { SaveButton } from '@/components/product/save-button';
import { CompareCheckbox } from '@/components/product/compare-checkbox';
import { MerchantService } from '@/lib/services/merchant-service';

export function ProductCard({ product, saved = false }: { product: Product; saved?: boolean }) {
  const bestOffer = MerchantService.getBestOffer(product);
  const topSpecs = product.specifications.slice(0, 2);

  return (
    <div className="group relative flex flex-col rounded-md border border-ink-200 bg-white transition-shadow hover:shadow-pop">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-md bg-ink-50">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-2 top-2">
            <AvailabilityBadge availability={product.availability} />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-ink-400">{product.brand}</p>
            <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-signal">
              {product.title}
            </Link>
          </div>
          <SaveButton productId={product.id} initiallySaved={saved} />
        </div>

        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

        {topSpecs.length > 0 && (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
            {topSpecs.map((s) => (
              <li key={s.key}>
                {s.label}: <span className="text-ink-700">{s.value}{s.unit ?? ''}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <PriceTag price={product.price} previousPrice={product.previousPrice} currency={product.currency} />
            <p className="mt-0.5 text-[11px] text-ink-400">at {bestOffer.merchant.name}</p>
          </div>
          <CompareCheckbox productId={product.id} />
        </div>
      </div>
    </div>
  );
}
