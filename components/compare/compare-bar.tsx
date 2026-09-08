'use client';

import Link from 'next/link';
import { X, Scale } from 'lucide-react';
import { useCompareSelection } from '@/lib/hooks/use-compare-selection';
import { Button } from '@/components/ui/button';

/** Sticky bottom bar shown on /search once at least one product is queued for comparison. */
export function CompareBar() {
  const { ids, remove, clear } = useCompareSelection();
  if (ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-14 z-20 md:bottom-4">
      <div className="container">
        <div className="flex items-center justify-between gap-3 rounded-md border border-ink-900 bg-ink-950 px-4 py-3 text-paper shadow-pop">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Scale className="h-4 w-4 shrink-0 text-signal" />
            <span className="shrink-0 text-sm font-medium">{ids.length} selected</span>
            {ids.map((id) => (
              <button key={id} onClick={() => remove(id)} className="shrink-0 rounded-full bg-ink-800 p-1 hover:bg-ink-700">
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" className="text-paper hover:bg-ink-800" onClick={clear}>Clear</Button>
            <Link href={`/compare?ids=${ids.join(',')}`}>
              <Button variant="signal" size="sm">Compare ({ids.length})</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
