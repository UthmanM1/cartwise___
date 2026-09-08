import { CATEGORY_DEFS, getCategoryDef } from '@/lib/data/categories';
import { MERCHANTS } from '@/lib/data/merchants';
import { mulberry32, pick, randInt, randFloat, seedFromString } from '@/lib/utils/prng';
import type {
  Product,
  ProductSpecification,
  MerchantOffer,
  PricePoint,
  CategorySlug,
} from '@/lib/types';

const PRODUCTS_PER_CATEGORY = 11; // 10 categories * 11 = 110 products, satisfies "at least 100"

// Feature pools per category — a handful are picked per product so not every
// product in a category looks identical.
const FEATURE_POOL: Record<CategorySlug, string[]> = {
  laptops: ['Backlit keyboard', 'Fingerprint reader', 'Thunderbolt 4', 'Aluminium chassis', '90Wh battery', 'Fanless design', '2-in-1 hinge', 'MIL-STD-810 durability'],
  smartphones: ['Wireless charging', 'IP68 water resistance', 'Dual SIM', 'Optical zoom', 'Always-on display', 'Under-display fingerprint', 'Satellite SOS', 'Titanium frame'],
  headphones: ['Multipoint pairing', 'Transparency mode', 'Foldable design', 'Fast charging (10 min = 5h)', 'Companion app EQ', 'Wear detection', 'Wind noise reduction', 'Voice assistant support'],
  monitors: ['USB-C 90W charging', 'Built-in KVM switch', 'HDR400', 'Height adjustable stand', 'Anti-glare coating', 'Daisy-chain support', 'Built-in speakers', 'Flicker-free backlight'],
  cameras: ['In-body stabilisation', 'Weather-sealed body', 'Dual card slots', 'Flip-out touchscreen', 'Eye-tracking autofocus', 'Built-in ND filter', 'Wi-Fi transfer', 'Uncropped 4K'],
  'running-shoes': ['Carbon plate', 'Recycled upper', 'Reflective detailing', 'Wide-fit available', 'Rock plate protection', 'Quick-lace system', 'Removable insole', 'Water-resistant upper'],
  'office-chairs': ['4D armrests', 'Synchro-tilt mechanism', 'Headrest included', 'Breathable mesh back', 'Seat depth adjustment', 'Tilt lock', 'Coat hanger hook', 'Assembly-free option'],
  'coffee-machines': ['Built-in grinder', 'Programmable schedule', 'Auto-clean cycle', 'PID temperature control', 'App connectivity', 'One-touch cappuccino', 'Recyclable capsules', 'Compact footprint'],
  'robot-vacuums': ['Self-emptying dock', 'Mop function', 'Multi-floor mapping', 'No-go zones', 'Voice assistant support', 'Pet hair mode', 'Auto carpet boost', 'Quiet night mode'],
  'air-purifiers': ['HEPA H13 filter', 'Air quality sensor', 'Night mode display-off', 'Child lock', 'Auto mode', 'Filter replacement reminder', 'Low energy use', 'Compact tower design'],
};

// Category-level base price bands (min, max) in GBP, used to keep prices realistic per category.
const PRICE_BANDS: Record<CategorySlug, [number, number]> = {
  laptops: [420, 2200],
  smartphones: [220, 1350],
  headphones: [45, 420],
  monitors: [120, 950],
  cameras: [280, 2800],
  'running-shoes': [55, 220],
  'office-chairs': [90, 780],
  'coffee-machines': [60, 950],
  'robot-vacuums': [140, 950],
  'air-purifiers': [70, 520],
};

