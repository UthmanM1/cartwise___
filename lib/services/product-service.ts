import { generateAllProducts } from '@/lib/data/generate-products';
import { DEMO_MODE } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import type { Product, CategorySlug, MerchantOffer, ProductSpecification, PricePoint, Availability } from '@/lib/types';

/**
 * ProductService is the ONLY place in the app allowed to read raw product
 * data. Every other service and every page must go through here — this is
 * what makes the "AI never invents product facts" guarantee enforceable:
 * AIService can only cite what ProductService returns.
 *
 * In demo mode (default), data comes from the deterministic synthetic
 * generator. In live mode, it queries Supabase — run `npm run seed` after
 * applying supabase/migrations/0001_init.sql to populate a live project
 * with the same synthetic catalog.
 */
export class ProductService {
  private static liveCache: Product[] | null = null;

  static async getAll(): Promise<Product[]> {
    if (DEMO_MODE) return generateAllProducts();
    return this.getAllLive();
  }

  private static async getAllLive(): Promise<Product[]> {
    if (this.liveCache) return this.liveCache;

    const supabase = createClient();
    const { data, error } = await supabase.from('products').select(`
      id, slug, title, brand, description, currency, rating, review_count, availability,
      image_url, product_url, affiliate_url, is_demo, created_at, updated_at,
      categories ( slug ),
      product_specifications ( key, label, value, unit, numeric_value ),
      product_features ( feature, sort_order ),
      product_images ( url, sort_order ),
      product_prices ( price, previous_price, currency, availability, updated_at, merchants ( id, slug, name, logo_text, is_demo, delivery_notes ) ),
      price_history ( price, recorded_at )
    `);

    if (error || !data) {
      // Fail soft to the demo catalog rather than crashing the whole app if
      // Supabase is unreachable or hasn't been seeded yet.
      console.error('ProductService.getAllLive failed, falling back to demo data:', error?.message);
      return generateAllProducts();
    }

    this.liveCache = data.map((row: any) => this.mapRow(row));
    return this.liveCache;
  }

  private static mapRow(row: any): Product {
    const offers: MerchantOffer[] = (row.product_prices ?? []).map((pp: any) => ({
      merchant: {
        id: pp.merchants.id,
        slug: pp.merchants.slug,
        name: pp.merchants.name,
        logoText: pp.merchants.logo_text,
        isDemo: pp.merchants.is_demo,
        deliveryNotes: pp.merchants.delivery_notes ?? undefined,
      },
      price: Number(pp.price),
      previousPrice: pp.previous_price ? Number(pp.previous_price) : undefined,
      currency: pp.currency,
      availability: pp.availability as Availability,
      updatedAt: pp.updated_at,
    }));

    const sortedOffers = [...offers].sort((a, b) => a.price - b.price);
    const lowest = sortedOffers[0];

    const specifications: ProductSpecification[] = (row.product_specifications ?? []).map((s: any) => ({
      key: s.key,
      label: s.label,
      value: s.value,
      unit: s.unit ?? undefined,
      numericValue: s.numeric_value !== null ? Number(s.numeric_value) : undefined,
    }));

    const features: string[] = (row.product_features ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((f: any) => f.feature);

    const images: string[] = (row.product_images ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((i: any) => i.url);

    const priceHistory: PricePoint[] = (row.price_history ?? [])
      .map((h: any) => ({ date: h.recorded_at, price: Number(h.price) }))
      .sort((a: PricePoint, b: PricePoint) => a.date.localeCompare(b.date));

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      brand: row.brand,
      categoryId: row.categories?.slug ?? '',
      categorySlug: row.categories?.slug as CategorySlug,
      description: row.description,
      currency: row.currency,
      rating: Number(row.rating),
      reviewCount: row.review_count,
      availability: (lowest?.availability ?? row.availability) as Availability,
      imageUrl: row.image_url,
      images,
      productUrl: row.product_url ?? undefined,
      affiliateUrl: row.affiliate_url ?? undefined,
      isDemo: row.is_demo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      price: lowest?.price ?? 0,
      previousPrice: lowest?.previousPrice,
      specifications,
      features,
      offers: sortedOffers,
      priceHistory,
    };
  }

  static async getById(id: string): Promise<Product | null> {
    const all = await this.getAll();
    return all.find((p) => p.id === id) ?? null;
  }

  static async getBySlug(slug: string): Promise<Product | null> {
    const all = await this.getAll();
    return all.find((p) => p.slug === slug) ?? null;
  }

  static async getByIds(ids: string[]): Promise<Product[]> {
    const all = await this.getAll();
    // Preserve requested order (important for comparison column ordering).
    return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
  }

  static async getByCategory(categorySlug: CategorySlug): Promise<Product[]> {
    const all = await this.getAll();
    return all.filter((p) => p.categorySlug === categorySlug);
  }

  static async getBrandsForCategory(categorySlug?: CategorySlug): Promise<string[]> {
    const all = categorySlug ? await this.getByCategory(categorySlug) : await this.getAll();
    return Array.from(new Set(all.map((p) => p.brand))).sort();
  }

  static async getTrending(limit = 8): Promise<Product[]> {
    const all = await this.getAll();
    return [...all].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
  }

  static async getTopRated(limit = 8): Promise<Product[]> {
    const all = await this.getAll();
    return [...all].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  static async getRecentPriceDrops(limit = 8): Promise<Product[]> {
    const all = await this.getAll();
    return all
      .filter((p) => p.previousPrice && p.previousPrice > p.price)
      .sort((a, b) => {
        const dropA = ((a.previousPrice! - a.price) / a.previousPrice!) * 100;
        const dropB = ((b.previousPrice! - b.price) / b.previousPrice!) * 100;
        return dropB - dropA;
      })
      .slice(0, limit);
  }

  static async getSimilar(product: Product, limit = 4): Promise<Product[]> {
    const all = await this.getByCategory(product.categorySlug);
    return all
      .filter((p) => p.id !== product.id)
      .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
      .slice(0, limit);
  }
}
