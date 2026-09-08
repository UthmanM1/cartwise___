import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { WatchlistsClient } from '@/app/watchlists/watchlists-client';
import { DEMO_MODE } from '@/lib/config';

export const metadata: Metadata = { title: 'Watchlists' };

export default async function WatchlistsPage() {
  // Demo mode: no Supabase project configured, so skip constructing a
  // client with missing credentials and go straight to the sign-in prompt.
  const user = DEMO_MODE ? null : (await createClient().auth.getUser()).data.user;

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <p className="text-sm text-ink-500">Sign in to manage your watchlists.</p>
        <Link href="/auth/login?next=/watchlists" className="mt-3 inline-block text-sm text-signal hover:underline">Sign in</Link>
      </div>
    );
  }

  const supabase = createClient();
  const { data } = await supabase
    .from('watchlists')
    .select('*, watchlist_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container py-6">
      <h1 className="font-display text-2xl text-ink-950">Watchlists</h1>
      <p className="mt-1 text-sm text-ink-500">Group products you're tracking, e.g. "Travel headphones" or "University laptop".</p>
      <div className="mt-6">
        <WatchlistsClient initialWatchlists={data ?? []} />
      </div>
    </div>
  );
}
