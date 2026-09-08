// Core domain types for CARTWISE.
// These mirror the database schema in supabase/migrations/0001_init.sql
// and are the single source of truth consumed by every service.

export type Availability = 'in_stock' | 'limited_stock' | 'out_of_stock' | 'preorder';

export type CategorySlug =
  | 'laptops'
  | 'smartphones'
  | 'headphones'
  | 'monitors'
  | 'cameras'
  | 'running-shoes'
  | 'office-chairs'
  | 'coffee-machines'
  | 'robot-vacuums'
  | 'air-purifiers';

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
  specSchema: SpecSchemaField[];
}

export interface SpecSchemaField {
  key: string;
  label: string;
  unit?: string;
  type: 'number' | 'text' | 'boolean';
  /** true = higher numeric value is "better" for highlighting purposes, false = lower is better, undefined = not orderable */
  higherIsBetter?: boolean;
}

export interface Merchant {
  id: string;
  slug: string;
  name: string;
  logoText: string;
  isDemo: boolean;
  deliveryNotes?: string;
}

export interface ProductSpecification {
  key: string;
  label: string;
  value: string;
  unit?: string;
  numericValue?: number;
}

export interface ProductFeature {
  feature: string;
}

export interface MerchantOffer {
  merchant: Merchant;
  price: number;
  previousPrice?: number;
  currency: string;
  availability: Availability;
  updatedAt: string; // ISO timestamp
}

export interface PricePoint {
  date: string; // ISO date
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  categoryId: string;
  categorySlug: CategorySlug;
  description: string;
  currency: string;
  rating: number;
  reviewCount: number;
  availability: Availability;
  imageUrl: string;
  images: string[];
  productUrl?: string;
  affiliateUrl?: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;

  // Aggregated / joined data
  price: number; // lowest current price across merchants
  previousPrice?: number;
  specifications: ProductSpecification[];
  features: string[];
  offers: MerchantOffer[]; // per-merchant prices
  priceHistory: PricePoint[];
}

export interface SearchFilters {
  query?: string;
  category?: CategorySlug;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: Availability[];
  features?: string[];
  merchants?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'value';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  brands: { value: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: { value: number; count: number }[];
  availability: { value: Availability; count: number }[];
  merchants: { value: string; count: number }[];
  features: { value: string; count: number }[];
}

export interface ComparisonHighlight {
  key: string; // spec key, or 'price' | 'rating' | 'value'
  bestProductId: string;
}

export interface ComparisonResult {
  products: Product[];
  highlights: ComparisonHighlight[];
}

export interface AIComparisonAnswer {
  question: string;
  answer: string;
  sourceProductIds: string[];
  provider: 'openai' | 'anthropic' | 'demo';
  createdAt: string;
}

export interface RecommendationScore {
  productId: string;
  overallScore: number; // 0-100
  valueScore: number;
  performanceScore: number;
  priceScore: number;
  featureScore: number;
  reasons: string[]; // "why" bullets
  tradeOffs: string[]; // "trade-off" bullets
}

export interface SavedProduct {
  id: string;
  productId: string;
  product: Product;
  priceAtSave: number;
  createdAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  productId: string;
  product: Product;
  targetPrice?: number;
  alertStatus: 'waiting' | 'triggered' | 'disabled';
  createdAt: string;
}

export interface ComparisonSession {
  id: string;
  productIds: string[];
  products: Product[];
  question?: string;
  aiSummary?: string;
  aiSourceIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type AnalyticsEventType =
  | 'page_viewed'
  | 'search_started'
  | 'search_completed'
  | 'product_viewed'
  | 'product_saved'
  | 'product_unsaved'
  | 'comparison_started'
  | 'comparison_product_added'
  | 'comparison_product_removed'
  | 'comparison_completed'
  | 'ai_comparison_started'
  | 'ai_comparison_completed'
  | 'watchlist_created'
  | 'watchlist_product_added'
  | 'price_alert_created'
  | 'merchant_clicked'
  | 'account_created';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export interface UserPreferences {
  priority?: 'price' | 'performance' | 'value' | 'features';
  preferredBrands?: string[];
  role?: 'user' | 'admin';
}
