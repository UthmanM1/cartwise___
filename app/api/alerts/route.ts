import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { priceAlertSchema } from '@/lib/validation/schemas';
import { DEMO_MODE } from '@/lib/config';
import { PriceService } from '@/lib/services/price-service';
import { AnalyticsService } from '@/lib/services/analytics-service';

/**
 * Updates the target price for a watchlist item and recomputes its alert
 * status. Sending an actual email when a price alert triggers requires an
 * outbound email provider (e.g. Resend) — the backend shape is ready
 * (alert_status column + this endpoint), but no email is sent unless
 * RESEND_API_KEY (or similar) is configured. See ARCHITECTURE.md.
 */
export async function POST(req: NextRequest) {
  if (DEMO_MODE) return NextResponse.json({ error: 'Unauthorized', reason: 'Sign in required. Configure Supabase to enable accounts.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = priceAlertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: item } = await supabase
    .from('watchlist_items')
    .select('*, products(*, product_prices(*))')
    .eq('id', parsed.data.watchlistItemId)
    .single();

  if (!item) return NextResponse.json({ error: 'Watchlist item not found' }, { status: 404 });

  const currentPrice = Math.min(...(item.products.product_prices?.map((p: { price: number }) => p.price) ?? [Infinity]));
  const alertStatus = PriceService.evaluateAlert(currentPrice, parsed.data.targetPrice);

  const { error } = await supabase
    .from('watchlist_items')
    .update({ target_price: parsed.data.targetPrice, alert_status: alertStatus })
    .eq('id', parsed.data.watchlistItemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await AnalyticsService.track({ userId: user.id, eventType: 'price_alert_created', metadata: { watchlistItemId: parsed.data.watchlistItemId, targetPrice: parsed.data.targetPrice } });

  return NextResponse.json({ ok: true, alertStatus });
}
