import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createWatchlistSchema, addWatchlistItemSchema } from '@/lib/validation/schemas';
import { DEMO_MODE } from '@/lib/config';

export async function GET() {
  if (DEMO_MODE) return NextResponse.json({ watchlists: [] });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('watchlists')
    .select('*, watchlist_items(*, products(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ watchlists: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (DEMO_MODE) return NextResponse.json({ error: 'Unauthorized', reason: 'Sign in required. Configure Supabase to enable accounts.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createWatchlistSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('watchlists').insert({ user_id: user.id, name: parsed.data.name }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watchlist: data });
}
