import { describe, it, expect } from 'vitest';
import {
  authSchema,
  searchFiltersSchema,
  aiCompareRequestSchema,
  analyticsEventSchema,
  createWatchlistSchema,
  addWatchlistItemSchema,
} from '@/lib/validation/schemas';

describe('validation schemas', () => {
  it('rejects an invalid email on signup/login', () => {
    const result = authSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = authSchema.safeParse({ email: 'user@example.com', password: 'short' });
    expect(result.success).toBe(false);
  });

  it('accepts valid auth credentials', () => {
    const result = authSchema.safeParse({ email: 'user@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('coerces numeric query params for search filters', () => {
    const result = searchFiltersSchema.safeParse({ minPrice: '100', maxPrice: '500', page: '2' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minPrice).toBe(100);
      expect(result.data.page).toBe(2);
    }
  });

  it('rejects an AI compare request with fewer than 2 products', () => {
    const result = aiCompareRequestSchema.safeParse({ productIds: ['p1'], question: 'Which is best?' });
    expect(result.success).toBe(false);
  });

  it('rejects an AI compare request with more than 4 products', () => {
    const result = aiCompareRequestSchema.safeParse({ productIds: ['p1', 'p2', 'p3', 'p4', 'p5'], question: 'Which is best?' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown analytics event type', () => {
    const result = analyticsEventSchema.safeParse({ eventType: 'not_a_real_event' });
    expect(result.success).toBe(false);
  });

  it('accepts a known analytics event type with metadata', () => {
    const result = analyticsEventSchema.safeParse({ eventType: 'product_viewed', metadata: { productId: 'p1' } });
    expect(result.success).toBe(true);
  });

  it('rejects an empty watchlist name', () => {
    const result = createWatchlistSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('accepts a watchlist item with a target price', () => {
    const result = addWatchlistItemSchema.safeParse({ watchlistId: 'w1', productId: 'p1', targetPrice: 199.99 });
    expect(result.success).toBe(true);
  });
});
