import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addWatchlistItemSchema } from '@/lib/validation/schemas';
import { DEMO_MODE } from '@/lib/config';
import { ProductService } from '@/lib/services/product-service';
import { PriceService } from '@/lib/services/price-service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (DEMO_MODE) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = addWatchlistItemSchema.safeParse({ ...body, watchlistId: params.id });
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const product = await ProductService.getById(parsed.data.productId);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const alertStatus = PriceService.evaluateAlert(product.price, parsed.data.targetPrice);

  const { error } = await supabase.from('watchlist_items').upsert(
    { watchlist_id: params.id, product_id: product.id, target_price: parsed.data.targetPrice ?? null, alert_status: alertStatus },
    { onConflict: 'watchlist_id,product_id' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, alertStatus });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (DEMO_MODE) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { productId } = await req.json().catch(() => ({ productId: undefined }));
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('watchlist_items').delete().eq('watchlist_id', params.id).eq('product_id', productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
