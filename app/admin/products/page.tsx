import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';
import { ProductService } from '@/lib/services/product-service';
import { formatPrice, formatRelativeDate } from '@/lib/utils/format';
import { mulberry32, seedFromString, randInt } from '@/lib/utils/prng';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Admin — Products', robots: { index: false, follow: false } };

interface PageProps { searchParams: { q?: string; category?: string } }

export default async function AdminProductsPage({ searchParams }: PageProps) {
  let products = await ProductService.getAll();

  if (searchParams.category) products = products.filter((p) => p.categorySlug === searchParams.category);
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    products = products.filter((p) => p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }

  return (
    <AdminShell title="Products">
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search products…"
          className="h-9 w-64 rounded-sm border border-ink-700 bg-ink-900 px-3 text-sm text-paper placeholder:text-ink-500"
        />
        <button className="rounded-sm bg-signal px-3 py-1.5 text-sm text-white">Search</button>
      </form>

      <div className="overflow-x-auto rounded-md border border-ink-800">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Merchant</th>
              <th className="p-3">Price</th>
              <th className="p-3">Availability</th>
              <th className="p-3">Views</th>
              <th className="p-3">Comparisons</th>
              <th className="p-3">Saves</th>
              <th className="p-3">Merchant clicks</th>
              <th className="p-3">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 60).map((p) => {
              const rng = mulberry32(seedFromString(`admin-${p.id}`));
              const views = randInt(rng, 40, 2400);
              const comparisonsCount = randInt(rng, 2, 180);
              const saves = randInt(rng, 0, 320);
              const clicks = randInt(rng, 10, 900);
              return (
                <tr key={p.id} className="border-t border-ink-800 text-ink-200">
                  <td className="p-3">
                    <p className="font-medium text-paper">{p.title}</p>
                    <p className="text-xs text-ink-500">{p.brand}</p>
                  </td>
                  <td className="p-3 capitalize">{p.categorySlug.replace('-', ' ')}</td>
                  <td className="p-3">{p.offers[0]?.merchant.name}</td>
                  <td className="p-3">{formatPrice(p.price, p.currency)}</td>
                  <td className="p-3"><Badge variant={p.availability === 'in_stock' ? 'good' : p.availability === 'out_of_stock' ? 'bad' : 'warn'}>{p.availability.replace('_', ' ')}</Badge></td>
                  <td className="p-3">{views.toLocaleString('en-GB')}</td>
                  <td className="p-3">{comparisonsCount}</td>
                  <td className="p-3">{saves}</td>
                  <td className="p-3">{clicks}</td>
                  <td className="p-3">{formatRelativeDate(p.updatedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-500">Engagement columns (views, comparisons, saves, clicks) use demo figures — connect analytics_events / merchant_clicks in live mode.</p>
    </AdminShell>
  );
}
