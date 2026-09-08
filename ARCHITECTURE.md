# CARTWISE Architecture

## Design principle: the service layer is the contract
Every page, API route, and component reads product data through **exactly one** class: `ProductService`. No other file is allowed to import the synthetic generator or query the `products` table directly. This single rule is what makes several other guarantees in this document enforceable rather than aspirational:

- AI can't invent a spec, because `AIService` only ever sees what `ComparisonService` (which only calls `ProductService`) hands it.
- Demo mode and live mode are indistinguishable to every other service, because the branch lives in one place (`ProductService.getAll()`).
- Recommendation scoring can't be gamed by inconsistent data, because every score is computed from the same normalized dataset every other feature uses.

```
ProductService  ──┬─→ SearchService
                   ├─→ ComparisonService ──→ AIService (reads highlights + product data, never raw DB)
                   ├─→ RecommendationService
                   ├─→ PriceService
                   └─→ MerchantService

AnalyticsService — orthogonal, called directly from API routes and client-side track()
```

## Demo mode vs. live mode

`lib/config.ts` defines `DEMO_MODE = !isSupabaseConfigured`. Every service branches on this exactly once, at the top of its data-fetching method, and nowhere else:

```ts
static async getAll(): Promise<Product[]> {
  if (DEMO_MODE) return generateAllProducts();
  return this.getAllLive(); // real Supabase query, see lib/services/product-service.ts
}
```

`getAllLive()` queries `products` joined with `product_specifications`, `product_features`, `product_images`, `product_prices` (+ `merchants`), and `price_history` in a single Supabase query, then maps rows into the same `Product` shape the demo generator produces. This means **every downstream service, page, and test is agnostic to which mode is active** — they only ever see a `Product[]`.

If the live query fails (unseeded project, network issue), `ProductService` logs the error and falls back to the demo catalog rather than crashing the page — a portfolio demo should never show a 500 because of a database hiccup.

## Client/server boundary discipline

`lib/supabase/server.ts` imports `next/headers`, which **only works in Server Components, Route Handlers, and Server Actions** — importing it (even transitively) into a Client Component's bundle is a hard Next.js build error, not a warning.

Because `ProductService` imports `lib/supabase/server.ts` for its live-mode query path, and `ComparisonService`/`SearchService`/`RecommendationService` all import `ProductService`, **none of the service classes in `lib/services/` may be imported into a `'use client'` file**, even just to grab a constant. A client component needing `MAX_COMPARE_PRODUCTS`, for example, imports it from `lib/constants.ts` — a small, dependency-free file that exists specifically so client code never has a reason to reach into a service module.

Rule of thumb going forward: if a value needs to be read from both server and client code, it belongs in `lib/constants.ts` or `lib/types.ts` (both free of `next/headers`, Supabase, or any Node-only import), never in a service file — even one that "already exports it anyway."


## Search architecture

`SearchService.search(filters)`:

1. Pull the full catalog from `ProductService.getAll()`. At real catalog scale this would push filters into a SQL `WHERE` clause with `pg_trgm`/`tsvector` full-text search — the migration already adds a `pg_trgm` GIN index on `products.title` in anticipation of this.
2. Category filter (exact match).
3. Keyword relevance scoring: term-in-title/brand/description scoring, plus a small NLP touch for "under £X" phrasing in natural-language queries like the homepage's example searches.
4. Structured filters: price range, minimum rating, availability, features (AND semantics), merchants.
5. Facet computation over the filtered set (brand counts, price min/max, rating buckets, availability counts, merchant counts, top 12 features) — this is what powers the filter panel's live counts.
6. Sort: relevance (default, preserves scoring order), price asc/desc, rating, or "value" (rating per £100 spent).
7. Pagination.

## Comparison architecture

`ComparisonService.compare(productIds)`:

1. Caps the input at `MAX_COMPARE_PRODUCTS = 4` and resolves them via `ProductService.getByIds()`, which **preserves the caller's ordering** — important so comparison columns don't reshuffle as products are added/removed.
2. Computes highlights with plain arithmetic, never an LLM:
   - `price`: lowest price wins.
   - `rating`: highest rating wins.
   - `value`: highest (rating ÷ price×100) wins.
   - One highlight per numeric spec key that exists on 2+ compared products, using a static `higherIsBetter` / `lowerIsBetter` direction table. Specs with no known direction (e.g. `cpu`, `panel_type` — free text) are never highlighted, rather than guessing.

