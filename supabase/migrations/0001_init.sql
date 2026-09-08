-- CARTWISE database schema
-- Run against a Supabase Postgres project. Designed for RLS from day one.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================================================
-- PROFILES (extends auth.users)
-- ============================================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  preferences jsonb not null default '{}'::jsonb, -- e.g. {"priority":"value","preferredBrands":["Sony"]}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CATEGORIES
-- ============================================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  spec_schema jsonb not null default '[]'::jsonb, -- ordered list of {key,label,unit,type} used for comparison tables
  created_at timestamptz not null default now()
);

-- ============================================================================
-- MERCHANTS
-- ============================================================================
create table if not exists merchants (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  logo_text text not null, -- CSS wordmark, no external logo asset required
  is_demo boolean not null default true,
  delivery_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PRODUCTS
-- ============================================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  brand text not null,
  category_id uuid not null references categories(id) on delete restrict,
  description text not null default '',
  currency text not null default 'GBP',
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0,
  availability text not null default 'in_stock' check (availability in ('in_stock','limited_stock','out_of_stock','preorder')),
  primary_merchant_id uuid references merchants(id),
  product_url text,
  affiliate_url text,
  image_url text not null,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_brand on products(brand);
create index if not exists idx_products_rating on products(rating desc);
create index if not exists idx_products_title_trgm on products using gin (title gin_trgm_ops);
create extension if not exists pg_trgm;

-- ============================================================================
-- PRODUCT_CATEGORIES (many-to-many, a product can appear cross-category e.g. "office chair" + "ergonomic")
-- ============================================================================
create table if not exists product_categories (
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- ============================================================================
-- PRODUCT_SPECIFICATIONS (key/value, structured, category-defined schema)
-- ============================================================================
create table if not exists product_specifications (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  key text not null,           -- e.g. "battery_life_hours"
  label text not null,         -- e.g. "Battery life"
  value text not null,         -- normalized display value e.g. "30"
  unit text,                   -- e.g. "hours"
  numeric_value numeric,       -- for sorting/comparison math
  sort_order integer not null default 0,
  unique (product_id, key)
);
create index if not exists idx_specs_product on product_specifications(product_id);
create index if not exists idx_specs_key on product_specifications(key);

-- ============================================================================
-- PRODUCT_FEATURES (bullet features, distinct from numeric specs)
-- ============================================================================
create table if not exists product_features (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  feature text not null,
  sort_order integer not null default 0
);
create index if not exists idx_features_product on product_features(product_id);

-- ============================================================================
-- PRODUCT_IMAGES
-- ============================================================================
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0
);
create index if not exists idx_images_product on product_images(product_id);

-- ============================================================================
-- PRODUCT_PRICES (current price per merchant)
-- ============================================================================
create table if not exists product_prices (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  merchant_id uuid not null references merchants(id) on delete cascade,
  price numeric(10,2) not null,
  previous_price numeric(10,2),
  currency text not null default 'GBP',
  availability text not null default 'in_stock' check (availability in ('in_stock','limited_stock','out_of_stock','preorder')),
  updated_at timestamptz not null default now(),
  unique (product_id, merchant_id)
);
create index if not exists idx_prices_product on product_prices(product_id);

-- ============================================================================
-- PRICE_HISTORY (time series per product, aggregated across merchants -> lowest price of day)
-- ============================================================================
create table if not exists price_history (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  price numeric(10,2) not null,
  recorded_at date not null,
  unique (product_id, recorded_at)
);
create index if not exists idx_price_history_product on price_history(product_id, recorded_at);

-- ============================================================================
-- SAVED_PRODUCTS
-- ============================================================================
create table if not exists saved_products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  price_at_save numeric(10,2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists idx_saved_user on saved_products(user_id);

-- ============================================================================
-- WATCHLISTS / WATCHLIST_ITEMS
-- ============================================================================
create table if not exists watchlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_watchlists_user on watchlists(user_id);

create table if not exists watchlist_items (
  id uuid primary key default uuid_generate_v4(),
  watchlist_id uuid not null references watchlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  target_price numeric(10,2),
  alert_status text not null default 'disabled' check (alert_status in ('waiting','triggered','disabled')),
  created_at timestamptz not null default now(),
  unique (watchlist_id, product_id)
);
create index if not exists idx_watchlist_items_watchlist on watchlist_items(watchlist_id);

-- ============================================================================
-- COMPARISON_SESSIONS / COMPARISON_ITEMS
-- ============================================================================
create table if not exists comparison_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null, -- nullable: anonymous comparisons allowed
  question text,          -- last "Ask CARTWISE" question, if any
  ai_summary text,        -- last AI answer text
  ai_sources jsonb,        -- array of product ids used as sources
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_comparison_sessions_user on comparison_sessions(user_id);

create table if not exists comparison_items (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references comparison_sessions(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  sort_order integer not null default 0,
  unique (session_id, product_id)
);

-- ============================================================================
-- ANALYTICS_EVENTS
-- ============================================================================
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text, -- anonymous client-side session id, for unauthenticated tracking
  event_type text not null,  -- see AnalyticsService.EVENT_TYPES
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_type on analytics_events(event_type);
create index if not exists idx_events_created on analytics_events(created_at desc);

-- ============================================================================
-- MERCHANT_CLICKS
-- ============================================================================
create table if not exists merchant_clicks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid not null references products(id) on delete cascade,
  merchant_id uuid not null references merchants(id) on delete cascade,
  comparison_id uuid references comparison_sessions(id) on delete set null,
  source text not null default 'search', -- 'search' | 'compare' | 'product_page' | 'saved' | 'recommendation'
  created_at timestamptz not null default now()
);
create index if not exists idx_clicks_product on merchant_clicks(product_id);
create index if not exists idx_clicks_merchant on merchant_clicks(merchant_id);

-- ============================================================================
-- AI_REQUESTS (usage + cost + latency tracking, for /admin/ai-usage)
-- ============================================================================
create table if not exists ai_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  comparison_id uuid references comparison_sessions(id) on delete set null,
  provider text not null default 'demo', -- 'openai' | 'anthropic' | 'demo'
  model text,
  prompt_tokens integer,
  completion_tokens integer,
  estimated_cost_usd numeric(10,5),
  latency_ms integer,
  status text not null default 'success' check (status in ('success','failed')),
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_requests_created on ai_requests(created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table saved_products enable row level security;
alter table watchlists enable row level security;
alter table watchlist_items enable row level security;
alter table comparison_sessions enable row level security;
alter table comparison_items enable row level security;
alter table analytics_events enable row level security;
alter table merchant_clicks enable row level security;
alter table ai_requests enable row level security;

-- Public read-only catalog tables: no RLS needed for anonymous SELECT, but
-- enable RLS anyway and add an explicit public-read policy for defense in depth.
alter table products enable row level security;
alter table product_specifications enable row level security;
alter table product_features enable row level security;
alter table product_images enable row level security;
alter table product_prices enable row level security;
alter table price_history enable row level security;
alter table categories enable row level security;
alter table product_categories enable row level security;
alter table merchants enable row level security;

create policy "public read products" on products for select using (true);
create policy "public read specs" on product_specifications for select using (true);
create policy "public read features" on product_features for select using (true);
create policy "public read images" on product_images for select using (true);
create policy "public read prices" on product_prices for select using (true);
create policy "public read history" on price_history for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read product_categories" on product_categories for select using (true);
create policy "public read merchants" on merchants for select using (true);

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own saved products" on saved_products for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own watchlists" on watchlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own watchlist items" on watchlist_items for all
  using (exists (select 1 from watchlists w where w.id = watchlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from watchlists w where w.id = watchlist_id and w.user_id = auth.uid()));

create policy "own or anon comparison sessions - select" on comparison_sessions for select
  using (user_id is null or auth.uid() = user_id);
create policy "insert comparison sessions" on comparison_sessions for insert
  with check (user_id is null or auth.uid() = user_id);
create policy "update own comparison sessions" on comparison_sessions for update
  using (auth.uid() = user_id);

create policy "read comparison items via session" on comparison_items for select
  using (exists (select 1 from comparison_sessions s where s.id = session_id and (s.user_id is null or s.user_id = auth.uid())));
create policy "insert comparison items via session" on comparison_items for insert
  with check (exists (select 1 from comparison_sessions s where s.id = session_id and (s.user_id is null or s.user_id = auth.uid())));

create policy "insert own analytics events" on analytics_events for insert with check (true);
create policy "read own analytics events" on analytics_events for select using (auth.uid() = user_id);

create policy "insert merchant clicks" on merchant_clicks for insert with check (true);
create policy "read own merchant clicks" on merchant_clicks for select using (auth.uid() = user_id);

create policy "insert ai requests" on ai_requests for insert with check (true);
create policy "read own ai requests" on ai_requests for select using (auth.uid() = user_id);

-- Admin access: expects a `is_admin` boolean claim set via Supabase custom claims
-- or a separate admin allowlist table. For simplicity, we check profiles.preferences->>'role'.
create policy "admin read all analytics" on analytics_events for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.preferences->>'role' = 'admin'));
create policy "admin read all ai requests" on ai_requests for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.preferences->>'role' = 'admin'));
create policy "admin read all merchant clicks" on merchant_clicks for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.preferences->>'role' = 'admin'));

-- ============================================================================
-- Trigger: auto-create profile on signup
-- ============================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
