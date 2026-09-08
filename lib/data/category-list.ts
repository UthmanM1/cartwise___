import { CATEGORY_DEFS } from '@/lib/data/categories';
import type { Category } from '@/lib/types';

export const CATEGORIES: Category[] = CATEGORY_DEFS.map((def) => ({
  id: `cat-${def.slug}`,
  slug: def.slug,
  name: def.name,
  description: def.description,
  icon: def.icon,
  specSchema: def.specSchema,
}));

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
