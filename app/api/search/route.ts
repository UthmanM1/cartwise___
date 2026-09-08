import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/services/search-service';
import { searchFiltersSchema } from '@/lib/validation/schemas';

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = searchFiltersSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid search parameters', details: parsed.error.flatten() }, { status: 400 });
  }
  const result = await SearchService.search(parsed.data);
  return NextResponse.json(result);
}
