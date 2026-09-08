'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { track } from '@/lib/utils/track';

export function SaveButton({ productId, initiallySaved = false }: { productId: string; initiallySaved?: boolean }) {
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onClick = () => {
    startTransition(async () => {
      const method = saved ? 'DELETE' : 'POST';
      const res = await fetch('/api/saved', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (res.ok) {
        setSaved(!saved);
        track(saved ? 'product_unsaved' : 'product_saved', { productId });
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved products' : 'Save product'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors',
        saved ? 'border-signal bg-signal-50 text-signal' : 'border-ink-300 text-ink-500 hover:border-ink-900 hover:text-ink-900'
      )}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-signal')} />
    </button>
  );
}
