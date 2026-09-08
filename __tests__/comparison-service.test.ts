import { describe, it, expect } from 'vitest';
import { ComparisonService } from '@/lib/services/comparison-service';
import { MAX_COMPARE_PRODUCTS } from '@/lib/constants';
import { ProductService } from '@/lib/services/product-service';

describe('ComparisonService', () => {
  it('caps comparisons at MAX_COMPARE_PRODUCTS even if more ids are given', async () => {
    const all = await ProductService.getByCategory('laptops');
    const ids = all.slice(0, 6).map((p) => p.id);
    const result = await ComparisonService.compare(ids);
    expect(result.products.length).toBeLessThanOrEqual(MAX_COMPARE_PRODUCTS);
  });

  it('highlights the cheapest product as best price', async () => {
    const all = await ProductService.getByCategory('headphones');
    const chosen = all.slice(0, 3);
    const result = await ComparisonService.compare(chosen.map((p) => p.id));
    const cheapest = [...chosen].sort((a, b) => a.price - b.price)[0]!;
    const priceHighlight = result.highlights.find((h) => h.key === 'price');
    expect(priceHighlight?.bestProductId).toBe(cheapest.id);
  });

  it('highlights the highest-rated product as best rating', async () => {
    const all = await ProductService.getByCategory('smartphones');
    const chosen = all.slice(0, 3);
    const result = await ComparisonService.compare(chosen.map((p) => p.id));
    const topRated = [...chosen].sort((a, b) => b.rating - a.rating)[0]!;
    const ratingHighlight = result.highlights.find((h) => h.key === 'rating');
    expect(ratingHighlight?.bestProductId).toBe(topRated.id);
  });

  it('returns no highlights for fewer than 2 products', async () => {
    const all = await ProductService.getByCategory('monitors');
    const result = await ComparisonService.compare([all[0]!.id]);
    expect(result.highlights).toHaveLength(0);
  });

  it('picks the lightest product as best for a lower-is-better spec (weight)', async () => {
    const all = await ProductService.getByCategory('running-shoes');
    const chosen = all.slice(0, 4);
    const result = await ComparisonService.compare(chosen.map((p) => p.id));
    const weightHighlight = result.highlights.find((h) => h.key === 'weight_g');
    if (weightHighlight) {
      const lightest = [...chosen].sort(
        (a, b) => (a.specifications.find((s) => s.key === 'weight_g')?.numericValue ?? Infinity) -
          (b.specifications.find((s) => s.key === 'weight_g')?.numericValue ?? Infinity)
      )[0]!;
      expect(weightHighlight.bestProductId).toBe(lightest.id);
    }
  });
});
