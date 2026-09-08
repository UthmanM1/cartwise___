import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareClient } from '@/app/compare/compare-client';

export const metadata: Metadata = {
  title: 'Compare products',
  description: 'Compare up to 4 products side by side with price, rating and specification highlights, plus AI-assisted analysis grounded in real product data.',
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="container py-10 text-sm text-ink-500">Loading…</div>}>
      <CompareClient />
    </Suspense>
  );
}
