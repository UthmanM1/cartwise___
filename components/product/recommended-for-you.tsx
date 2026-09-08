import Image from 'next/image';
import Link from 'next/link';
import { RecommendationService } from '@/lib/services/recommendation-service';
import { PriceTag } from '@/components/product/price-tag';
import type { CategorySlug, UserPreferences } from '@/lib/types';

export async function RecommendedForYou({ category, preferences }: { category: CategorySlug; preferences?: UserPreferences }) {
  const recs = await RecommendationService.recommend(category, preferences, 3);
  if (recs.length === 0) return null;

  return (
    <section className="rounded-md border border-ink-200 bg-white p-4">
      <h2 className="mb-3 font-display text-base text-ink-950">Recommended for you</h2>
      <div className="space-y-4">
        {recs.map(({ product, score }) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="flex gap-3 rounded-sm border border-ink-100 p-3 hover:border-ink-300">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-ink-50">
              <Image src={product.imageUrl} alt={product.title} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="line-clamp-1 text-sm font-medium text-ink-900">{product.title}</p>
                <span className="shrink-0 rounded-sm bg-good-50 px-1.5 py-0.5 text-xs font-semibold text-good-600">{score.overallScore}% fit</span>
              </div>
              <PriceTag price={product.price} previousPrice={product.previousPrice} />
              <ul className="mt-1 space-y-0.5 text-[11px] text-ink-500">
                {score.reasons.slice(0, 2).map((r) => <li key={r}>+ {r}</li>)}
                {score.tradeOffs.slice(0, 1).map((t) => <li key={t} className="text-warn-500">− {t}</li>)}
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
