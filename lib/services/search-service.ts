import { ProductService } from '@/lib/services/product-service';
import type { Product, SearchFilters, SearchResult, SearchFacets, Availability } from '@/lib/types';

/**
 * SearchService owns keyword relevance scoring, filtering, faceting and
 * sorting. It never touches raw category generation — it always reads
 * through ProductService, so live-mode swaps (e.g. Postgres full-text
 * search / pg_trgm) only need to change ProductService.getAll(), or this
 * class can be rewritten to push filters down into a SQL query directly
 * for performance at scale.
 */
export class SearchService {
  static async search(filters: SearchFilters): Promise<SearchResult> {
    let products = await ProductService.getAll();

    if (filters.category) {
      products = products.filter((p) => p.categorySlug === filters.category);
    }

    if (filters.query && filters.query.trim().length > 0) {
      products = this.rankByRelevance(products, filters.query.trim());
    }

    if (filters.brands && filters.brands.length > 0) {
      const brandSet = new Set(filters.brands.map((b) => b.toLowerCase()));
      products = products.filter((p) => brandSet.has(p.brand.toLowerCase()));
    }

    if (filters.minPrice !== undefined) {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined) {
      products = products.filter((p) => p.rating >= filters.minRating!);
    }

    if (filters.availability && filters.availability.length > 0) {
      const availSet = new Set(filters.availability);
      products = products.filter((p) => availSet.has(p.availability));
    }

    if (filters.features && filters.features.length > 0) {
      products = products.filter((p) => filters.features!.every((f) => p.features.includes(f)));
    }

    if (filters.merchants && filters.merchants.length > 0) {
      const merchantSet = new Set(filters.merchants);
      products = products.filter((p) => p.offers.some((o) => merchantSet.has(o.merchant.id)));
    }

    // Facets are computed on the filtered-by-everything-except-self set in a
    // full implementation; for simplicity and predictability in demo mode we
    // compute them on the post-filter set, which still gives useful counts.
    const facets = this.computeFacets(products);

    products = this.sort(products, filters.sortBy ?? 'relevance');

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 24;
    const total = products.length;
    const start = (page - 1) * pageSize;
    const paged = products.slice(start, start + pageSize);

    return { products: paged, total, page, pageSize, facets };
  }

  private static rankByRelevance(products: Product[], query: string): Product[] {
    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);

    const scored = products.map((p) => {
      const haystack = `${p.title} ${p.brand} ${p.description} ${p.features.join(' ')}`.toLowerCase();
      let score = 0;
      if (p.title.toLowerCase().includes(q)) score += 10;
      if (p.brand.toLowerCase() === q) score += 8;
      terms.forEach((t) => {
        if (haystack.includes(t)) score += 2;
        if (p.title.toLowerCase().includes(t)) score += 3;
      });
      // "under £X" style queries — extract a price ceiling and reward products under it.
      const underMatch = q.match(/under\s*£?(\d+)/);
      if (underMatch) {
        const ceiling = Number(underMatch[1]);
        if (p.price <= ceiling) score += 6;
        else score -= 4;
      }
      return { product: p, score };
    });

    return scored
      .filter((s) => s.score > 0 || terms.length === 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.product);
  }

  private static sort(products: Product[], sortBy: NonNullable<SearchFilters['sortBy']>): Product[] {
    const arr = [...products];
    switch (sortBy) {
      case 'price_asc':
        return arr.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return arr.sort((a, b) => b.price - a.price);
      case 'rating':
        return arr.sort((a, b) => b.rating - a.rating);
      case 'value':
        // Simple deterministic "value" heuristic: rating per £100 spent.
        return arr.sort((a, b) => b.rating / (b.price / 100) - a.rating / (a.price / 100));
      case 'relevance':
      default:
        return arr;
    }
  }

  private static computeFacets(products: Product[]): SearchFacets {
    const brandCounts = new Map<string, number>();
    const availCounts = new Map<Availability, number>();
    const merchantCounts = new Map<string, number>();
    const featureCounts = new Map<string, number>();
    const ratingBuckets = [4.5, 4, 3.5, 3];
    let min = Infinity;
    let max = 0;

    products.forEach((p) => {
      brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
      availCounts.set(p.availability, (availCounts.get(p.availability) ?? 0) + 1);
      p.offers.forEach((o) => merchantCounts.set(o.merchant.name, (merchantCounts.get(o.merchant.name) ?? 0) + 1));
      p.features.forEach((f) => featureCounts.set(f, (featureCounts.get(f) ?? 0) + 1));
      min = Math.min(min, p.price);
      max = Math.max(max, p.price);
    });

    return {
      brands: Array.from(brandCounts.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count),
      priceRange: { min: Number.isFinite(min) ? Math.floor(min) : 0, max: Math.ceil(max) },
      ratings: ratingBuckets.map((value) => ({ value, count: products.filter((p) => p.rating >= value).length })),
      availability: Array.from(availCounts.entries()).map(([value, count]) => ({ value, count })),
      merchants: Array.from(merchantCounts.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count),
      features: Array.from(featureCounts.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, 12),
    };
  }
}