function generateSpecs(categorySlug: CategorySlug, rng: () => number): ProductSpecification[] {
  const def = getCategoryDef(categorySlug);
  return def.specSchema.map((field) => {
    let value: string;
    let numericValue: number | undefined;

    switch (field.key) {
      case 'cpu':
        value = pick(rng, ['Core i5 13th Gen', 'Core i7 13th Gen', 'Ryzen 5 7640U', 'Ryzen 7 7840U', 'M-series 8-core', 'Core Ultra 7']);
        break;
      case 'ram_gb':
        numericValue = pick(rng, [8, 16, 16, 32]);
        value = String(numericValue);
        break;
      case 'storage_gb':
        numericValue = pick(rng, [256, 512, 512, 1024, 2048]);
        value = String(numericValue);
        break;
      case 'screen_size_in':
        numericValue = categorySlug === 'monitors' ? randFloat(rng, 24, 34, 1) : randFloat(rng, 13, 16.5, 1);
        value = String(numericValue);
        break;
      case 'battery_life_hours':
        numericValue = categorySlug === 'headphones' ? randInt(rng, 18, 45) : randFloat(rng, 8, 20, 1);
        value = String(numericValue);
        break;
      case 'weight_kg':
        numericValue = randFloat(rng, 0.9, 2.4, 2);
        value = String(numericValue);
        break;
      case 'battery_mah':
        numericValue = randInt(rng, 3800, 5500);
        value = String(numericValue);
        break;
      case 'camera_mp':
        numericValue = pick(rng, [12, 48, 50, 64, 108, 200]);
        value = String(numericValue);
        break;
      case 'weight_g':
        numericValue =
          categorySlug === 'headphones' ? randInt(rng, 180, 330) :
          categorySlug === 'smartphones' ? randInt(rng, 155, 235) :
          categorySlug === 'cameras' ? randInt(rng, 380, 780) :
          randInt(rng, 190, 340); // running shoes
        value = String(numericValue);
        break;
      case 'five_g':
        numericValue = rng() > 0.15 ? 1 : 0;
        value = numericValue ? 'Yes' : 'No';
        break;
      case 'anc':
        numericValue = rng() > 0.25 ? 1 : 0;
        value = numericValue ? 'Yes' : 'No';
        break;
      case 'bluetooth_version':
        value = pick(rng, ['5.0', '5.2', '5.3']);
        break;
      case 'driver_size_mm':
        numericValue = pick(rng, [30, 32, 40, 45, 50]);
        value = String(numericValue);
        break;
      case 'resolution':
        value = pick(rng, ['1920x1080', '2560x1440', '3440x1440', '3840x2160']);
        break;
      case 'refresh_rate_hz':
        numericValue = pick(rng, [60, 75, 100, 144, 165, 240]);
        value = String(numericValue);
        break;
      case 'panel_type':
        value = pick(rng, ['IPS', 'VA', 'OLED', 'Nano IPS']);
        break;
      case 'response_time_ms':
        numericValue = pick(rng, [1, 2, 4, 5, 8]);
        value = String(numericValue);
        break;
      case 'megapixels':
        numericValue = pick(rng, [20, 24, 26, 33, 45, 61]);
        value = String(numericValue);
        break;
      case 'sensor_type':
        value = pick(rng, ['APS-C CMOS', 'Full-frame CMOS', 'Micro Four Thirds', 'Stacked CMOS']);
        break;
      case 'iso_max':
        numericValue = pick(rng, [25600, 51200, 102400, 204800]);
        value = String(numericValue);
        break;
      case 'video_resolution':
        value = pick(rng, ['4K 60fps', '4K 120fps', '6K 30fps', '8K 24fps']);
        break;
      case 'drop_mm':
        numericValue = pick(rng, [4, 6, 8, 10, 12]);
        value = String(numericValue);
        break;
      case 'cushioning':
        value = pick(rng, ['Firm', 'Balanced', 'Max cushion', 'Responsive']);
        break;
      case 'terrain':
        value = pick(rng, ['Road', 'Trail', 'Road/Trail hybrid', 'Track']);
        break;
      case 'breathability':
        value = pick(rng, ['Standard mesh', 'Engineered knit', 'Ventilated mesh', 'Lightweight mesh']);
        break;
      case 'weight_capacity_kg':
        numericValue = pick(rng, [110, 120, 136, 150]);
        value = String(numericValue);
        break;
      case 'adjustable_arms':
        numericValue = rng() > 0.2 ? 1 : 0;
        value = numericValue ? 'Yes' : 'No';
        break;
      case 'lumbar_support':
        numericValue = rng() > 0.15 ? 1 : 0;
        value = numericValue ? 'Yes' : 'No';
        break;
      case 'material':
        value = pick(rng, ['Mesh', 'Fabric', 'Bonded leather', 'Genuine leather']);
        break;
      case 'warranty_years':
        numericValue = pick(rng, [2, 3, 5, 10]);
        value = String(numericValue);
        break;
      case 'pressure_bar':
        numericValue = pick(rng, [9, 15, 19, 20]);
        value = String(numericValue);
        break;
      case 'water_tank_l':
        numericValue = randFloat(rng, 0.8, 2.5, 1);
        value = String(numericValue);
        break;
      case 'brew_time_sec':
        numericValue = randInt(rng, 25, 90);
        value = String(numericValue);
        break;
      case 'milk_frother':
        numericValue = rng() > 0.35 ? 1 : 0;
        value = numericValue ? 'Yes' : 'No';
        break;
      case 'capsule_or_bean':
        value = pick(rng, ['Bean-to-cup', 'Capsule', 'Ground/filter']);
        break;
      case 'suction_pa':
        numericValue = pick(rng, [2000, 2500, 3000, 4000, 5500]);
        value = String(numericValue);
        break;
      case 'battery_runtime_min':
        numericValue = randInt(rng, 90, 210);
        value = String(numericValue);
        break;
      case 'mapping':
        numericValue = rng() > 0.2 ? 1 : 0;
        value = numericValue ? 'Yes' : 'No';
        break;
      case 'noise_db':
        numericValue = randInt(rng, 32, 68);
        value = String(numericValue);
        break;
      case 'bin_capacity_l':
        numericValue = randFloat(rng, 0.3, 0.7, 2);
        value = String(numericValue);
        break;
      case 'coverage_sqm':
        numericValue = pick(rng, [20, 35, 50, 65, 80]);
        value = String(numericValue);
        break;
      case 'cadr_m3h':
        numericValue = pick(rng, [200, 300, 400, 500, 600]);
        value = String(numericValue);
        break;
      case 'filter_type':
        value = pick(rng, ['HEPA H13', 'HEPA + Carbon', 'True HEPA', 'HEPA H14']);
        break;
      case 'smart_app':
        numericValue = rng() > 0.3 ? 1 : 0;
        value = numericValue ? 'Yes' : 'No';
        break;
      default:
        value = 'N/A';
    }

    return { key: field.key, label: field.label, value, unit: field.unit, numericValue };
  });
}

