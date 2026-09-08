import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';
import { StatCard } from '@/components/admin/stat-card';
import { AdminLineChart } from '@/components/admin/admin-line-chart';
import { getDemoAiUsageStats } from '@/lib/data/admin-demo-stats';
import { AI_PROVIDER } from '@/lib/config';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Admin — AI usage', robots: { index: false, follow: false } };

export default function AdminAiUsagePage() {
  const stats = getDemoAiUsageStats();

  return (
    <AdminShell title="AI usage">
      <Badge variant={AI_PROVIDER === 'demo' ? 'warn' : 'good'} className="mb-4">
        Current provider: {AI_PROVIDER === 'demo' ? 'Demo (rule-based fallback)' : AI_PROVIDER}
      </Badge>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="AI requests" value={stats.totalRequests.toLocaleString('en-GB')} />
        <StatCard label="Successful" value={stats.successful.toLocaleString('en-GB')} />
        <StatCard label="Failed" value={stats.failed.toLocaleString('en-GB')} deltaGood={false} delta={`${((stats.failed / stats.totalRequests) * 100).toFixed(1)}% error rate`} />
        <StatCard label="Est. tokens" value={stats.estimatedTokens.toLocaleString('en-GB')} />
        <StatCard label="Est. cost" value={`$${stats.estimatedCostUsd.toFixed(2)}`} />
        <StatCard label="Avg latency" value={`${stats.avgLatencyMs}ms`} />
      </div>

      <div className="mt-8 rounded-md border border-ink-800 bg-ink-900 p-4">
        <h3 className="mb-2 text-sm font-medium text-ink-200">AI comparisons over time</h3>
        <AdminLineChart data={stats.requestsOverTime} color="#b3791b" />
      </div>

      <p className="mt-4 text-xs text-ink-500">
        AIService abstracts the provider behind a single interface (see lib/services/ai-service.ts), so switching from
        the demo rule-based fallback to OpenAI or Anthropic is a matter of setting an API key — no UI or route changes
        required.
      </p>
    </AdminShell>
  );
}
