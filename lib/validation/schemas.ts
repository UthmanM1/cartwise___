import { z } from 'zod';

export const searchFiltersSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().max(60).optional(),
  brands: z.array(z.string().max(60)).max(20).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  availability: z.array(z.enum(['in_stock', 'limited_stock', 'out_of_stock', 'preorder'])).optional(),
  features: z.array(z.string().max(80)).max(20).optional(),
  merchants: z.array(z.string().max(60)).max(20).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'value']).optional(),
  page: z.coerce.number().int().min(1).max(500).optional(),
  pageSize: z.coerce.number().int().min(1).max(60).optional(),
});

export const aiCompareRequestSchema = z.object({
  productIds: z.array(z.string().min(1)).min(2).max(4),
  question: z.string().min(3).max(300),
});

export const saveProductSchema = z.object({
  productId: z.string().min(1),
});

export const createWatchlistSchema = z.object({
  name: z.string().min(1).max(80),
});

export const addWatchlistItemSchema = z.object({
  watchlistId: z.string().min(1),
  productId: z.string().min(1),
  targetPrice: z.number().min(0).optional(),
});

export const priceAlertSchema = z.object({
  watchlistItemId: z.string().min(1),
  targetPrice: z.number().min(0),
});

export const analyticsEventSchema = z.object({
  eventType: z.enum([
    'page_viewed', 'search_started', 'search_completed', 'product_viewed', 'product_saved',
    'product_unsaved', 'comparison_started', 'comparison_product_added', 'comparison_product_removed',
    'comparison_completed', 'ai_comparison_started', 'ai_comparison_completed', 'watchlist_created',
    'watchlist_product_added', 'price_alert_created', 'merchant_clicked', 'account_created',
  ]),
  metadata: z.record(z.unknown()).optional(),
  sessionId: z.string().max(100).optional(),
});

export const merchantClickSchema = z.object({
  productId: z.string().min(1),
  merchantId: z.string().min(1),
  comparisonId: z.string().optional(),
  source: z.enum(['search', 'compare', 'product_page', 'saved', 'recommendation']),
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
