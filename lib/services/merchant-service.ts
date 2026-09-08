import { DEMO_MODE } from '@/lib/config';
import type { MerchantOffer, Product } from '@/lib/types';

export interface MerchantClickPayload {
  userId?: string;
  productId: string;
  merchantId: string;
  comparisonId?: string;
  source: 'search' | 'compare' | 'product_page' | 'saved' | 'recommendation';
}

/**
 * MerchantService compares per-merchant offers for a product and records
 * outbound clicks. CARTWISE does not have real affiliate partnerships —
 * `productUrl` fields point at a demo domain. In live mode, ProductUrl /
 * affiliateUrl would come from a real merchant feed or affiliate network
 * (see ARCHITECTURE.md § "Connecting real product APIs").
 */
export class MerchantService {
  static sortOffersByPrice(offers: MerchantOffer[]): MerchantOffer[] {
    return [...offers].sort((a, b) => a.price - b.price);
  }

  static getBestOffer(product: Product): MerchantOffer {
    return this.sortOffersByPrice(product.offers)[0]!;
  }

  static formatFreshness(updatedAt: string): string {
    const minutes = Math.max(1, Math.round((Date.now() - new Date(updatedAt).getTime()) / 60_000));
    if (minutes < 60) return `Updated ${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    return `Updated ${hours}h ago`;
  }

  /**
   * Records an outbound merchant click. In demo mode this is a no-op logged
   * to the console (no database configured). In live mode it inserts into
   * merchant_clicks, which powers /admin/merchants CTR figures.
   */
  static async trackClick(payload: MerchantClickPayload): Promise<{ tracked: boolean }> {
    if (DEMO_MODE) {
      // eslint-disable-next-line no-console
      console.log('[MerchantService demo] click tracked (not persisted):', payload);
      return { tracked: false };
    }

    // LIVE MODE:
    // const supabase = createClient();
    // await supabase.from('merchant_clicks').insert({
    //   user_id: payload.userId ?? null,
    //   product_id: payload.productId,
    //   merchant_id: payload.merchantId,
    //   comparison_id: payload.comparisonId ?? null,
    //   source: payload.source,
    // });
    return { tracked: true };
  }
}
