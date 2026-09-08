import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { ProductService } from '@/lib/services/product-service';
import { PriceService } from '@/lib/services/price-service';
import { RatingStars } from '@/components/product/rating-stars';
import { PriceTag } from '@/components/product/price-tag';
import { AvailabilityBadge } from '@/components/product/availability-badge';
import { SaveButton } from '@/components/product/save-button';
import { CompareCheckbox } from '@/components/product/compare-checkbox';
import { PriceHistoryChart } from '@/components/charts/price-history-chart';
import { MerchantOfferList } from '@/components/product/merchant-offer-list';
import { ProductGrid } from '@/components/search/product-grid';
import { formatPrice } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: { id: string }; // slug, kept as `id` to match /products/[id] per spec
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await ProductService.getBySlug(params.id);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.title,
    description: `${product.title} by ${product.brand} — ${formatPrice(product.price, product.currency)}. Compare specs, prices and merchants on CARTWISE.`,
    openGraph: { title: product.title, description: product.description, images: [product.imageUrl] },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await ProductService.getBySlug(params.id);
  if (!product) notFound();

  const insight = PriceService.getInsight(product);
  const similar = await ProductService.getSimilar(product, 4);
  const changeSummary = PriceService.formatChangeSummary(insight);
  const TrendIcon = insight.changeVsThirtyDaysAgoPct < -1 ? TrendingDown : insight.changeVsThirtyDaysAgoPct > 1 ? TrendingUp : Minus;

  return (
    <div className="container py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-md border border-ink-200 bg-ink-50">
            <Image src={product.imageUrl} alt={product.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {product.images.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-sm border border-ink-200 bg-ink-50">
                <Image src={img} alt={`${product.title} view ${i + 1}`} fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div>
          {product.isDemo && <Badge variant="neutral" className="mb-2">Demo listing</Badge>}
          <p className="text-xs uppercase tracking-wide text-ink-400">{product.brand}</p>
          <h1 className="mt-1 font-display text-2xl text-ink-950">{product.title}</h1>
          <div className="mt-2"><RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" /></div>

          <div className="mt-4 flex items-center gap-3">
            <PriceTag price={product.price} previousPrice={product.previousPrice} currency={product.currency} />
            <AvailabilityBadge availability={product.availability} />
          </div>

          <p className="mt-4 text-sm text-ink-600">{product.description}</p>

          <div className="mt-5 flex items-center gap-2">
            <SaveButton productId={product.id} />
            <CompareCheckbox productId={product.id} />
          </div>

          <div className="mt-6 rounded-md border border-ink-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <TrendIcon className={`h-4 w-4 ${insight.changeVsThirtyDaysAgoPct < -1 ? 'text-good-600' : insight.changeVsThirtyDaysAgoPct > 1 ? 'text-bad-500' : 'text-ink-400'}`} />
              <p className="text-sm font-medium text-ink-900">{changeSummary}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-ink-500">
              <div><p className="text-sm font-semibold text-ink-900">{formatPrice(insight.currentPrice, product.currency)}</p>Current</div>
              <div><p className="text-sm font-semibold text-good-600">{formatPrice(insight.lowestRecordedPrice, product.currency)}</p>Lowest ever</div>
              <div><p className="text-sm font-semibold text-ink-900">{formatPrice(insight.highestRecordedPrice, product.currency)}</p>Highest</div>
            </div>
            <div className="mt-4"><PriceHistoryChart history={insight.history} currency={product.currency} /></div>
            <p className="mt-2 text-[11px] text-ink-400">Demo price history — synthetic data generated for this listing.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-lg text-ink-950">Specifications</h2>
          <dl className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
            {product.specifications.map((s) => (
              <div key={s.key} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <dt className="text-ink-500">{s.label}</dt>
                <dd className="font-medium text-ink-900">{s.value}{s.unit ?? ''}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mb-3 mt-6 font-display text-lg text-ink-950">Features</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {product.features.map((f) => (
              <li key={f} className="rounded-sm border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700">{f}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg text-ink-950">Available at</h2>
          <MerchantOfferList productId={product.id} offers={product.offers} />
        </section>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-lg text-ink-950">Similar products</h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}
