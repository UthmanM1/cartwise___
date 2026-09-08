import { mulberry32, seedFromString, randInt } from '@/lib/utils/prng';
import { generateAllProducts } from '@/lib/data/generate-products';
import { MERCHANTS } from '@/lib/data/merchants';
import { CATEGORY_DEFS } from '@/lib/data/categories';

/**
 * In demo mode there is no real user base to report on, so /admin renders
 * deterministic synthetic analytics instead of an empty dashboard. Every
 * number here is clearly a demo figure (see the "Demo data" badges in the
 * admin UI) and is regenerated the same way on every load — it is NOT
 * randomly reseeded per request, so the dashboard doesn't flicker between
 * page loads or after a deploy.
 *
 * In live mode, /admin queries analytics_events / merchant_clicks /
 * ai_requests directly via Supabase instead of this module.
 */
export function getDemoDashboardStats() {
  const rng = mulberry32(seedFromString('cartwise-admin-dashboard'));
  const products = generateAllProducts();

  const totalUsers = randInt(rng, 1800, 2600);
  const searches = randInt(rng, 9000, 14000);
  const productViews = randInt(rng, 22000, 34000);
  const comparisons = randInt(rng, 1400, 2600);
  const aiComparisons = randInt(rng, 800, 1500);
  const savedProducts = randInt(rng, 2600, 4200);
  const merchantClicks = randInt(rng, 5200, 8600);
  const watchlists = randInt(rng, 600, 1100);
  const priceAlerts = randInt(rng, 400, 900);

  const userGrowth = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(2025, i, 1).toLocaleString('en-GB', { month: 'short' }),
    value: Math.round((totalUsers / 12) * (i + 1) * (0.7 + rng() * 0.3)),
  }));

  const searchVolume = Array.from({ length: 7 }, (_, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]!,
    value: randInt(rng, 900, 2200),
  }));

  const popularCategories = CATEGORY_DEFS.map((c) => ({ name: c.name, value: randInt(rng, 400, 3200) })).sort((a, b) => b.value - a.value);

  const popularProducts = [...products]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 8)
    .map((p) => ({ name: p.title, value: p.reviewCount }));

  const comparisonActivity = Array.from({ length: 7 }, (_, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]!,
    value: randInt(rng, 120, 420),
  }));

  const merchantClicksByMerchant = MERCHANTS.map((m) => ({ name: m.name, value: randInt(rng, 600, 2400) }));

  const priceChangeEvents = Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}`,
    value: randInt(rng, 40, 260),
  }));

  const aiUsageOverTime = Array.from({ length: 14 }, (_, i) => ({
    name: `D${i + 1}`,
    value: randInt(rng, 40, 160),
  }));

  const funnels = {
    search: { started: searches, completed: Math.round(searches * 0.86) },
    product: { viewed: productViews, saved: savedProducts },
    comparison: { started: comparisons, completed: Math.round(comparisons * 0.74), aiUsed: aiComparisons },
    merchant: { clicked: merchantClicks, converted: Math.round(merchantClicks * 0.12) },
  };

  return {
    totals: { totalUsers, searches, productViews, comparisons, aiComparisons, savedProducts, merchantClicks, watchlists, priceAlerts },
    userGrowth,
    searchVolume,
    popularCategories,
    popularProducts,
    comparisonActivity,
    merchantClicksByMerchant,
    priceChangeEvents,
    aiUsageOverTime,
    funnels,
  };
}

export function getDemoAiUsageStats() {
  const rng = mulberry32(seedFromString('cartwise-admin-ai-usage'));
  const totalRequests = randInt(rng, 800, 1600);
  const failed = Math.round(totalRequests * (0.02 + rng() * 0.03));
  const successful = totalRequests - failed;
  const estimatedTokens = totalRequests * randInt(rng, 300, 600);
  const estimatedCostUsd = Math.round(estimatedTokens * 0.0000006 * 100) / 100;
  const avgLatencyMs = randInt(rng, 380, 900);

  const requestsOverTime = Array.from({ length: 14 }, (_, i) => ({ name: `D${i + 1}`, value: randInt(rng, 40, 160) }));

  return { totalRequests, successful, failed, estimatedTokens, estimatedCostUsd, avgLatencyMs, requestsOverTime };
}

export function getDemoMerchantStats() {
  const rng = mulberry32(seedFromString('cartwise-admin-merchants'));
  const products = generateAllProducts();

  return MERCHANTS.map((m) => {
    const productCount = products.filter((p) => p.offers.some((o) => o.merchant.id === m.id)).length;
    const clicks = randInt(rng, 400, 3200);
    const impressions = clicks * randInt(rng, 6, 14);
    const outboundCtr = Math.round((clicks / impressions) * 1000) / 10;
    const avgPrice = Math.round(
      products
        .flatMap((p) => p.offers.filter((o) => o.merchant.id === m.id).map((o) => o.price))
        .reduce((sum, p, _, arr) => sum + p / arr.length, 0) * 100
    ) / 100;

    return { merchant: m, productCount, clicks, outboundCtr, avgPrice, status: m.isDemo ? 'Demo merchant' : 'Live' };
  });
}
