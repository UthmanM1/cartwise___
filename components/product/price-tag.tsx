import { formatPrice, savingsPercent } from '@/lib/utils/format';

export function PriceTag({ price, previousPrice, currency = 'GBP' }: { price: number; previousPrice?: number; currency?: string }) {
  const pct = savingsPercent(price, previousPrice);
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-semibold text-ink-950">{formatPrice(price, currency)}</span>
      {previousPrice && previousPrice > price && (
        <>
          <span className="text-sm text-ink-400 line-through">{formatPrice(previousPrice, currency)}</span>
          {pct && <span className="text-xs font-semibold text-good-600">-{pct}%</span>}
        </>
      )}
    </div>
  );
}
