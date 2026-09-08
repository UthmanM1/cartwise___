'use client';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn('flex h-10 items-center justify-between gap-2 rounded-sm border border-ink-300 bg-white px-3 text-sm', className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon><ChevronDown className="h-4 w-4 text-ink-500" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children, ...props }: SelectPrimitive.SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className="z-50 overflow-hidden rounded-sm border border-ink-200 bg-white shadow-pop" {...props}>
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn('relative flex cursor-pointer select-none items-center rounded-sm px-6 py-2 text-sm data-[highlighted]:bg-ink-100 outline-none', className)}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-1.5"><Check className="h-3.5 w-3.5" /></SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
