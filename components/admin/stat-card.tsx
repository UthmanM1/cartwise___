import { cn } from '@/lib/utils/cn';

export function StatCard({ label, value, delta, deltaGood = true }: { label: string; value: string; delta?: string; deltaGood?: boolean }) {
  return (
    <div className="rounded-md border border-ink-800 bg-ink-900 p-4">
      <p className="text-xs uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-display text-2xl text-paper">{value}</p>
      {delta && <p className={cn('mt-1 text-xs font-medium', deltaGood ? 'text-good-500' : 'text-bad-500')}>{delta}</p>}
    </div>
  );
}
