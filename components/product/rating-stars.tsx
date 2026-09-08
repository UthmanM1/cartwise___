import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function RatingStars({ rating, reviewCount, size = 'sm' }: { rating: number; reviewCount?: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(iconSize, i <= Math.round(rating) ? 'fill-signal text-signal' : 'fill-ink-100 text-ink-200')}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-ink-700">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && <span className="text-xs text-ink-400">({reviewCount.toLocaleString('en-GB')})</span>}
    </div>
  );
}
