import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import type { ComparisonResult } from '@/lib/types';
import { RatingStars } from '@/components/product/rating-stars';
import { PriceTag } from '@/components/product/price-tag';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

export function ComparisonTable({ result }: { result: ComparisonResult }) {
  const { products, highlights } = result;
  if (products.length === 0) return null;

  const isBest = (key: string, productId: string) => highlights.some((h) => h.key === key && h.bestProductId === productId);

  // Union of spec keys across all selected products, in the order the first product defines them.
  const specKeys: { key: string; label: string; unit?: string }[] = [];
  products.forEach((p) => {
    p.specifications.forEach((s) => {
      if (!specKeys.some((k) => k.key === s.key)) specKeys.push({ key: s.key, label: s.label, unit: s.unit });
    });
  });

  return (
    <div className="overflow-x-auto rounded-md border border-ink-200">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-40 border-b border-ink-200 bg-ink-50 p-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-ink-500">
              Product
            </th>
            {products.map((p) => (
              <th key={p.id} className="border-b border-ink-200 bg-ink-50 p-3 align-bottom">
                <Link href={`/products/${p.slug}`} className="flex flex-col items-center gap-2 text-center">
                  <div className="relative h-20 w-20 overflow-hidden rounded-sm bg-white">
                    <Image src={p.imageUrl} alt={p.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <span className="line-clamp-2 text-xs font-medium text-ink-900">{p.title}</span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row label="Price">
            {products.map((p) => (
              <Cell key={p.id} best={isBest('price', p.id)}>
                <PriceTag price={p.price} previousPrice={p.previousPrice} currency={p.currency} />
              </Cell>
            ))}
          </Row>
          <Row label="Rating">
            {products.map((p) => (
              <Cell key={p.id} best={isBest('rating', p.id)}>
                <RatingStars rating={p.rating} reviewCount={p.reviewCount} />
              </Cell>
            ))}
          </Row>
          <Row label="Value">
            {products.map((p) => (
              <Cell key={p.id} best={isBest('value', p.id)}>
                {isBest('value', p.id) ? <Badge variant="good">Best value</Badge> : <span className="text-ink-400">—</span>}
              </Cell>
            ))}
          </Row>

          {specKeys.map((spec) => (
            <Row key={spec.key} label={spec.label}>
              {products.map((p) => {
                const found = p.specifications.find((s) => s.key === spec.key);
                const best = isBest(spec.key, p.id);
                return (
                  <Cell key={p.id} best={best}>
                    {found ? (
                      found.value === 'Yes' || found.value === 'No' ? (
                        found.value === 'Yes' ? <Check className="mx-auto h-4 w-4 text-good-600" /> : <Minus className="mx-auto h-4 w-4 text-ink-300" />
                      ) : (
                        <span>{found.value}{found.unit ?? ''}</span>
                      )
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </Cell>
                );
              })}
            </Row>
          ))}

          <Row label="Key features">
            {products.map((p) => (
              <Cell key={p.id}>
                <ul className="space-y-0.5 text-left text-xs text-ink-600">
                  {p.features.slice(0, 4).map((f) => <li key={f}>• {f}</li>)}
                </ul>
              </Cell>
            ))}
          </Row>
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-ink-100 last:border-0">
      <th className="bg-ink-50/60 p-3 text-left text-xs font-medium text-ink-600">{label}</th>
      {children}
    </tr>
  );
}

function Cell({ children, best = false }: { children: React.ReactNode; best?: boolean }) {
  return (
    <td className={cn('p-3 text-center align-middle', best && 'bg-good-50')}>
      <div className="flex flex-col items-center gap-1">
        {children}
        {best && <span className="text-[10px] font-semibold uppercase tracking-wide text-good-600">Best</span>}
      </div>
    </td>
  );
}
