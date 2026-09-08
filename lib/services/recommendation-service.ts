import { ProductService } from '@/lib/services/product-service';
import type { Product, RecommendationScore, UserPreferences, CategorySlug } from '@/lib/types';

/**
 * RecommendationService computes "Recommended for you" purely with
 * deterministic arithmetic over structured product data. The LLM is never
 * involved in the scoring — this guarantees the same inputs always produce
 * the same score, and the "why" bullets are generated from the same
 * numbers shown in the score breakdown, not invented text.
 */
export class RecommendationService {
  static async recommend(
    categorySlug: CategorySlug,
    preferences: UserPreferences = {},
    limit = 6
  ): Promise<{ product: Product; score: RecommendationScore }[]> {
    const products = await ProductService.getByCategory(categorySlug);
    if (products.length === 0) return [];

    const priceValues = products.map((p) => p.price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);

    const scored = products.map((product) => {
      const priceScore = this.normalizeInverse(product.price, minPrice, maxPrice) * 100;
      const performanceScore = this.performanceScore(product, products) * 100;
      const featureScore = Math.min(100, (product.features.length / 6) * 100);
      const ratingScore = (product.rating / 5) * 100;
      const valueScore = (priceScore * 0.5 + ratingScore * 0.5);

      const weights = this.weightsForPriority(preferences.priority);
      const brandBoost = preferences.preferredBrands?.includes(product.brand) ? 6 : 0;

      const overallScore = Math.min(
        100,
        Math.round(
          priceScore * weights.price +
            performanceScore * weights.performance +
            valueScore * weights.value +
            featureScore * weights.features +
            brandBoost
        )
      );

      const score: RecommendationScore = {
        productId: product.id,
        overallScore,
        valueScore: Math.round(valueScore),
        performanceScore: Math.round(performanceScore),
        priceScore: Math.round(priceScore),
        featureScore: Math.round(featureScore),
        reasons: this.buildReasons(product, { priceScore, performanceScore, ratingScore, featureScore }),
        tradeOffs: this.buildTradeOffs(product, products),
      };

      return { product, score };
    });

    return scored.sort((a, b) => b.score.overallScore - a.score.overallScore).slice(0, limit);
  }

  private static weightsForPriority(priority?: UserPreferences['priority']) {
    switch (priority) {
      case 'price':
        return { price: 0.45, performance: 0.2, value: 0.2, features: 0.15 };
      case 'performance':
        return { price: 0.1, performance: 0.5, value: 0.2, features: 0.2 };
      case 'features':
        return { price: 0.15, performance: 0.2, value: 0.2, features: 0.45 };
      case 'value':
      default:
        return { price: 0.2, performance: 0.25, value: 0.4, features: 0.15 };
    }
  }

  private static normalizeInverse(value: number, min: number, max: number): number {
    if (max === min) return 1;
    return 1 - (value - min) / (max - min);
  }

  /** Averages the normalized position of every "higher is better" numeric spec against the category. */
  private static performanceScore(product: Product, categoryProducts: Product[]): number {
    const higherIsBetterKeys = new Set([
      'ram_gb', 'storage_gb', 'battery_life_hours', 'battery_mah', 'camera_mp', 'driver_size_mm',
      'refresh_rate_hz', 'megapixels', 'iso_max', 'weight_capacity_kg', 'pressure_bar',
      'suction_pa', 'battery_runtime_min', 'coverage_sqm', 'cadr_m3h',
    ]);

    const scores: number[] = [];
    product.specifications.forEach((spec) => {
      if (spec.numericValue === undefined || !higherIsBetterKeys.has(spec.key)) return;
      const allValues = categoryProducts
        .map((p) => p.specifications.find((s) => s.key === spec.key)?.numericValue)
        .filter((v): v is number => v !== undefined);
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      if (max === min) return;
      scores.push((spec.numericValue - min) / (max - min));
    });

    if (scores.length === 0) return product.rating / 5;
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }

  private static buildReasons(
    product: Product,
    parts: { priceScore: number; performanceScore: number; ratingScore: number; featureScore: number }
  ): string[] {
    const reasons: string[] = [];
    if (parts.ratingScore >= 88) reasons.push(`Highly rated at ${product.rating.toFixed(1)}/5 from ${product.reviewCount.toLocaleString('en-GB')} reviews`);
    if (parts.priceScore >= 70) reasons.push('Priced below most alternatives in this category');
    if (parts.performanceScore >= 70) reasons.push('Leads the category on key specifications');
    if (parts.featureScore >= 70) reasons.push(`Comes with ${product.features.length} standout features`);
    if (product.previousPrice && product.previousPrice > product.price) {
      const pct = Math.round(((product.previousPrice - product.price) / product.previousPrice) * 100);
      reasons.push(`Price recently dropped ${pct}%`);
    }
    if (reasons.length === 0) reasons.push('Balanced all-round option for this category');
    return reasons.slice(0, 4);
  }

  private static buildTradeOffs(product: Product, categoryProducts: Product[]): string[] {
    const tradeOffs: string[] = [];
    const avgPrice = categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length;
    if (product.price > avgPrice * 1.15) {
      tradeOffs.push('Costs more than the category average');
    }
    const higherIsBetterKeys = new Set(['ram_gb', 'storage_gb', 'battery_life_hours', 'battery_mah']);
    product.specifications.forEach((spec) => {
      if (spec.numericValue === undefined || !higherIsBetterKeys.has(spec.key)) return;
      const best = Math.max(
        ...categoryProducts.map((p) => p.specifications.find((s) => s.key === spec.key)?.numericValue ?? 0)
      );
      if (best > 0 && spec.numericValue < best * 0.7) {
        tradeOffs.push(`Lower ${spec.label.toLowerCase()} than the category leader`);
      }
    });
    return tradeOffs.slice(0, 3);
  }
}
