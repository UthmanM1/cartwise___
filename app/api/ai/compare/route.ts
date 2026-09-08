import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/ai-service';
import { aiCompareRequestSchema } from '@/lib/validation/schemas';
import { DEMO_MODE } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = aiCompareRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { productIds, question } = parsed.data;
  const { answer, usage } = await AIService.compareWithQuestion(productIds, question);

  if (!DEMO_MODE) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: session } = await supabase
        .from('comparison_sessions')
        .insert({
          user_id: user?.id ?? null,
          question,
          ai_summary: answer.answer,
          ai_sources: answer.sourceProductIds,
        })
        .select('id')
        .single();

      if (session) {
        await supabase.from('comparison_items').insert(
          productIds.map((productId, i) => ({ session_id: session.id, product_id: productId, sort_order: i }))
        );
      }

      await supabase.from('ai_requests').insert({
        user_id: user?.id ?? null,
        comparison_id: session?.id ?? null,
        provider: usage.provider,
        model: usage.model,
        prompt_tokens: usage.promptTokens,
        completion_tokens: usage.completionTokens,
        estimated_cost_usd: usage.estimatedCostUsd,
        latency_ms: usage.latencyMs,
        status: usage.status,
        error_message: usage.errorMessage,
      });
    } catch {
      // Persistence failures must never block returning the answer to the user.
    }
  }

  return NextResponse.json({ answer, usage });
}