The comparison table component (`components/compare/comparison-table.tsx`) renders a "Best" chip only where a highlight exists — this is why "we don't simply colour everything," per the product brief.

## AI architecture

`AIService` is the single choke point for LLM calls. Its contract:

```ts
compareWithQuestion(productIds: string[], question: string):
  Promise<{ answer: AIComparisonAnswer; usage: AIUsageLog }>
```

**Grounding.** The method calls `ComparisonService.compare()` first, and serializes *only* the resulting products' id/title/brand/price/rating/specifications/features into the system prompt, with an explicit instruction: *"You must answer using ONLY the JSON product data provided… Never invent a price, spec, rating, or feature that is not present in the data."* The returned `sourceProductIds` are exactly the compared products, which the UI surfaces as "Sources used" chips — this is a checkable claim, not a trust-me disclaimer.

**Provider abstraction.** `AI_PROVIDER` (`lib/config.ts`) resolves to `'anthropic'`, `'openai'`, or `'demo'` based on which API key (if any) is set. `AIService.callProvider()` branches on this once; every call site (the `/api/ai/compare` route, the `AskCartwise` component) is provider-agnostic.

**Demo fallback.** When no key is set — the default — `buildDemoAnswer()` produces a natural-sounding sentence using simple keyword matching on the question ("travel"/"light" → lightest spec; "battery" → highest battery spec; "value"/"cheap" → best rating-per-price; "university"/"student" → cheapest + top-rated) composed from the *exact same* highlight-style computations `ComparisonService` uses. This is not a canned string table — it's grounded arithmetic with templated phrasing, so the numbers it cites are always real.

**Failure handling.** If a real provider call throws (rate limit, network, bad key), `AIService` catches it, logs a `failed` usage record, and **still returns a useful answer** via the demo fallback rather than surfacing an error to the user. The `/admin/ai-usage` dashboard shows failed request counts and error rates from these logs.

**Usage tracking.** Every call (demo or live) returns an `AIUsageLog` (`provider`, `model`, `promptTokens`, `completionTokens`, `estimatedCostUsd`, `latencyMs`, `status`). In live mode, `/api/ai/compare` persists this to `ai_requests`, which backs the `/admin/ai-usage` dashboard — request count, success/failure split, estimated token usage, estimated cost, and average latency.

## Recommendation architecture

`RecommendationService.recommend(category, preferences, limit)` computes four component scores per product, purely from structured data — **the LLM is never involved**:

- `priceScore`: inverse-normalized against the category's min/max price.
- `performanceScore`: average normalized position (0–1) across every "higher is better" numeric spec the product has, relative to the rest of the category.
- `featureScore`: feature count normalized against a target of 6.
- `valueScore`: 50/50 blend of price score and rating.

These combine into `overallScore` via a weight table keyed by the user's stated priority (`price` / `performance` / `value` / `features`, default `value`), plus a small brand-preference boost. `reasons` and `tradeOffs` are template sentences generated **from the same component scores**, not separately invented text — e.g. a "Highly rated" reason only appears if `ratingScore >= 88`, and a trade-off only appears if a real spec falls below 70% of the category leader's value.

## Price intelligence

`PriceService.getInsight(product)` derives:

- `lowestRecordedPrice` / `highestRecordedPrice` from the product's 90-day `priceHistory` series (sampled every 3 days in demo mode; a daily cron/edge function would populate `price_history` in live mode).
- `changeVsThirtyDaysAgoPct` by comparing the current price to the history point ~30 days back.
- `isNearHistoricLow` when current price is within 3% of the all-time low.

`evaluateAlert(currentPrice, targetPrice)` is a pure function (`currentPrice <= targetPrice ? 'triggered' : 'waiting'`) — deliberately trivial and therefore trivially testable, called both from the watchlist item API route and from unit tests.

## Merchant tracking

`MerchantService.trackClick()` writes to `merchant_clicks` (live) or logs a no-op (demo). The click payload (`userId`, `productId`, `merchantId`, `comparisonId`, `source`) matches the `merchant_clicks` table exactly, so `/admin/merchants` can aggregate real click-through data the moment a live project has traffic. **No real affiliate network is integrated** — see "Connecting real product feeds" below for how one would plug in.

## Analytics architecture

