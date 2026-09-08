import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { saveProductSchema } from '@/lib/validation/schemas';
import { ProductService } from '@/lib/services/product-service';
import { DEMO_MODE } from '@/lib/config';

export async function GET() {
  if (DEMO_MODE) return NextResponse.json({ saved: [] });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase.from('saved_products').select('*').eq('user_id', user.id);
  return NextResponse.json({ saved: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = saveProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  if (DEMO_MODE) {
    // No Supabase configured — saving requires authentication which requires a real project.
    return NextResponse.json({ error: 'Unauthorized', reason: 'Sign in required. Configure Supabase to enable accounts.' }, { status: 401 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const product = await ProductService.getById(parsed.data.productId);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const { error } = await supabase
    .from('saved_products')
    .upsert({ user_id: user.id, product_id: product.id, price_at_save: product.price }, { onConflict: 'user_id,product_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = saveProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  if (DEMO_MODE) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('saved_products').delete().eq('user_id', user.id).eq('product_id', parsed.data.productId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
