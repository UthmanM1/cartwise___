import { AI_PROVIDER } from '@/lib/config';
import { ComparisonService } from '@/lib/services/comparison-service';
import type { AIComparisonAnswer, Product } from '@/lib/types';

export interface AIUsageLog {
  provider: 'openai' | 'anthropic' | 'demo';
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCostUsd?: number;
  latencyMs: number;
  status: 'success' | 'failed';
  errorMessage?: string;
}

/**
 * AIService is the ONLY place allowed to call an LLM. Its hard rule:
 * the model is given a structured, pre-serialized snapshot of the exact
 * products being compared (from ProductService via ComparisonService) and
 * is instructed to answer using ONLY that data — it is never given open
 * internet access and never asked to recall product facts from memory.
 *
 * Every answer returns the sourceProductIds actually used, so the UI can
 * render "Sources used" and the claim is checkable against real data.
 *
 * If no API key is configured (AI_PROVIDER === 'demo'), CARTWISE falls back
 * to a deterministic, rule-based comparison summary built from the same
 * structured data — so the whole app works with zero paid API keys.
 */
export class AIService {
  static async compareWithQuestion(
    productIds: string[],
    question: string
  ): Promise<{ answer: AIComparisonAnswer; usage: AIUsageLog }> {
    const start = Date.now();
    const { products, highlights } = await ComparisonService.compare(productIds);

    if (products.length < 2) {
      return {
        answer: {
          question,
          answer: 'Select at least two products to compare before asking CARTWISE a question.',
          sourceProductIds: products.map((p) => p.id),
          provider: 'demo',
          createdAt: new Date().toISOString(),
        },
        usage: { provider: 'demo', latencyMs: Date.now() - start, status: 'success' },
      };
    }

    if (AI_PROVIDER === 'demo') {
      const answerText = this.buildDemoAnswer(question, products, highlights.map((h) => h.key));
      return {
        answer: {
          question,
          answer: answerText,
          sourceProductIds: products.map((p) => p.id),
          provider: 'demo',
          createdAt: new Date().toISOString(),
        },
        usage: { provider: 'demo', latencyMs: Date.now() - start, status: 'success' },
      };
    }

    try {
      const { text, promptTokens, completionTokens } = await this.callProvider(question, products);
      return {
        answer: {
          question,
          answer: text,
          sourceProductIds: products.map((p) => p.id),
          provider: AI_PROVIDER,
          createdAt: new Date().toISOString(),
        },
        usage: {
          provider: AI_PROVIDER,
          model: AI_PROVIDER === 'openai' ? 'gpt-4o-mini' : 'claude-sonnet-4-6',
          promptTokens,
          completionTokens,
          estimatedCostUsd: this.estimateCost(promptTokens, completionTokens),
          latencyMs: Date.now() - start,
          status: 'success',
        },
      };
    } catch (err) {
      // Never fail the user's request just because the AI provider hiccuped —
      // fall back to the deterministic demo answer and log the failure.
      const answerText = this.buildDemoAnswer(question, products, highlights.map((h) => h.key));
      return {
        answer: {
          question,
          answer: answerText,
          sourceProductIds: products.map((p) => p.id),
          provider: 'demo',
          createdAt: new Date().toISOString(),
        },
        usage: {
          provider: AI_PROVIDER,
          latencyMs: Date.now() - start,
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'Unknown AI provider error',
        },
      };
    }
  }

