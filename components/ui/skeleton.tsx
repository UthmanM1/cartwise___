import { cn } from '@/lib/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-sm bg-[linear-gradient(90deg,theme(colors.ink.100)_25%,theme(colors.ink.50)_37%,theme(colors.ink.100)_63%)] bg-[length:400%_100%]',
        className
      )}
    />
  );
}
