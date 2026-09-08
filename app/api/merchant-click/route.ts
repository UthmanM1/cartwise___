import { NextRequest, NextResponse } from 'next/server';
import { merchantClickSchema } from '@/lib/validation/schemas';
import { MerchantService } from '@/lib/services/merchant-service';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { createClient } from '@/lib/supabase/server';
import { DEMO_MODE } from '@/lib/config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = merchantClickSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  let userId: string | undefined;
  if (!DEMO_MODE) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }

  const result = await MerchantService.trackClick({ ...parsed.data, userId });
  await AnalyticsService.track({ eventType: 'merchant_clicked', userId, metadata: parsed.data });

  return NextResponse.json(result);
}
