import { ProductService } from '@/lib/services/product-service';
import { MAX_COMPARE_PRODUCTS } from '@/lib/constants';
import type { Product, ComparisonResult, ComparisonHighlight } from '@/lib/types';

/**
 * ComparisonService builds the head-to-head comparison table and computes
 * which product "wins" each row. All highlighting is done with plain
 * arithmetic over ProductService data — never by an LLM — so the badges are
 * always traceable to a real number.
 */
export class ComparisonService {
  static async compare(productIds: string[]): Promise<ComparisonResult> {
    const ids = productIds.slice(0, MAX_COMPARE_PRODUCTS);
    const products = await ProductService.getByIds(ids);
    const highlights = this.computeHighlights(products);
    return { products, highlights };
  }

  private static computeHighlights(products: Product[]): ComparisonHighlight[] {
    if (products.length < 2) return [];
    const highlights: ComparisonHighlight[] = [];

    // Best price (lowest wins)
    const cheapest = products.reduce((min, p) => (p.price < min.price ? p : min), products[0]!);
    highlights.push({ key: 'price', bestProductId: cheapest.id });

    // Best rating (highest wins)
    const topRated = products.reduce((max, p) => (p.rating > max.rating ? p : max), products[0]!);
    highlights.push({ key: 'rating', bestProductId: topRated.id });

    // Best value = highest rating-per-pound
    const bestValue = products.reduce((best, p) => {
      const valueOf = (x: Product) => x.rating / (x.price / 100);
      return valueOf(p) > valueOf(best) ? p : best;
    }, products[0]!);
    highlights.push({ key: 'value', bestProductId: bestValue.id });

    // Per-spec winners, using each category's higherIsBetter direction.
    const specKeys = new Set(products.flatMap((p) => p.specifications.map((s) => s.key)));
    specKeys.forEach((key) => {
      const withSpec = products
        .map((p) => ({ product: p, spec: p.specifications.find((s) => s.key === key) }))
        .filter((x) => x.spec?.numericValue !== undefined);

      if (withSpec.length < 2) return;

      // Infer direction: if we don't know, skip highlighting (avoid guessing).
      const direction = this.inferDirection(key);
      if (direction === undefined) return;

      const best = withSpec.reduce((acc, cur) => {
        const accVal = acc.spec!.numericValue!;
        const curVal = cur.spec!.numericValue!;
        return direction === 'higher' ? (curVal > accVal ? cur : acc) : curVal < accVal ? cur : acc;
      }, withSpec[0]!);

      highlights.push({ key, bestProductId: best.product.id });
    });

    return highlights;
  }

  private static inferDirection(key: string): 'higher' | 'lower' | undefined {
    const higherIsBetterKeys = new Set([
      'ram_gb', 'storage_gb', 'battery_life_hours', 'battery_mah', 'camera_mp', 'driver_size_mm',
      'screen_size_in', 'refresh_rate_hz', 'megapixels', 'iso_max', 'weight_capacity_kg',
      'warranty_years', 'pressure_bar', 'water_tank_l', 'suction_pa', 'battery_runtime_min',
      'bin_capacity_l', 'coverage_sqm', 'cadr_m3h',
    ]);
    const lowerIsBetterKeys = new Set(['weight_kg', 'weight_g', 'response_time_ms', 'brew_time_sec', 'noise_db']);
    if (higherIsBetterKeys.has(key)) return 'higher';
    if (lowerIsBetterKeys.has(key)) return 'lower';
    return undefined;
  }
}
