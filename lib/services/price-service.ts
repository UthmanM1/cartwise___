import { ProductService } from '@/lib/services/product-service';
import type { Product, PricePoint } from '@/lib/types';

export interface PriceInsight {
  currentPrice: number;
  lowestRecordedPrice: number;
  highestRecordedPrice: number;
  changeVsThirtyDaysAgoPct: number;
  isNearHistoricLow: boolean;
  history: PricePoint[];
}

/**
 * PriceService derives price intelligence purely from ProductService's
 * price_history data. In live mode this would run as a scheduled job
 * (Supabase cron / edge function) that snapshots product_prices into
 * price_history once a day per product.
 */
export class PriceService {
  static getInsight(product: Product): PriceInsight {
    const history = product.priceHistory;
    const prices = history.map((h) => h.price);
    const lowestRecordedPrice = Math.min(...prices, product.price);
    const highestRecordedPrice = Math.max(...prices, product.price);

    const thirtyDaysAgoPoint = history[Math.max(0, history.length - 11)]; // history sampled every 3 days => ~10 points = 30 days
    const priceThirtyDaysAgo = thirtyDaysAgoPoint?.price ?? product.price;
    const changeVsThirtyDaysAgoPct = priceThirtyDaysAgo
      ? Math.round(((product.price - priceThirtyDaysAgo) / priceThirtyDaysAgo) * 1000) / 10
      : 0;

    const isNearHistoricLow = product.price <= lowestRecordedPrice * 1.03;

    return { currentPrice: product.price, lowestRecordedPrice, highestRecordedPrice, changeVsThirtyDaysAgoPct, isNearHistoricLow, history };
  }

  static formatChangeSummary(insight: PriceInsight): string {
    if (insight.changeVsThirtyDaysAgoPct < -1) {
      return `Price dropped ${Math.abs(insight.changeVsThirtyDaysAgoPct)}% over the last 30 days.`;
    }
    if (insight.changeVsThirtyDaysAgoPct > 1) {
      return `Price increased ${insight.changeVsThirtyDaysAgoPct}% over the last 30 days.`;
    }
    return 'Price has been stable over the last 30 days.';
  }

  /** Evaluates a target-price alert against the current lowest price. Pure function — easy to unit test. */
  static evaluateAlert(currentPrice: number, targetPrice: number | undefined): 'waiting' | 'triggered' | 'disabled' {
    if (targetPrice === undefined) return 'disabled';
    return currentPrice <= targetPrice ? 'triggered' : 'waiting';
  }

  static async getPriceDropCandidates(threshold = 10): Promise<Product[]> {
    const all = await ProductService.getAll();
    return all.filter((p) => {
      if (!p.previousPrice) return false;
      const pct = ((p.previousPrice - p.price) / p.previousPrice) * 100;
      return pct >= threshold;
    });
  }
}
