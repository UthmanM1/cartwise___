import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Scale, LineChart, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { HeroSearch } from '@/components/search/hero-search';
import { CATEGORIES } from '@/lib/data/category-list';
import { ProductService } from '@/lib/services/product-service';
import { RatingStars } from '@/components/product/rating-stars';
import { PriceTag } from '@/components/product/price-tag';

export default async function HomePage() {
  const [trending, topRated, drops] = await Promise.all([
    ProductService.getTrending(4),
    ProductService.getTopRated(4),
    ProductService.getRecentPriceDrops(4),
  ]);

  return (
    <>
      <section className="border-b border-ink-200 bg-gradient-to-b from-ink-50 to-paper py-16 sm:py-24">
        <div className="container text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-signal">Compare smarter. Buy with confidence.</p>
          <h1 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-ink-950 sm:text-5xl">
            Find the right product without the research overload.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-600 sm:text-base">
            Search, filter and compare real specifications side by side — then ask CARTWISE which one actually fits you.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
        </div>
      </section>

      <section className="container py-14">
        <h2 className="mb-6 font-display text-xl text-ink-950">Popular categories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/search?category=${c.slug}`}
              className="group flex flex-col justify-between rounded-md border border-ink-200 bg-white p-4 transition-colors hover:border-ink-900"
            >
              <span className="font-medium text-ink-900">{c.name}</span>
              <span className="mt-3 flex items-center gap-1 text-xs text-ink-500 group-hover:text-signal">
                Browse <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-ink-200 bg-ink-50 py-14">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink-950">Trending comparisons</h2>
            <Link href="/search" className="text-sm text-signal hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {trending.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="rounded-md border border-ink-200 bg-white p-3">
                <div className="relative mb-2 aspect-square overflow-hidden rounded-sm bg-ink-50">
                  <Image src={p.imageUrl} alt={p.title} fill sizes="200px" className="object-cover" />
                </div>
                <p className="line-clamp-1 text-xs font-medium text-ink-900">{p.title}</p>
                <div className="mt-1"><PriceTag price={p.price} previousPrice={p.previousPrice} /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14">
        <h2 className="mb-8 text-center font-display text-xl text-ink-950">How CARTWISE works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <HowStep icon={Search} title="Search" copy="Describe what you need in plain language — CARTWISE matches it against structured product data." />
          <HowStep icon={Scale} title="Compare" copy="Line up up to 4 products in a single table with the best price, rating and specs highlighted." />
          <HowStep icon={Sparkles} title="Ask CARTWISE" copy="Ask a question in your own words. The AI answers using only the specs shown — never invented facts." />
          <HowStep icon={Heart} title="Track & save" copy="Save products, build watchlists, and set a target price to track drops over time." />
        </div>
      </section>

      <section className="border-t border-ink-200 bg-ink-950 py-14 text-ink-100">
        <div className="container grid gap-10 md:grid-cols-2">
          <div>
            <LineChart className="mb-3 h-6 w-6 text-signal" />
            <h3 className="font-display text-lg text-paper">Price intelligence</h3>
            <p className="mt-2 text-sm text-ink-400">
              Every product page shows a full price history, the lowest price ever recorded, and how much prices moved
              in the last 30 days — built from demo historical data that behaves like a real feed would.
            </p>
          </div>
          <div>
            <Sparkles className="mb-3 h-6 w-6 text-signal" />
            <h3 className="font-display text-lg text-paper">AI comparison, grounded in real data</h3>
            <p className="mt-2 text-sm text-ink-400">
              CARTWISE's AI never invents a spec or a price. Every "Ask CARTWISE" answer names the exact products it
              used, so you can check the numbers yourself.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-950">Recent price drops</h2>
          <Link href="/search?sortBy=price_asc" className="text-sm text-signal hover:underline">See more</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(drops.length ? drops : topRated).map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="rounded-md border border-ink-200 bg-white p-3">
              <div className="relative mb-2 aspect-square overflow-hidden rounded-sm bg-ink-50">
                <Image src={p.imageUrl} alt={p.title} fill sizes="200px" className="object-cover" />
              </div>
              <p className="line-clamp-1 text-xs font-medium text-ink-900">{p.title}</p>
              <RatingStars rating={p.rating} />
              <div className="mt-1"><PriceTag price={p.price} previousPrice={p.previousPrice} /></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function HowStep({ icon: Icon, title, copy }: { icon: React.ComponentType<{ className?: string }>; title: string; copy: string }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-5">
      <Icon className="mb-3 h-5 w-5 text-signal" />
      <h3 className="font-medium text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-500">{copy}</p>
    </div>
  );
}
