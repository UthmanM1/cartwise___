import { Badge } from '@/components/ui/badge';
import type { Availability } from '@/lib/types';

const MAP: Record<Availability, { label: string; variant: 'good' | 'warn' | 'bad' }> = {
  in_stock: { label: 'In stock', variant: 'good' },
  limited_stock: { label: 'Limited stock', variant: 'warn' },
  out_of_stock: { label: 'Out of stock', variant: 'bad' },
  preorder: { label: 'Preorder', variant: 'warn' },
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const cfg = MAP[availability];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
