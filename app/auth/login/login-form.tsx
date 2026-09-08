'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEMO_MODE } from '@/lib/config';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="container flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <h1 className="font-display text-2xl text-ink-950">Sign in to CARTWISE</h1>

      {DEMO_MODE && (
        <p className="mt-3 rounded-sm bg-warn-50 p-3 text-xs text-warn-500">
          Demo mode: no Supabase project is configured, so accounts aren't available yet. Set
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable sign in — see README.md.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {error && <p className="text-xs text-bad-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || DEMO_MODE}>{loading ? 'Signing in…' : 'Sign in'}</Button>
      </form>

      <p className="mt-4 text-sm text-ink-500">
        No account? <Link href={`/auth/signup?next=${encodeURIComponent(next)}`} className="text-signal hover:underline">Create one</Link>
      </p>
    </div>
  );
}
