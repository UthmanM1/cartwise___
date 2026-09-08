import { describe, it, expect } from 'vitest';
import { AIService } from '@/lib/services/ai-service';
import { ProductService } from '@/lib/services/product-service';

describe('AIService (demo fallback)', () => {
  it('returns sourceProductIds that are a subset of the requested product ids', async () => {
    const products = await ProductService.getByCategory('headphones');
    const ids = products.slice(0, 3).map((p) => p.id);
    const { answer } = await AIService.compareWithQuestion(ids, 'Which has the best battery life?');
    answer.sourceProductIds.forEach((id) => expect(ids).toContain(id));
  });

  it('never fabricates a product not in the comparison set', async () => {
    const products = await ProductService.getByCategory('laptops');
    const chosen = products.slice(0, 2);
    const otherProduct = products[2]!;
    const { answer } = await AIService.compareWithQuestion(chosen.map((p) => p.id), 'Which offers the best value?');
    expect(answer.answer).not.toContain(otherProduct.title);
  });

  it('answers a battery-life question by naming the product with the highest battery spec', async () => {
    const products = await ProductService.getByCategory('headphones');
    const chosen = products.slice(0, 3);
    const { answer } = await AIService.compareWithQuestion(chosen.map((p) => p.id), 'Which has the best battery life?');

    const batteryValues = chosen.map((p) => ({
      title: p.title,
      value: p.specifications.find((s) => s.key === 'battery_life_hours')?.numericValue ?? 0,
    }));
    const winner = batteryValues.sort((a, b) => b.value - a.value)[0]!;
    expect(answer.answer).toContain(winner.title);
  });

  it('asks for at least 2 products before answering', async () => {
    const products = await ProductService.getByCategory('monitors');
    const { answer } = await AIService.compareWithQuestion([products[0]!.id], 'Which is best?');
    expect(answer.answer).toMatch(/at least two/i);
  });

  it('returns a demo provider tag when no API key is configured', async () => {
    const products = await ProductService.getByCategory('cameras');
    const chosen = products.slice(0, 2);
    const { answer } = await AIService.compareWithQuestion(chosen.map((p) => p.id), 'Which offers the best value?');
    expect(answer.provider).toBe('demo');
  });
});
