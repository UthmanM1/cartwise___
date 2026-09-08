import { describe, it, expect } from 'vitest';
import { PriceService } from '@/lib/services/price-service';
import { ProductService } from '@/lib/services/product-service';

describe('PriceService', () => {
  it('evaluates an alert as triggered when current price is at or below target', () => {
    expect(PriceService.evaluateAlert(299, 300)).toBe('triggered');
    expect(PriceService.evaluateAlert(300, 300)).toBe('triggered');
  });

  it('evaluates an alert as waiting when current price is above target', () => {
    expect(PriceService.evaluateAlert(320, 300)).toBe('waiting');
  });

  it('evaluates an alert as disabled when no target price is set', () => {
    expect(PriceService.evaluateAlert(320, undefined)).toBe('disabled');
  });

  it('computes an insight whose lowest recorded price never exceeds the highest', async () => {
    const products = await ProductService.getByCategory('laptops');
    const product = products[0]!;
    const insight = PriceService.getInsight(product);
    expect(insight.lowestRecordedPrice).toBeLessThanOrEqual(insight.highestRecordedPrice);
    expect(insight.currentPrice).toBe(product.price);
  });

  it('flags near-historic-low correctly', async () => {
    const products = await ProductService.getByCategory('headphones');
    const product = products[0]!;
    const insight = PriceService.getInsight(product);
    if (insight.currentPrice <= insight.lowestRecordedPrice * 1.03) {
      expect(insight.isNearHistoricLow).toBe(true);
    }
  });

  it('formats a clear price-drop summary when the price fell', () => {
    const summary = PriceService.formatChangeSummary({
      currentPrice: 100,
      lowestRecordedPrice: 90,
      highestRecordedPrice: 150,
      changeVsThirtyDaysAgoPct: -14,
      isNearHistoricLow: false,
      history: [],
    });
    expect(summary).toMatch(/dropped 14%/);
  });

  it('formats a stable summary when price barely moved', () => {
    const summary = PriceService.formatChangeSummary({
      currentPrice: 100,
      lowestRecordedPrice: 95,
      highestRecordedPrice: 105,
      changeVsThirtyDaysAgoPct: 0.2,
      isNearHistoricLow: false,
      history: [],
    });
    expect(summary).toMatch(/stable/);
  });
});
