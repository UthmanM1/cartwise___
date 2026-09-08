'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AIComparisonAnswer, Product } from '@/lib/types';
import { track } from '@/lib/utils/track';

const SUGGESTIONS = [
  'Which one is best for travelling?',
  'Which has the best battery life?',
  'Which offers the best value?',
  'Which would you choose for university?',
];

export function AskCartwise({ productIds, products }: { productIds: string[]; products: Product[] }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AIComparisonAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    if (productIds.length < 2) return;
    setLoading(true);
    setError(null);
    track('ai_comparison_started', { productIds, question: q });
    try {
      const res = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds, question: q }),
      });
      if (!res.ok) throw new Error('AI comparison is temporarily unavailable.');
      const data = await res.json();
      setAnswer(data.answer);
      track('ai_comparison_completed', { productIds, question: q, provider: data.answer.provider });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const sourceProducts = answer ? products.filter((p) => answer.sourceProductIds.includes(p.id)) : [];

  return (
    <div className="rounded-md border border-ink-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-signal" />
        <h3 className="font-display text-base text-ink-950">Ask CARTWISE</h3>
      </div>
      <p className="mt-1 text-xs text-ink-500">Answers are generated only from the specifications shown above — never invented.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) ask(question.trim());
        }}
        className="mt-3 flex gap-2"
      >
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Which one is best for travelling?" />
        <Button type="submit" disabled={loading || productIds.length < 2}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
        </Button>
      </form>

      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuestion(s); ask(s); }}
            disabled={loading || productIds.length < 2}
            className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-600 hover:border-ink-900 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {productIds.length < 2 && <p className="mt-3 text-xs text-warn-500">Select at least 2 products above to ask CARTWISE.</p>}
      {error && <p className="mt-3 text-xs text-bad-500">{error}</p>}

      {answer && (
        <div className="mt-4 rounded-sm bg-ink-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">AI analysis</p>
          <p className="mt-1.5 text-sm text-ink-900">{answer.answer}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-500">Sources used:</span>
            {sourceProducts.map((p) => (
              <span key={p.id} className="rounded-sm bg-white px-2 py-0.5 text-xs text-ink-700 border border-ink-200">{p.title}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
