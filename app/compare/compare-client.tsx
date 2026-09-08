'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Plus, Loader2 } from 'lucide-react';
import { ComparisonTable } from '@/components/compare/comparison-table';
import { AskCartwise } from '@/components/compare/ask-cartwise';
import { useCompareSelection } from '@/lib/hooks/use-compare-selection';
import { MAX_COMPARE_PRODUCTS } from '@/lib/constants';
import type { Product, ComparisonResult } from '@/lib/types';
import { track } from '@/lib/utils/track';
import { Input } from '@/components/ui/input';

export function CompareClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { ids: storedIds } = useCompareSelection();

  const urlIds = searchParams.get('ids')?.split(',').filter(Boolean) ?? [];
  const ids = urlIds.length > 0 ? urlIds : storedIds;

  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setResult(null);
      return;
    }
    setLoading(true);
    fetch(`/api/compare?ids=${ids.join(',')}`)
      .then((r) => r.json())
      .then((data: ComparisonResult) => {
        setResult(data);
        track('comparison_started', { productIds: ids });
      })
      .finally(() => setLoading(false));
  }, [ids.join(',')]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/search?query=${encodeURIComponent(query)}&pageSize=5`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setSuggestions(data.products ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  function addProduct(id: string) {
    const next = Array.from(new Set([...ids, id])).slice(0, MAX_COMPARE_PRODUCTS);
    router.push(`/compare?ids=${next.join(',')}`);
    setQuery('');
    setSuggestions([]);
  }

  function removeProduct(id: string) {
    const next = ids.filter((x) => x !== id);
    router.push(next.length ? `/compare?ids=${next.join(',')}` : '/compare');
  }

  return (
    <div className="container py-6">
      <h1 className="font-display text-2xl text-ink-950">Compare products</h1>
      <p className="mt-1 text-sm text-ink-500">Select up to {MAX_COMPARE_PRODUCTS} products to compare side by side.</p>

      <div className="relative mt-4 max-w-md">
        <Input placeholder="Add a product to compare…" value={query} onChange={(e) => setQuery(e.target.value)} disabled={ids.length >= MAX_COMPARE_PRODUCTS} />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-sm border border-ink-200 bg-white shadow-pop">
            {suggestions.map((p) => (
              <button key={p.id} onClick={() => addProduct(p.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-ink-50">
                <div className="relative h-8 w-8 overflow-hidden rounded-sm bg-ink-50"><Image src={p.imageUrl} alt="" fill sizes="32px" className="object-cover" /></div>
                <span className="line-clamp-1">{p.title}</span>
                <Plus className="ml-auto h-3.5 w-3.5 text-ink-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {ids.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {ids.map((id) => (
            <button key={id} onClick={() => removeProduct(id)} className="flex items-center gap-1 rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-600 hover:border-ink-900">
              {result?.products.find((p) => p.id === id)?.title ?? id} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading comparison…</div>
        )}
        {!loading && ids.length === 0 && (
          <div className="rounded-md border border-dashed border-ink-300 py-16 text-center text-sm text-ink-500">
            No products selected yet. Search for products and tap "Compare" to add them here.
          </div>
        )}
        {!loading && result && result.products.length > 0 && (
          <div className="space-y-6">
            <ComparisonTable result={result} />
            <AskCartwise productIds={result.products.map((p) => p.id)} products={result.products} />
          </div>
        )}
      </div>
    </div>
  );
}
