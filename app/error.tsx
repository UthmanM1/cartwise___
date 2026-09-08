'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-bad-500" />
      <h1 className="font-display text-xl text-ink-950">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-500">An unexpected error occurred. You can try again, or head back to the homepage.</p>
      <Button onClick={reset} className="mt-2">Try again</Button>
    </div>
  );
}
