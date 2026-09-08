'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils/cn';

export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return <TabsPrimitive.List className={cn('flex gap-1 border-b border-ink-200', className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'px-3 py-2 text-sm font-medium text-ink-500 border-b-2 border-transparent data-[state=active]:text-ink-950 data-[state=active]:border-signal',
        className
      )}
      {...props}
    />
  );
}
export const TabsContent = TabsPrimitive.Content;
