'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FilterPanel } from '@/components/search/filter-panel';
import type { SearchFacets } from '@/lib/types';

export function MobileFilterDrawer({ facets }: { facets: SearchFacets }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="mb-4 font-display text-lg">Filters</DialogTitle>
        <FilterPanel facets={facets} onApplied={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