`AnalyticsService.track(event)` is the single ingestion point, called from `POST /api/analytics/event` (server-validated via `analyticsEventSchema`) and from the client-side `track()` helper (`lib/utils/track.ts`, which uses `navigator.sendBeacon` so tracking never blocks navigation). All 17 event types from the spec are enumerated in `EVENT_TYPES` and enforced by the Zod enum — an unrecognized event type is rejected at the API boundary, not silently accepted.

## Authentication & security

- **Supabase Auth** (email/password) via `@supabase/ssr`, with separate browser (`lib/supabase/client.ts`), server (`lib/supabase/server.ts`), and middleware (`lib/supabase/middleware.ts`) clients — the server client reads/writes cookies so RLS-scoped queries work in Server Components and Route Handlers.
- **Middleware** (`middleware.ts`) refreshes the session on every request and redirects unauthenticated visitors away from `/saved`, `/watchlists`, `/profile`, and `/admin/*` — skipped entirely in demo mode (no Supabase project configured means no session to refresh).
- **Admin gating** is two-layered: middleware handles "must be logged in," and `app/admin/layout.tsx` additionally checks `profiles.preferences.role === 'admin'` in live mode, redirecting non-admins home. In demo mode, admin pages render with a visible "Demo data" banner instead of being gated, since there's no real user/role system to check against.
- **RLS** is enabled on every table (see the migration). Catalog tables are public-read; user tables are scoped to `auth.uid()`; `comparison_sessions` explicitly allows `user_id IS NULL` rows for anonymous comparisons.
- **Service-role key** (`SUPABASE_SERVICE_ROLE_KEY`) is used only in `scripts/seed.ts` and `lib/supabase/server.ts`'s `createAdminClient()` (server-only file, never imported by client components) — it is never sent to the browser.
- **Input validation**: every API route parses its body/query through a Zod schema (`lib/validation/schemas.ts`) before touching a service or the database.
- **Safe redirects**: `next` query params used for post-login redirects are always relative paths constructed by the app itself (`/auth/login?next=/saved`), never taken verbatim from user-controlled absolute URLs.

## Price alert email notifications (not yet wired up)

The data model and API are ready: `watchlist_items.alert_status` (`waiting` / `triggered` / `disabled`) is recomputed by `PriceService.evaluateAlert()` every time `POST /api/alerts` runs. To send real emails: add an email provider (e.g. Resend), a scheduled Supabase Edge Function or Vercel Cron job that (a) recomputes prices, (b) finds `watchlist_items` where `alert_status` just flipped to `triggered`, and (c) sends an email via the provider. No schema changes are needed.

## Connecting real product feeds later

Because everything reads through `ProductService`, integrating a real product/merchant feed means:

1. Build a feed adapter (scheduled job) that maps a supplier's product export (Google Shopping feed, a retailer's affiliate API, a manual CSV, etc.) into the existing `products` / `product_specifications` / `product_features` / `product_images` / `product_prices` tables — reusing `scripts/seed.ts` as a template.
2. Populate `price_history` daily by snapshotting `product_prices.price` per product (a simple cron `INSERT … SELECT` or edge function).
3. Set `products.is_demo = false` and `merchants.is_demo = false` for real rows so the UI's "Demo listing" badge and the footer's synthetic-data disclosure only show where genuinely applicable.
4. Point `product_url` / `affiliate_url` at real, tagged affiliate links once a real network (e.g. Skimlinks, Awin, or a retailer's own affiliate program) is signed up — `MerchantService` and the outbound-click UI need no changes.

No other service needs to change: `SearchService`, `ComparisonService`, `RecommendationService`, `PriceService`, and `AIService` are all written against the `Product` type, not against "synthetic data" assumptions.

## Known limitations / what would come next

- Search is in-memory/JS-side in demo mode and would move to Postgres full-text search (`tsvector` + `pg_trgm`, already indexed in the migration) at real catalog scale.
- The recommendation engine's category-relative normalization means scores are only comparable within a category, by design — "92% fit" for a laptop and "92% fit" for a coffee machine are not meant to be compared to each other.
- Email delivery for price alerts is designed but not implemented (see above) — no outbound email provider is configured, matching the "do not actually send email unless configured" requirement.
- `AnalyticsService`'s demo-mode in-memory log is process-local and capped at 500 events; it exists so `/admin` has something plausible to show without a database, not as a production analytics store.
