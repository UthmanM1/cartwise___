import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/app/profile/logout-button';
import { DEMO_MODE } from '@/lib/config';

export const metadata: Metadata = { title: 'Your profile' };

export default async function ProfilePage() {
  // Demo mode: no Supabase project configured, so skip constructing a
  // client with missing credentials and go straight to the sign-in prompt.
  const user = DEMO_MODE ? null : (await createClient().auth.getUser()).data.user;

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <p className="text-sm text-ink-500">Sign in to view your profile.</p>
        <Link href="/auth/login?next=/profile" className="mt-3 inline-block text-sm text-signal hover:underline">Sign in</Link>
      </div>
    );
  }

  const supabase = createClient();
  const [{ data: profile }, { data: comparisons }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('comparison_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ]);

  return (
    <div className="container max-w-3xl py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-950">Your profile</h1>
        <LogoutButton />
      </div>

      <section className="mt-6 rounded-md border border-ink-200 bg-white p-4">
        <h2 className="mb-2 font-medium text-ink-900">Account</h2>
        <p className="text-sm text-ink-600">{profile?.display_name ?? user.email}</p>
        <p className="text-sm text-ink-400">{user.email}</p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatBox label="Saved products" href="/saved" />
        <StatBox label="Watchlists" href="/watchlists" />
        <StatBox label="Preferences" href="/profile#preferences" />
      </section>

      <section id="preferences" className="mt-6 rounded-md border border-ink-200 bg-white p-4">
        <h2 className="mb-2 font-medium text-ink-900">Preferences</h2>
        <p className="text-sm text-ink-500">
          Priority: <span className="font-medium text-ink-800">{profile?.preferences?.priority ?? 'value'}</span>
        </p>
        <p className="mt-1 text-xs text-ink-400">Used to weight the "Recommended for you" scoring on category pages.</p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-medium text-ink-900">Comparison history</h2>
        {!comparisons || comparisons.length === 0 ? (
          <p className="text-sm text-ink-500">No comparisons yet. Compare products and ask CARTWISE a question to build history here.</p>
        ) : (
          <ul className="space-y-2">
            {comparisons.map((c) => (
              <li key={c.id} className="rounded-md border border-ink-200 bg-white p-3 text-sm">
                <p className="font-medium text-ink-900">{c.question ?? 'Comparison'}</p>
                {c.ai_summary && <p className="mt-1 text-xs text-ink-500 line-clamp-2">{c.ai_summary}</p>}
                <p className="mt-1 text-[11px] text-ink-400">{new Date(c.created_at).toLocaleDateString('en-GB')}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatBox({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="rounded-md border border-ink-200 bg-white p-4 text-center hover:border-ink-900">
      <span className="text-sm text-ink-700">{label}</span>
    </Link>
  );
}
