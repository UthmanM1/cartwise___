'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/data/category-list';
import type { SearchFacets } from '@/lib/types';

export function FilterPanel({ facets, onApplied }: { facets: SearchFacets; onApplied?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const selectedBrands = new Set(searchParams.getAll('brands'));
  const selectedRating = searchParams.get('minRating');
  const selectedCategory = searchParams.get('category');

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.set('page', '1');
    router.push(`/search?${params.toString()}`);
    onApplied?.();
  }

  function toggleListParam(key: string, value: string) {
    updateParams((params) => {
      const values = new Set(params.getAll(key));
      if (values.has(value)) values.delete(value);
      else values.add(value);
      params.delete(key);
      values.forEach((v) => params.append(key, v));
    });
  }

  return (
    <div className="space-y-6 text-sm">
      <div>
        <h3 className="mb-2 font-semibold text-ink-900">Category</h3>
        <div className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => updateParams((p) => (selectedCategory === c.slug ? p.delete('category') : p.set('category', c.slug)))}
              className={`block w-full rounded-sm px-2 py-1 text-left ${selectedCategory === c.slug ? 'bg-ink-950 text-paper' : 'hover:bg-ink-100 text-ink-700'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-ink-900">Price range</h3>
        <div className="flex items-center gap-2">
          <Input placeholder={`£${facets.priceRange.min}`} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} inputMode="numeric" />
          <span className="text-ink-400">–</span>
          <Input placeholder={`£${facets.priceRange.max}`} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} inputMode="numeric" />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => updateParams((p) => {
            if (minPrice) p.set('minPrice', minPrice); else p.delete('minPrice');
            if (maxPrice) p.set('maxPrice', maxPrice); else p.delete('maxPrice');
          })}
        >
          Apply
        </Button>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-ink-900">Brand</h3>
        <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
          {facets.brands.map((b) => (
            <label key={b.value} className="flex items-center justify-between gap-2 py-0.5">
              <span className="flex items-center gap-2">
                <Checkbox checked={selectedBrands.has(b.value)} onCheckedChange={() => toggleListParam('brands', b.value)} />
                <span className="text-ink-700">{b.value}</span>
              </span>
              <span className="text-xs text-ink-400">{b.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-ink-900">Minimum rating</h3>
        <div className="flex flex-wrap gap-2">
          {facets.ratings.map((r) => (
            <button
              key={r.value}
              onClick={() => updateParams((p) => (selectedRating === String(r.value) ? p.delete('minRating') : p.set('minRating', String(r.value))))}
              className={`rounded-sm border px-2.5 py-1 text-xs ${selectedRating === String(r.value) ? 'border-ink-950 bg-ink-950 text-paper' : 'border-ink-300 text-ink-700 hover:border-ink-900'}`}
            >
              {r.value}+ ({r.count})
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-ink-900">Availability</h3>
        <div className="space-y-1.5">
          {facets.availability.map((a) => (
            <label key={a.value} className="flex items-center gap-2">
              <Checkbox
                checked={searchParams.getAll('availability').includes(a.value)}
                onCheckedChange={() => toggleListParam('availability', a.value)}
              />
              <span className="capitalize text-ink-700">{a.value.replace('_', ' ')}</span>
              <span className="ml-auto text-xs text-ink-400">{a.count}</span>
            </label>
          ))}
        </div>
      </div>

      {facets.features.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold text-ink-900">Features</h3>
          <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
            {facets.features.map((f) => (
              <label key={f.value} className="flex items-center gap-2 py-0.5">
                <Checkbox checked={searchParams.getAll('features').includes(f.value)} onCheckedChange={() => toggleListParam('features', f.value)} />
                <span className="text-ink-700">{f.value}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Button variant="ghost" size="sm" onClick={() => router.push('/search')}>
        Clear all filters
      </Button>
    </div>
  );
}
