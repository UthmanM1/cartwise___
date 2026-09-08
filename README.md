# CARTWISE

**Compare smarter. Buy with confidence.**

CARTWISE is an AI-powered product comparison and shopping intelligence platform. Search across 110 synthetic products in 10 categories, filter by spec, compare up to 4 products side by side, ask an AI assistant to explain trade-offs (grounded strictly in real product data), track price history, save products, build watchlists, and set price alerts.

This is a portfolio engineering project. It runs completely standalone with **zero paid APIs or accounts required** (demo mode), and upgrades to a fully live, database-backed app the moment you add a Supabase project and/or an AI provider key.

---

## 1. File structure

```
cartwise/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home
│   ├── search/                   # /search — filters, facets, pagination
│   ├── compare/                  # /compare — picker + table + Ask CARTWISE
│   ├── products/[id]/            # /products/[slug] — price intelligence, merchants
│   ├── saved/                    # /saved (auth required)
│   ├── watchlists/               # /watchlists (auth required)
│   ├── profile/                  # /profile (auth required)
│   ├── auth/{login,signup,callback}/
│   ├── admin/                    # /admin/* — overview, products, merchants, analytics, ai-usage
│   ├── api/                      # Route handlers (search, products, compare, ai/compare,
│   │                             #   saved, watchlists, alerts, analytics/event, merchant-click)
│   ├── robots.ts / sitemap.ts
│   └── globals.css / layout.tsx
├── components/
│   ├── ui/                       # Button, Card, Input, Dialog, Tabs, Select, etc.
│   ├── product/                  # ProductCard, PriceTag, RatingStars, SaveButton, etc.
│   ├── search/                   # FilterPanel, MobileFilterDrawer, ProductGrid, SortSelect
│   ├── compare/                  # ComparisonTable, AskCartwise, CompareBar
│   ├── charts/                   # PriceHistoryChart (recharts)
│   ├── admin/                    # AdminShell, StatCard, chart wrappers
│   └── layout/                   # Navbar, Footer, MobileBottomNav
├── lib/
│   ├── services/                 # ProductService, SearchService, ComparisonService,
│   │                             #   RecommendationService, PriceService, MerchantService,
│   │                             #   AnalyticsService, AIService  ← see ARCHITECTURE.md
│   ├── data/                     # categories, merchants, synthetic product generator
│   ├── supabase/                 # browser/server/middleware clients
│   ├── validation/                # Zod schemas for every API input
│   ├── hooks/                    # useCompareSelection (localStorage-backed)
│   ├── utils/                    # cn, format, prng, track
│   ├── types.ts                  # Shared domain types
│   └── config.ts                 # Demo/live mode switch
├── supabase/migrations/0001_init.sql   # Full Postgres schema + RLS
├── scripts/seed.ts                # Seeds a live Supabase project with the demo catalog
├── __tests__/                     # Vitest unit tests
├── middleware.ts                  # Auth session refresh + protected-route redirects
├── .env.example
└── ARCHITECTURE.md
```

## 2. Database schema

See `supabase/migrations/0001_init.sql` for the full, runnable schema. Tables:

`products`, `product_specifications`, `product_features`, `product_images`, `merchants`, `product_prices`, `price_history`, `categories`, `product_categories`, `saved_products`, `watchlists`, `watchlist_items`, `comparison_sessions`, `comparison_items`, `profiles` (extends `auth.users`), `analytics_events`, `merchant_clicks`, `ai_requests`.

Row Level Security is enabled on every table. Catalog tables (`products`, `merchants`, etc.) are publicly readable; user data (`saved_products`, `watchlists`, `analytics_events`, …) is scoped to `auth.uid()`; `comparison_sessions` allows anonymous rows (`user_id IS NULL`) so comparison works without an account.

## 3. Environment variables

Copy `.env.example` to `.env.local`. **Every variable is optional** — see the file for what each one unlocks:

| Variable | Enables |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real auth + Postgres persistence (live mode) |
| `SUPABASE_SERVICE_ROLE_KEY` | `npm run seed` and admin-only server operations |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | Real LLM answers in "Ask CARTWISE" (otherwise: deterministic rule-based fallback) |
| `NEXT_PUBLIC_SITE_URL` | Correct absolute URLs in metadata/sitemap |

## 4. Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the app is fully usable immediately in **demo mode**: no `.env.local` needed. Product search, filtering, comparison, Ask CARTWISE (rule-based), price history, and the admin dashboard all work against the synthetic in-memory catalog (110 products, seeded PRNG, deterministic across restarts).

Sign-in-gated pages (`/saved`, `/watchlists`, `/profile`, `/admin` role-check) will show a "sign in — configure Supabase" prompt rather than erroring, since there is no account system without a real project.

### Enabling live mode

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` against it (Supabase SQL editor, or the CLI).
3. `npm run seed` — populates the same 110-product synthetic catalog into real Postgres tables.
4. Restart `npm run dev`. Auth, saved products, watchlists, and admin analytics are now backed by real Postgres with RLS enforced.

To make a user an admin, set `profiles.preferences.role = 'admin'` for their row (there's no self-serve admin signup, by design).

### Enabling real AI

Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env.local`. No code changes needed — `AIService` (see `lib/services/ai-service.ts`) picks the provider automatically and falls back to the demo answer generator if the call fails.

