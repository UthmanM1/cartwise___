/**
 * Seeds a live Supabase project with the same synthetic catalog used by
 * demo mode, so live mode and demo mode show identical data out of the box.
 *
 * Usage:
 *   1. Run the migration in supabase/migrations/0001_init.sql against your project.
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *   3. npm run seed
 *
 * This script uses the service-role key and bypasses RLS deliberately —
 * never run it against production data without reviewing what it inserts.
 */
import { createClient } from '@supabase/supabase-js';
import { generateAllProducts } from '../lib/data/generate-products';
import { CATEGORY_DEFS } from '../lib/data/categories';
import { MERCHANTS } from '../lib/data/merchants';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Aborting seed.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  console.log('Seeding categories...');
  const categoryIdBySlug = new Map<string, string>();
  for (const def of CATEGORY_DEFS) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ slug: def.slug, name: def.name, description: def.description, icon: def.icon, spec_schema: def.specSchema }, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) throw error;
    categoryIdBySlug.set(data.slug, data.id);
  }

  console.log('Seeding merchants...');
  const merchantIdByLocalId = new Map<string, string>();
  for (const m of MERCHANTS) {
    const { data, error } = await supabase
      .from('merchants')
      .upsert({ slug: m.slug, name: m.name, logo_text: m.logoText, is_demo: m.isDemo, delivery_notes: m.deliveryNotes }, { onConflict: 'slug' })
      .select('id, slug')
      .single();
    if (error) throw error;
    merchantIdByLocalId.set(m.id, data.id);
  }

  console.log('Generating synthetic products...');
  const products = generateAllProducts();

  console.log(`Seeding ${products.length} products...`);
  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug)!;

    const { data: productRow, error: productError } = await supabase
      .from('products')
      .upsert(
        {
          slug: p.slug,
          title: p.title,
          brand: p.brand,
          category_id: categoryId,
          description: p.description,
          currency: p.currency,
          rating: p.rating,
          review_count: p.reviewCount,
          availability: p.availability,
          product_url: p.productUrl,
          affiliate_url: p.affiliateUrl,
          image_url: p.imageUrl,
          is_demo: true,
        },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single();
    if (productError) throw productError;

    await supabase.from('product_categories').upsert({ product_id: productRow.id, category_id: categoryId }, { onConflict: 'product_id,category_id' });

    await supabase.from('product_specifications').delete().eq('product_id', productRow.id);
    if (p.specifications.length > 0) {
      await supabase.from('product_specifications').insert(
        p.specifications.map((s, i) => ({
          product_id: productRow.id,
          key: s.key,
          label: s.label,
          value: s.value,
          unit: s.unit,
          numeric_value: s.numericValue,
          sort_order: i,
        }))
      );
    }

    await supabase.from('product_features').delete().eq('product_id', productRow.id);
    if (p.features.length > 0) {
      await supabase.from('product_features').insert(p.features.map((f, i) => ({ product_id: productRow.id, feature: f, sort_order: i })));
    }

    await supabase.from('product_images').delete().eq('product_id', productRow.id);
    if (p.images.length > 0) {
      await supabase.from('product_images').insert(p.images.map((url, i) => ({ product_id: productRow.id, url, sort_order: i })));
    }

    for (const offer of p.offers) {
      const merchantId = merchantIdByLocalId.get(offer.merchant.id);
      if (!merchantId) continue;
      await supabase.from('product_prices').upsert(
        {
          product_id: productRow.id,
          merchant_id: merchantId,
          price: offer.price,
          previous_price: offer.previousPrice,
          currency: offer.currency,
          availability: offer.availability,
          updated_at: offer.updatedAt,
        },
        { onConflict: 'product_id,merchant_id' }
      );
    }

    await supabase.from('price_history').delete().eq('product_id', productRow.id);
    if (p.priceHistory.length > 0) {
      await supabase.from('price_history').insert(p.priceHistory.map((h) => ({ product_id: productRow.id, price: h.price, recorded_at: h.date })));
    }
  }

  console.log('Seed complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
