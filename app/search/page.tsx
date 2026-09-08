import type { Metadata } from 'next';
import { SearchService } from '@/lib/services/search-service';
import { FilterPanel } from '@/components/search/filter-panel';
import { MobileFilterDrawer } from '@/components/search/mobile-filter-drawer';
import { ProductGrid } from '@/components/search/product-grid';
import { SortSelect } from '@/components/search/sort-select';
import { EmptySearchState } from '@/components/search/empty-state';
import { CompareBar } from '@/components/compare/compare-bar';
import { RecommendedForYou } from '@/components/product/recommended-for-you';
import type { Availability, CategorySlug, SearchFilters } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Search products',
  description: 'Search and filter across laptops, smartphones, headphones, monitors and more.',
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function toArray(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

function parseFilters(sp: PageProps['searchParams']): SearchFilters {
  return {
    query: typeof sp.query === 'string' ? sp.query : undefined,
    category: typeof sp.category === 'string' ? (sp.category as CategorySlug) : undefined,
    brands: toArray(sp.brands),
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    availability: toArray(sp.availability) as Availability[] | undefined,
    features: toArray(sp.features),
    merchants: toArray(sp.merchants),
    sortBy: (sp.sortBy as SearchFilters['sortBy']) ?? 'relevance',
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 24,
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const filters = parseFilters(searchParams);
  const result = await SearchService.search(filters);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="container py-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl text-ink-950">
            {filters.query ? `Results for "${filters.query}"` : 'All products'}
          </h1>
          <p className="text-sm text-ink-500">{result.total} product{result.total === 1 ? '' : 's'} found</p>
        </div>
        <div className="flex items-center gap-2">
          <MobileFilterDrawer facets={result.facets} />
          <SortSelect />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-md border border-ink-200 bg-white p-4">
              <FilterPanel facets={result.facets} />
            </div>
            {filters.category && <RecommendedForYou category={filters.category} />}
          </div>
        </aside>

        <div>
          {result.products.length === 0 ? (
            <EmptySearchState query={filters.query} />
          ) : (
            <>
              <ProductGrid products={result.products} />
              {totalPages > 1 && (
                <Pagination currentPage={result.page} totalPages={totalPages} searchParams={searchParams} />
              )}
            </>
          )}
        </div>
      </div>

      <CompareBar />
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: PageProps['searchParams'];
}) {
  function hrefFor(page: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (k === 'page') return;
      if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
      else if (v !== undefined) params.set(k, v);
    });
    params.set('page', String(page));
    return `/search?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1 text-sm">
      {pages.map((p, i) => (
        <a
          key={p}
          href={hrefFor(p)}
          className={`rounded-sm px-3 py-1.5 ${p === currentPage ? 'bg-ink-950 text-paper' : 'text-ink-600 hover:bg-ink-100'}`}
        >
          {i > 0 && pages[i - 1] !== p - 1 ? '… ' : ''}
          {p}
        </a>
      ))}
    </nav>
  );
}
