'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useCompareSelection } from '@/lib/hooks/use-compare-selection';
import { track } from '@/lib/utils/track';

export function CompareCheckbox({ productId }: { productId: string }) {
  const { isSelected, toggle, isFull } = useCompareSelection();
  const checked = isSelected(productId);

  return (
    <label className="flex items-center gap-2 text-xs text-ink-600 cursor-pointer select-none">
      <Checkbox
        checked={checked}
        disabled={!checked && isFull}
        onCheckedChange={() => {
          const added = toggle(productId);
          if (added) track(checked ? 'comparison_product_removed' : 'comparison_product_added', { productId });
        }}
      />
      Compare
    </label>
  );
}
