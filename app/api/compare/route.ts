import { NextRequest, NextResponse } from 'next/server';
import { ComparisonService } from '@/lib/services/comparison-service';

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean) ?? [];
  if (ids.length === 0) {
    return NextResponse.json({ products: [], highlights: [] });
  }
  const result = await ComparisonService.compare(ids);
  return NextResponse.json(result);
}
