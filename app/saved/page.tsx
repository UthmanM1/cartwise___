import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductService } from '@/lib/services/product-service';
import { ProductGrid } from '@/components/search/product-grid';
import { DEMO_MODE } from '@/lib/config';

export const metadata: Metadata = { title: 'Saved products' };

export default async function SavedPage() {
  // Demo mode has no Supabase project configured, so there is no auth
  // system to query — render the sign-in prompt directly rather than
  // constructing a Supabase client with missing credentials.
  const user = DEMO_MODE ? null : (await createClient().auth.getUser()).data.user;

  // Middleware already redirects unauthenticated users to /auth/login, but
  // guard again here in case this page is ever rendered without middleware.
  if (!user) {
    return (
      <div className="container py-16 text-center">
        <p className="text-sm text-ink-500">Sign in to see your saved products.</p>
        <Link href="/auth/login?next=/saved" className="mt-3 inline-block text-sm text-signal hover:underline">Sign in</Link>
      </div>
    );
  }

  const supabase = createClient();
  const { data: rows } = await supabase.from('saved_products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  const products = await ProductService.getByIds((rows ?? []).map((r) => r.product_id));

  return (
    <div className="container py-6">
      <h1 className="font-display text-2xl text-ink-950">Saved products</h1>
      <p className="mt-1 text-sm text-ink-500">{products.length} product{products.length === 1 ? '' : 's'} saved</p>

      {products.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-ink-300 py-16 text-center text-sm text-ink-500">
          Nothing saved yet. Tap the heart icon on any product to save it here.
        </div>
      ) : (
        <div className="mt-6">
          <ProductGrid products={products} savedIds={products.map((p) => p.id)} />
        </div>
      )}
    </div>
  );
}
