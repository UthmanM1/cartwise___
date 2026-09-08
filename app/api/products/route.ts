import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids');
  const slug = req.nextUrl.searchParams.get('slug');

  if (slug) {
    const product = await ProductService.getBySlug(slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product });
  }

  const ids = idsParam?.split(',').filter(Boolean) ?? [];
  const products = await ProductService.getByIds(ids);
  return NextResponse.json({ products });
}