function generateOffers(basePrice: number, rng: () => number): MerchantOffer[] {
  const shuffled = [...MERCHANTS].sort(() => rng() - 0.5);
  const offerCount = randInt(rng, 2, 4);
  const now = Date.now();

  return shuffled.slice(0, offerCount).map((merchant, i) => {
    const variance = randFloat(rng, -0.06, 0.05, 3);
    const price = Math.round(basePrice * (1 + variance) * 100) / 100;
    const hadDiscount = rng() > 0.55;
    const previousPrice = hadDiscount ? Math.round(price * randFloat(rng, 1.05, 1.25, 2) * 100) / 100 : undefined;
    const minutesAgo = randInt(rng, 4, 90) + i * 7;
    const availability = rng() > 0.9 ? 'limited_stock' : rng() > 0.97 ? 'out_of_stock' : 'in_stock';

    return {
      merchant,
      price,
      previousPrice,
      currency: 'GBP',
      availability,
      updatedAt: new Date(now - minutesAgo * 60_000).toISOString(),
    };
  });
}

function generatePriceHistory(currentPrice: number, rng: () => number): PricePoint[] {
  const days = 90;
  const points: PricePoint[] = [];
  let price = currentPrice * randFloat(rng, 1.05, 1.35, 3);

  for (let d = days; d >= 0; d -= 3) {
    // Random walk that drifts down toward currentPrice, with occasional promo dips.
    const drift = (price - currentPrice) * 0.06;
    const noise = randFloat(rng, -4, 4, 2);
    const promo = rng() > 0.92 ? -randFloat(rng, 8, 25, 2) : 0;
    price = Math.max(currentPrice * 0.85, price - drift + noise + promo);

    const date = new Date();
    date.setDate(date.getDate() - d);
    points.push({ date: date.toISOString().slice(0, 10), price: Math.round(price * 100) / 100 });
  }
  // Ensure the series ends exactly at the current price for a coherent chart.
  const last = points[points.length - 1];
  if (last) last.price = currentPrice;
  return points;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateProductsForCategory(categorySlug: CategorySlug, categoryId: string): Product[] {
  const def = getCategoryDef(categorySlug);
  const products: Product[] = [];

  for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
    const rng = mulberry32(seedFromString(`${categorySlug}-${i}`));
    const brand = pick(rng, def.brands);
    const modelWord = pick(rng, def.modelWords);
    const modelNumber = randInt(rng, 1, 9);
    const title = `${brand} ${modelWord} ${modelNumber}`;
    const slug = slugify(`${title}-${categorySlug}-${i}`);

    const [minP, maxP] = PRICE_BANDS[categorySlug];
    const basePrice = Math.round(randFloat(rng, minP, maxP, 2) * 100) / 100;

    const specs = generateSpecs(categorySlug, rng);
    const featurePool = FEATURE_POOL[categorySlug];
    const featureCount = randInt(rng, 3, 5);
    const features = [...featurePool].sort(() => rng() - 0.5).slice(0, featureCount);

    const offers = generateOffers(basePrice, rng);
    const lowestOffer = offers.reduce((min, o) => (o.price < min.price ? o : min), offers[0]!);
    const priceHistory = generatePriceHistory(lowestOffer.price, rng);

    const rating = randFloat(rng, 3.6, 4.9, 1);
    const reviewCount = randInt(rng, 24, 4200);

    const availability = lowestOffer.availability;

    const imageSeed = slug;
    const imageUrl = `https://picsum.photos/seed/${imageSeed}/640/640`;
    const images = [0, 1, 2].map((n) => `https://picsum.photos/seed/${imageSeed}-${n}/640/640`);

    const now = new Date();
    const createdAt = new Date(now.getTime() - randInt(rng, 10, 400) * 86_400_000).toISOString();

    products.push({
      id: `p-${slug}`,
      slug,
      title,
      brand,
      categoryId,
      categorySlug,
      description: `${title} is a ${def.name.toLowerCase().slice(0, -1)} built for everyday use, balancing ${features[0]?.toLowerCase() ?? 'performance'} with dependable specs. Synthetic demo listing — not a real retail product.`,
      currency: 'GBP',
      rating,
      reviewCount,
      availability,
      imageUrl,
      images,
      productUrl: `https://example-merchant.demo/product/${slug}`,
      affiliateUrl: undefined,
      isDemo: true,
      createdAt,
      updatedAt: new Date().toISOString(),
      price: lowestOffer.price,
      previousPrice: lowestOffer.previousPrice,
      specifications: specs,
      features,
      offers,
      priceHistory,
    });
  }

  return products;
}

let cachedProducts: Product[] | null = null;

/** Generates (once, cached in-memory) the full synthetic catalog: ~110 products across 10 categories. */
export function generateAllProducts(): Product[] {
  if (cachedProducts) return cachedProducts;

  const all: Product[] = [];
  CATEGORY_DEFS.forEach((def) => {
    const categoryId = `cat-${def.slug}`;
    all.push(...generateProductsForCategory(def.slug, categoryId));
  });

  cachedProducts = all;
  return all;
}
