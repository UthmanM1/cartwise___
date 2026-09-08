import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva('inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', {
  variants: {
    variant: {
      neutral: 'bg-ink-100 text-ink-700',
      signal: 'bg-signal-50 text-signal-700',
      good: 'bg-good-50 text-good-600',
      warn: 'bg-warn-50 text-warn-500',
      bad: 'bg-bad-50 text-bad-500',
      dark: 'bg-ink-950 text-paper',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