  private static async callProvider(
    question: string,
    products: Product[]
  ): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
    const dataset = products.map((p) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      price: p.price,
      currency: p.currency,
      rating: p.rating,
      specifications: Object.fromEntries(p.specifications.map((s) => [s.label, `${s.value}${s.unit ?? ''}`])),
      features: p.features,
    }));

    const system = [
      'You are CARTWISE\'s comparison assistant.',
      'You must answer using ONLY the JSON product data provided below.',
      'Never invent a price, spec, rating, or feature that is not present in the data.',
      'If the data does not support an answer, say so explicitly.',
      'Keep the answer to 2-4 sentences, then nothing else.',
      `Product data: ${JSON.stringify(dataset)}`,
    ].join('\n');

    if (AI_PROVIDER === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: question },
          ],
          temperature: 0.2,
          max_tokens: 300,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI request failed: ${res.status}`);
      const json = await res.json();
      return {
        text: json.choices?.[0]?.message?.content ?? 'No answer returned.',
        promptTokens: json.usage?.prompt_tokens ?? 0,
        completionTokens: json.usage?.completion_tokens ?? 0,
      };
    }

    // Anthropic
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system,
        messages: [{ role: 'user', content: question }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic request failed: ${res.status}`);
    const json = await res.json();
    const text = json.content?.map((b: { text?: string }) => b.text ?? '').join('') ?? 'No answer returned.';
    return {
      text,
      promptTokens: json.usage?.input_tokens ?? 0,
      completionTokens: json.usage?.output_tokens ?? 0,
    };
  }

  private static estimateCost(promptTokens = 0, completionTokens = 0): number {
    // Rough gpt-4o-mini-equivalent blended rate for the admin usage estimate.
    const inputRatePer1k = 0.00015;
    const outputRatePer1k = 0.0006;
    return Math.round((promptTokens * inputRatePer1k + completionTokens * outputRatePer1k) / 1000 * 100000) / 100000;
  }

  /**
   * Deterministic, template-based comparison summary. Reads only the
   * highlight keys computed by ComparisonService (already real arithmetic
   * over real data), and turns them into natural-sounding sentences.
   * This is what runs with zero API keys configured.
   */
  private static buildDemoAnswer(question: string, products: Product[], highlightKeys: string[]): string {
    const q = question.toLowerCase();
    const byId = new Map(products.map((p) => [p.id, p]));

    const cheapest = [...products].sort((a, b) => a.price - b.price)[0]!;
    const topRated = [...products].sort((a, b) => b.rating - a.rating)[0]!;
    const bestValue = [...products].sort((a, b) => b.rating / b.price - a.rating / a.price)[0]!;

    const lightestSpecKey = ['weight_g', 'weight_kg'].find((k) => products.some((p) => p.specifications.some((s) => s.key === k)));
    const batterySpecKey = ['battery_life_hours', 'battery_mah', 'battery_runtime_min'].find((k) =>
      products.some((p) => p.specifications.some((s) => s.key === k))
    );

    const findBest = (key: string, direction: 'higher' | 'lower') => {
      const withSpec = products
        .map((p) => ({ p, v: p.specifications.find((s) => s.key === key)?.numericValue }))
        .filter((x): x is { p: Product; v: number } => x.v !== undefined);
      if (withSpec.length === 0) return undefined;
      return withSpec.reduce((best, cur) => (direction === 'higher' ? (cur.v > best.v ? cur : best) : cur.v < best.v ? cur : best)).p;
    };

    if ((q.includes('travel') || q.includes('portable') || q.includes('light')) && lightestSpecKey) {
      const winner = findBest(lightestSpecKey, 'lower');
      if (winner) {
        const spec = winner.specifications.find((s) => s.key === lightestSpecKey)!;
        return `Based on the available specifications, ${winner.title} is the strongest option for travel because it is the lightest at ${spec.value}${spec.unit ?? ''}${
          batterySpecKey ? ` and has a competitive battery rating` : ''
        }.`;
      }
    }

    if (q.includes('battery') && batterySpecKey) {
      const winner = findBest(batterySpecKey, 'higher');
      if (winner) {
        const spec = winner.specifications.find((s) => s.key === batterySpecKey)!;
        return `${winner.title} has the best battery life in this comparison at ${spec.value}${spec.unit ?? ''}, ahead of the other ${products.length - 1} product${products.length > 2 ? 's' : ''} compared.`;
      }
    }

    if (q.includes('value') || q.includes('cheap') || q.includes('budget')) {
      return `Based on rating relative to price, ${bestValue.title} offers the best value at £${bestValue.price.toFixed(2)} with a ${bestValue.rating.toFixed(1)}/5 rating.`;
    }

    if (q.includes('university') || q.includes('student') || q.includes('budget-friendly')) {
      return `For a student budget, ${cheapest.title} is the most affordable at £${cheapest.price.toFixed(2)}, while ${topRated.title} is the highest-rated option if a slightly higher price is acceptable.`;
    }

    // Generic fallback grounded in the same real numbers.
    return `Comparing ${products.map((p) => p.title).join(', ')}: ${cheapest.title} is the cheapest at £${cheapest.price.toFixed(2)}, ${topRated.title} has the highest rating (${topRated.rating.toFixed(1)}/5), and ${bestValue.title} offers the best rating-to-price ratio overall.`;
  }
}
