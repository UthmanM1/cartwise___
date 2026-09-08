import type React from 'react';
import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';
import { StatCard } from '@/components/admin/stat-card';
import { AdminLineChart } from '@/components/admin/admin-line-chart';
import { AdminBarChart } from '@/components/admin/admin-bar-chart';
import { getDemoDashboardStats } from '@/lib/data/admin-demo-stats';
import { DEMO_MODE } from '@/lib/config';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Admin overview', robots: { index: false, follow: false } };

export default function AdminOverviewPage() {
  // LIVE MODE would replace getDemoDashboardStats() with aggregate queries
  // against analytics_events / merchant_clicks / ai_requests, gated by an
  // admin-role check on the current Supabase user (see ARCHITECTURE.md).
  const stats = getDemoDashboardStats();

  return (
    <AdminShell title="Overview">
      {DEMO_MODE && <Badge variant="warn" className="mb-4">Demo data — connect Supabase for live analytics</Badge>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total users" value={stats.totals.totalUsers.toLocaleString('en-GB')} />
        <StatCard label="Searches" value={stats.totals.searches.toLocaleString('en-GB')} />
        <StatCard label="Product views" value={stats.totals.productViews.toLocaleString('en-GB')} />
        <StatCard label="Comparisons" value={stats.totals.comparisons.toLocaleString('en-GB')} />
        <StatCard label="AI comparisons" value={stats.totals.aiComparisons.toLocaleString('en-GB')} />
        <StatCard label="Saved products" value={stats.totals.savedProducts.toLocaleString('en-GB')} />
        <StatCard label="Merchant clicks" value={stats.totals.merchantClicks.toLocaleString('en-GB')} />
        <StatCard label="Watchlists" value={stats.totals.watchlists.toLocaleString('en-GB')} />
        <StatCard label="Price alerts" value={stats.totals.priceAlerts.toLocaleString('en-GB')} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="User growth"><AdminLineChart data={stats.userGrowth} /></ChartCard>
        <ChartCard title="Search volume (last 7 days)"><AdminBarChart data={stats.searchVolume} /></ChartCard>
        <ChartCard title="Popular categories"><AdminBarChart data={stats.popularCategories.slice(0, 6)} color="#95928a" /></ChartCard>
        <ChartCard title="Comparison activity (last 7 days)"><AdminLineChart data={stats.comparisonActivity} color="#3f7d42" /></ChartCard>
        <ChartCard title="Merchant clicks by merchant"><AdminBarChart data={stats.merchantClicksByMerchant} /></ChartCard>
        <ChartCard title="AI usage over time"><AdminLineChart data={stats.aiUsageOverTime} color="#b3791b" /></ChartCard>
      </div>
    </AdminShell>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-ink-800 bg-ink-900 p-4">
      <h3 className="mb-2 text-sm font-medium text-ink-200">{title}</h3>
      {children}
    </div>
  );
}
