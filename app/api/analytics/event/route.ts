import { NextRequest, NextResponse } from 'next/server';
import { analyticsEventSchema } from '@/lib/validation/schemas';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { createClient } from '@/lib/supabase/server';
import { DEMO_MODE } from '@/lib/config';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });

  let userId: string | undefined;
  if (!DEMO_MODE) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }

  await AnalyticsService.track({ ...parsed.data, userId });
  return NextResponse.json({ ok: true });
}
