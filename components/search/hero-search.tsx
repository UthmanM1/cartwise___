'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/utils/track';

const EXAMPLES = [
  'Best noise cancelling headphones under £350',
  'Best laptop for university under £1,000',
  'Best monitor for a home office',
  'Best running shoes for long distance',
];

export function HeroSearch() {
  const [value, setValue] = useState('');
  const router = useRouter();

  function go(q: string) {
    track('search_started', { query: q });
    router.push(`/search?query=${encodeURIComponent(q)}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) go(value.trim());
        }}
        className="flex items-center gap-2 rounded-md border border-ink-300 bg-white p-1.5 shadow-card focus-within:ring-2 focus-within:ring-ink-900"
      >
        <Search className="ml-2 h-5 w-5 shrink-0 text-ink-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What are you looking for?"
          className="h-11 w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none sm:text-base"
        />
        <Button type="submit" variant="signal" size="md">Search</Button>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => go(ex)}
            className="rounded-full border border-ink-300 bg-white px-3 py-1.5 text-xs text-ink-600 hover:border-ink-900 hover:text-ink-900"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
