'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEMO_MODE, SITE_URL } from '@/lib/config';
import { track } from '@/lib/utils/track';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    track('account_created', {});
    setSent(true);
  }

  return (
    <div className="container flex min-h-[70vh] max-w-md flex-col justify-center py-12">
      <h1 className="font-display text-2xl text-ink-950">Create your CARTWISE account</h1>

      {DEMO_MODE && (
        <p className="mt-3 rounded-sm bg-warn-50 p-3 text-xs text-warn-500">
          Demo mode: no Supabase project is configured, so accounts aren't available yet. See README.md for local setup.
        </p>
      )}

      {sent ? (
        <p className="mt-6 rounded-sm bg-good-50 p-3 text-sm text-good-600">Check your email to confirm your account.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          {error && <p className="text-xs text-bad-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || DEMO_MODE}>{loading ? 'Creating account…' : 'Create account'}</Button>
        </form>
      )}

      <p className="mt-4 text-sm text-ink-500">
        Already have an account? <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="text-signal hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
