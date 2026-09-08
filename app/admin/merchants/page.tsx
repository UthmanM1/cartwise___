import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';
import { getDemoMerchantStats } from '@/lib/data/admin-demo-stats';
import { formatPrice } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Admin — Merchants', robots: { index: false, follow: false } };

export default function AdminMerchantsPage() {
  const stats = getDemoMerchantStats();

  return (
    <AdminShell title="Merchants">
      <p className="mb-4 text-xs text-ink-500">
        These are demo merchants. CARTWISE does not have real affiliate partnerships with any of them —
        see MerchantService for how a real affiliate network feed would replace this.
      </p>
      <div className="overflow-x-auto rounded-md border border-ink-800">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="p-3">Merchant</th>
              <th className="p-3">Product count</th>
              <th className="p-3">Clicks</th>
              <th className="p-3">Outbound CTR</th>
              <th className="p-3">Average price</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.merchant.id} className="border-t border-ink-800 text-ink-200">
                <td className="p-3 font-medium text-paper">{s.merchant.name}</td>
                <td className="p-3">{s.productCount}</td>
                <td className="p-3">{s.clicks.toLocaleString('en-GB')}</td>
                <td className="p-3">{s.outboundCtr}%</td>
                <td className="p-3">{formatPrice(s.avgPrice)}</td>
                <td className="p-3"><Badge variant="neutral">{s.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
