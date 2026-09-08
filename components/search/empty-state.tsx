import { SearchX } from 'lucide-react';

export function EmptySearchState({ query }: { query?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-ink-300 py-20 text-center">
      <SearchX className="h-8 w-8 text-ink-400" />
      <p className="text-sm font-medium text-ink-800">No products match{query ? ` "${query}"` : ' these filters'}</p>
      <p className="max-w-sm text-sm text-ink-500">Try widening your price range, clearing a filter, or searching a broader term.</p>
    </div>
  );
}
