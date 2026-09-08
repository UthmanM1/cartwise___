/**
 * Central runtime configuration.
 *
 * CARTWISE is designed to run in one of two modes:
 *
 *  - DEMO MODE (default, zero config): no Supabase project and no AI API key
 *    are required. ProductService reads from the deterministic synthetic
 *    dataset in lib/data/, and AIService returns rule-based canned analyses.
 *    This is what you get out of the box after `npm install && npm run dev`.
 *
 *  - LIVE MODE: set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    (and SUPABASE_SERVICE_ROLE_KEY for seeding/admin) to read/write real
 *    Postgres data, and set OPENAI_API_KEY (or ANTHROPIC_API_KEY) to enable
 *    real AI comparisons. Everything else in the app is unchanged — the
 *    services are the only layer that branches on mode.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const isAIConfigured = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);

export const DEMO_MODE = !isSupabaseConfigured;

export const AI_PROVIDER: 'openai' | 'anthropic' | 'demo' = process.env.ANTHROPIC_API_KEY
  ? 'anthropic'
  : process.env.OPENAI_API_KEY
    ? 'openai'
    : 'demo';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