## 5. Vercel deployment

1. Push this repo to GitHub (or run `vercel` from the CLI directly — no GitHub required).
2. Import it in Vercel — it's auto-detected as a Next.js 14 App Router project, zero build config needed.
3. Add the same environment variables from `.env.local` in the Vercel project settings (Production + Preview) — or add none at all, since the app is fully functional in demo mode with zero env vars set.
4. Deploy.

No `vercel.json` is required. A few Vercel/Next.js-specific things worth knowing:

- **Middleware runs on the Edge Runtime.** `middleware.ts` and `lib/supabase/middleware.ts` only use `@supabase/ssr` and standard Next.js server APIs — no Node-only modules — so this deploys to Vercel's Edge Network without changes.
- **Demo mode needs no secrets.** If you deploy without any environment variables, the site is fully functional — search, compare, Ask CARTWISE, price history, and the admin dashboard all work against the synthetic catalog. Auth-gated pages (`/saved`, `/watchlists`, `/profile`) show a "connect Supabase" prompt instead of erroring.
- **Product images** are served from `picsum.photos` (deterministic per-product via a URL seed) — already allowlisted in `next.config.mjs`'s `images.remotePatterns`, alongside Supabase storage and Unsplash for when you swap in real product photography.
- **`next/font/google`** (Inter, Fraunces, JetBrains Mono) fetches font files at build time, which requires outbound network access — this works automatically on Vercel's build infrastructure.

## 6. Demo mode instructions

Demo mode is the default and requires no setup:

- **Data**: `lib/data/generate-products.ts` deterministically generates 110 products (seeded PRNG — same catalog every run) across 10 categories, each with realistic specs, 2–4 merchant offers, and 90-day price history.
- **AI**: `AIService` returns rule-based comparison summaries computed from the same highlight math used for the comparison table (see ARCHITECTURE.md § AI architecture) — never random text.
- **Auth**: sign-in-gated features show a clear prompt to configure Supabase rather than silently failing.
- **Admin dashboard**: renders deterministic synthetic analytics (clearly labelled "Demo data") so the dashboard isn't empty before a real Supabase project has traffic.

## 7. Demo credentials

None needed in demo mode — browsing, search, filtering, comparison, and Ask CARTWISE all work without an account. Once you connect a live Supabase project, create an account via `/auth/signup` (email confirmation required by default Supabase settings) and promote it to admin via the `profiles` table as described above.

## 8. Search architecture

`SearchService` (`lib/services/search-service.ts`) is a pure, synchronous-after-fetch pipeline over `ProductService.getAll()`: category filter → keyword relevance scoring (title/brand/feature term matching, with a special case for "under £X" phrasing) → price/rating/availability/feature/merchant filters → facet computation → sort → pagination. In live mode, `ProductService` swaps its data source to Supabase without any change to `SearchService` — see ARCHITECTURE.md for how this would scale to Postgres full-text search at higher catalog sizes.

## 9. Comparison architecture

`ComparisonService` (`lib/services/comparison-service.ts`) fetches the requested products (max 4) via `ProductService` and computes highlights with plain arithmetic: cheapest price, highest rating, best rating-per-pound "value", and per-spec winners using a direction table (`higher is better` vs `lower is better`) keyed by spec name. No LLM is involved in highlighting — the badges in the comparison table are always traceable to a real number.

## 10. AI architecture

`AIService` (`lib/services/ai-service.ts`) is the **only** class allowed to call an LLM. It:

1. Fetches the exact products being compared via `ComparisonService` (which itself only reads through `ProductService`).
2. Serializes only those products' structured specs/price/rating/features into the prompt.
3. Instructs the model to answer **using only that data** and never invent a spec or price.
4. Returns `sourceProductIds` — the UI renders "Sources used" so every claim is checkable.
5. Falls back to a deterministic, template-based answer (built from the same highlight computations as the comparison table) if no API key is configured or the provider call fails — the feature never breaks.

## 11. Merchant tracking

`MerchantService.trackClick()` records `{ userId, productId, merchantId, comparisonId, source }` to `merchant_clicks` (live mode) or logs a no-op in demo mode. `/admin/merchants` aggregates clicks, outbound CTR, and average price per merchant. **CARTWISE does not have real affiliate partnerships** — all merchants (OrbitGoods, BrightAisle, Kepler Store, Field & Fern, Northlane) are demo data, and outbound links point at a placeholder domain.

## 12. Connecting real product APIs later

See **ARCHITECTURE.md § Connecting real product feeds** for the detailed plan — in short: implement a feed adapter that writes into the existing `products` / `product_prices` / `price_history` tables on a schedule, and `ProductService`, `SearchService`, `ComparisonService`, `RecommendationService`, and `AIService` all continue to work unchanged, because none of them generate or assume synthetic data — they only read through `ProductService`.

---

## Testing

```bash
npm run test        # vitest run
npm run typecheck   # tsc --noEmit
```

Tests cover: search filtering/sorting/pagination, comparison highlight correctness, recommendation scoring bounds and determinism, price alert evaluation and price-history math, merchant offer sorting, AI grounding (answers never reference unselected products), and every Zod validation schema.
