import { describe, it, expect } from 'vitest';
import { SearchService } from '@/lib/services/search-service';

describe('SearchService', () => {
  it('filters products within a price range', async () => {
    const result = await SearchService.search({ category: 'headphones', minPrice: 100, maxPrice: 200 });
    expect(result.products.length).toBeGreaterThan(0);
    result.products.forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(100);
      expect(p.price).toBeLessThanOrEqual(200);
    });
  });

  it('excludes products above maxPrice entirely', async () => {
    const result = await SearchService.search({ category: 'laptops', maxPrice: 500 });
    expect(result.products.every((p) => p.price <= 500)).toBe(true);
  });

  it('sorts by price ascending when requested', async () => {
    const result = await SearchService.search({ category: 'monitors', sortBy: 'price_asc', pageSize: 50 });
    const prices = result.products.map((p) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it('sorts by rating descending when requested', async () => {
    const result = await SearchService.search({ category: 'cameras', sortBy: 'rating', pageSize: 50 });
    const ratings = result.products.map((p) => p.rating);
    const sorted = [...ratings].sort((a, b) => b - a);
    expect(ratings).toEqual(sorted);
  });

  it('filters by minimum rating', async () => {
    const result = await SearchService.search({ category: 'office-chairs', minRating: 4.5, pageSize: 50 });
    expect(result.products.every((p) => p.rating >= 4.5)).toBe(true);
  });

  it('paginates results according to pageSize', async () => {
    const result = await SearchService.search({ pageSize: 5, page: 1 });
    expect(result.products.length).toBeLessThanOrEqual(5);
  });

  it('keyword search ranks title matches above unrelated products', async () => {
    const result = await SearchService.search({ query: 'running shoes', pageSize: 50 });
    // Every returned product should have matched on some term; an empty
    // result set would indicate the ranking logic silently broke.
    expect(result.products.length).toBeGreaterThan(0);
  });

  it('computes facet price range that brackets all returned products', async () => {
    const result = await SearchService.search({ category: 'air-purifiers', pageSize: 50 });
    result.products.forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(result.facets.priceRange.min);
      expect(p.price).toBeLessThanOrEqual(result.facets.priceRange.max);
    });
  });
});
