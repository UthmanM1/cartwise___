import { describe, it, expect } from 'vitest';
import { MerchantService } from '@/lib/services/merchant-service';
import { ProductService } from '@/lib/services/product-service';

describe('MerchantService', () => {
  it('sorts offers by ascending price', async () => {
    const products = await ProductService.getByCategory('monitors');
    const product = products[0]!;
    const sorted = MerchantService.sortOffersByPrice(product.offers);
    const prices = sorted.map((o) => o.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('getBestOffer returns the cheapest available offer', async () => {
    const products = await ProductService.getByCategory('cameras');
    const product = products[0]!;
    const best = MerchantService.getBestOffer(product);
    product.offers.forEach((o) => expect(best.price).toBeLessThanOrEqual(o.price));
  });

  it('trackClick in demo mode does not persist but returns a defined result', async () => {
    const result = await MerchantService.trackClick({
      productId: 'p-test',
      merchantId: 'm-test',
      source: 'search',
    });
    expect(result).toHaveProperty('tracked');
  });

  it('formats freshness for a recent timestamp in minutes', () => {
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    expect(MerchantService.formatFreshness(oneMinuteAgo)).toMatch(/min ago/);
  });

  it('formats freshness for an older timestamp in hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600_000).toISOString();
    expect(MerchantService.formatFreshness(twoHoursAgo)).toMatch(/h ago/);
  });
});
