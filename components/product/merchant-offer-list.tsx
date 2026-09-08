'use client';

import { ExternalLink } from 'lucide-react';
import type { MerchantOffer } from '@/lib/types';
import { formatPrice } from '@/lib/utils/format';
import { AvailabilityBadge } from '@/components/product/availability-badge';
import { MerchantService } from '@/lib/services/merchant-service';
import { track } from '@/lib/utils/track';
import { cn } from '@/lib/utils/cn';

export function MerchantOfferList({ productId, offers }: { productId: string; offers: MerchantOffer[] }) {
  const sorted = MerchantService.sortOffersByPrice(offers);

  function handleClick(offer: MerchantOffer) {
    track('merchant_clicked', { productId, merchantId: offer.merchant.id });
    fetch('/api/merchant-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, merchantId: offer.merchant.id, source: 'product_page' }),
    }).catch(() => {});
  }

  return (
    <div className="divide-y divide-ink-100 rounded-md border border-ink-200 bg-white">
      {sorted.map((offer, i) => (
        <div key={offer.merchant.id} className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="cw-wordmark text-sm font-semibold text-ink-900">{offer.merchant.logoText}</p>
            <p className="mt-0.5 text-xs text-ink-400">{MerchantService.formatFreshness(offer.updatedAt)}{offer.merchant.deliveryNotes ? ` · ${offer.merchant.deliveryNotes}` : ''}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-ink-950">{formatPrice(offer.price, offer.currency)}</p>
            <AvailabilityBadge availability={offer.availability} />
          </div>
          <a
            href="https://example-merchant.demo"
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => handleClick(offer)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-sm px-3 text-xs font-medium transition-colors',
              i === 0 ? 'bg-signal text-white hover:bg-signal-600' : 'border border-ink-300 text-ink-900 hover:bg-ink-50'
            )}
          >
            Visit <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ))}
    </div>
  );
}
