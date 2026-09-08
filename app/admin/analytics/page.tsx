import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';
import { getDemoDashboardStats } from '@/lib/data/admin-demo-stats';
import { AdminBarChart } from '@/components/admin/admin-bar-chart';

export const metadata: Metadata = { title: 'Admin — Analytics', robots: { index: false, follow: false } };

export default function AdminAnalyticsPage() {
  const { funnels, popularProducts, priceChangeEvents } = getDemoDashboardStats();

  return (
    <AdminShell title="Analytics">
      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelCard title="Search funnel" steps={[
          { label: 'Searches started', value: funnels.search.started },
          { label: 'Searches completed', value: funnels.search.completed },
        ]} />
        <FunnelCard title="Product funnel" steps={[
          { label: 'Products viewed', value: funnels.product.viewed },
          { label: 'Products saved', value: funnels.product.saved },
        ]} />
        <FunnelCard title="Comparison funnel" steps={[
          { label: 'Comparisons started', value: funnels.comparison.started },
          { label: 'Comparisons completed', value: funnels.comparison.completed },
          { label: 'AI comparison used', value: funnels.comparison.aiUsed },
        ]} />
        <FunnelCard title="Merchant funnel" steps={[
          { label: 'Merchant clicks', value: funnels.merchant.clicked },
          { label: 'Estimated conversions', value: funnels.merchant.converted },
        ]} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-ink-800 bg-ink-900 p-4">
          <h3 className="mb-2 text-sm font-medium text-ink-200">Most-viewed products</h3>
          <AdminBarChart data={popularProducts} color="#95928a" />
        </div>
        <div className="rounded-md border border-ink-800 bg-ink-900 p-4">
          <h3 className="mb-2 text-sm font-medium text-ink-200">Price change events (last 30 days)</h3>
          <AdminBarChart data={priceChangeEvents} />
        </div>
      </div>
    </AdminShell>
  );
}

function FunnelCard({ title, steps }: { title: string; steps: { label: string; value: number }[] }) {
  const max = Math.max(...steps.map((s) => s.value));
  return (
    <div className="rounded-md border border-ink-800 bg-ink-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-ink-200">{title}</h3>
      <div className="space-y-2">
        {steps.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs text-ink-400"><span>{s.label}</span><span>{s.value.toLocaleString('en-GB')}</span></div>
            <div className="mt-1 h-2 rounded-full bg-ink-800">
              <div className="h-2 rounded-full bg-signal" style={{ width: `${(s.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
