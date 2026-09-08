import type { Category, CategorySlug, SpecSchemaField } from '@/lib/types';

interface CategoryDef {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string; // lucide-react icon name, resolved in components/product/category-icon.tsx
  specSchema: SpecSchemaField[];
  brands: string[];
  modelWords: string[]; // used to synthesize model names, e.g. "Vantree Air 2"
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    slug: 'laptops',
    name: 'Laptops',
    description: 'Ultrabooks, workstations and everyday laptops compared on performance, battery and value.',
    icon: 'laptop',
    brands: ['Nordkit', 'Aurelia', 'Vantree', 'Halcyon', 'Ferro', 'Quillon'],
    modelWords: ['Slate', 'Aero', 'Forge', 'Pulse', 'Loom', 'Rove', 'Nova', 'Drift'],
    specSchema: [
      { key: 'cpu', label: 'Processor', type: 'text' },
      { key: 'ram_gb', label: 'RAM', unit: 'GB', type: 'number', higherIsBetter: true },
      { key: 'storage_gb', label: 'Storage', unit: 'GB', type: 'number', higherIsBetter: true },
      { key: 'screen_size_in', label: 'Screen size', unit: '"', type: 'number' },
      { key: 'battery_life_hours', label: 'Battery life', unit: 'h', type: 'number', higherIsBetter: true },
      { key: 'weight_kg', label: 'Weight', unit: 'kg', type: 'number', higherIsBetter: false },
    ],
  },
  {
    slug: 'smartphones',
    name: 'Smartphones',
    description: 'Flagship and mid-range phones compared on camera, battery and everyday performance.',
    icon: 'smartphone',
    brands: ['Halcyon', 'Ferro', 'Quillon', 'Vantree', 'Aurelia', 'Sablewood'],
    modelWords: ['X', 'Edge', 'Prime', 'Lite', 'Max', 'Neo', 'Vue', 'Flow'],
    specSchema: [
      { key: 'screen_size_in', label: 'Screen size', unit: '"', type: 'number' },
      { key: 'storage_gb', label: 'Storage', unit: 'GB', type: 'number', higherIsBetter: true },
      { key: 'battery_mah', label: 'Battery', unit: 'mAh', type: 'number', higherIsBetter: true },
      { key: 'camera_mp', label: 'Main camera', unit: 'MP', type: 'number', higherIsBetter: true },
      { key: 'weight_g', label: 'Weight', unit: 'g', type: 'number', higherIsBetter: false },
      { key: 'five_g', label: '5G', type: 'boolean' },
    ],
  },
  {
    slug: 'headphones',
    name: 'Headphones',
    description: 'Over-ear and in-ear headphones compared on noise cancelling, battery and comfort.',
    icon: 'headphones',
    brands: ['Sablewood', 'Nordkit', 'Aurelia', 'Ferro', 'Loomcraft', 'Vantree'],
    modelWords: ['ANC', 'Cloud', 'Studio', 'Air', 'Mode', 'Fold', 'Wave', 'Tune'],
    specSchema: [
      { key: 'battery_life_hours', label: 'Battery life', unit: 'h', type: 'number', higherIsBetter: true },
      { key: 'anc', label: 'Active noise cancelling', type: 'boolean' },
      { key: 'weight_g', label: 'Weight', unit: 'g', type: 'number', higherIsBetter: false },
      { key: 'bluetooth_version', label: 'Bluetooth', type: 'text' },
      { key: 'driver_size_mm', label: 'Driver size', unit: 'mm', type: 'number', higherIsBetter: true },
    ],
  },
  {
    slug: 'monitors',
    name: 'Monitors',
    description: 'Home office and gaming monitors compared on resolution, refresh rate and panel quality.',
    icon: 'monitor',
    brands: ['Quillon', 'Ferro', 'Halcyon', 'Nordkit', 'Vantree', 'Aurelia'],
    modelWords: ['View', 'Curve', 'Flat', 'Pro', 'Studio', 'Frame', 'Edge', 'Clarity'],
    specSchema: [
      { key: 'screen_size_in', label: 'Screen size', unit: '"', type: 'number', higherIsBetter: true },
      { key: 'resolution', label: 'Resolution', type: 'text' },
      { key: 'refresh_rate_hz', label: 'Refresh rate', unit: 'Hz', type: 'number', higherIsBetter: true },
      { key: 'panel_type', label: 'Panel', type: 'text' },
      { key: 'response_time_ms', label: 'Response time', unit: 'ms', type: 'number', higherIsBetter: false },
    ],
  },
  {
    slug: 'cameras',
    name: 'Cameras',
    description: 'Mirrorless and compact cameras compared on resolution, sensor and video capability.',
    icon: 'camera',
    brands: ['Loomcraft', 'Sablewood', 'Ferro', 'Aurelia', 'Halcyon', 'Quillon'],
    modelWords: ['Lumen', 'Frame', 'Shutter', 'Focal', 'Aperture', 'Capture', 'Vista', 'Prime'],
    specSchema: [
      { key: 'megapixels', label: 'Resolution', unit: 'MP', type: 'number', higherIsBetter: true },
      { key: 'sensor_type', label: 'Sensor', type: 'text' },
      { key: 'iso_max', label: 'Max ISO', type: 'number', higherIsBetter: true },
      { key: 'video_resolution', label: 'Video', type: 'text' },
      { key: 'weight_g', label: 'Weight', unit: 'g', type: 'number', higherIsBetter: false },
    ],
  },
  {
    slug: 'running-shoes',
    name: 'Running Shoes',
    description: 'Road and trail running shoes compared on weight, cushioning and drop.',
    icon: 'footprints',
    brands: ['Sprintwell', 'Traillight', 'Corestride', 'Nordkit Sport', 'Vantree Run', 'Ferro Sport'],
    modelWords: ['Glide', 'Pace', 'Trail', 'Bounce', 'Flex', 'Stride', 'Cloud', 'Peak'],
    specSchema: [
      { key: 'weight_g', label: 'Weight', unit: 'g', type: 'number', higherIsBetter: false },
      { key: 'drop_mm', label: 'Heel-to-toe drop', unit: 'mm', type: 'number' },
      { key: 'cushioning', label: 'Cushioning', type: 'text' },
      { key: 'terrain', label: 'Terrain', type: 'text' },
      { key: 'breathability', label: 'Breathability', type: 'text' },
    ],
  },
  {
    slug: 'office-chairs',
    name: 'Office Chairs',
    description: 'Ergonomic office chairs compared on support, adjustability and build quality.',
    icon: 'armchair',
    brands: ['Postura', 'Nordkit Home', 'Ferro Office', 'Halcyon Living', 'Quillon Home', 'Aurelia Living'],
    modelWords: ['Flex', 'Support', 'Task', 'Recline', 'Mesh', 'Executive', 'Balance', 'Core'],
    specSchema: [
      { key: 'weight_capacity_kg', label: 'Weight capacity', unit: 'kg', type: 'number', higherIsBetter: true },
      { key: 'adjustable_arms', label: 'Adjustable arms', type: 'boolean' },
      { key: 'lumbar_support', label: 'Lumbar support', type: 'boolean' },
      { key: 'material', label: 'Material', type: 'text' },
      { key: 'warranty_years', label: 'Warranty', unit: 'yrs', type: 'number', higherIsBetter: true },
    ],
  },
  {
    slug: 'coffee-machines',
    name: 'Coffee Machines',
    description: 'Espresso, bean-to-cup and capsule machines compared on pressure, capacity and speed.',
    icon: 'coffee',
    brands: ['Roastwell', 'Nordkit Kitchen', 'Ferro Home', 'Halcyon Kitchen', 'Vantree Home', 'Aurelia Kitchen'],
    modelWords: ['Barista', 'Brew', 'Crema', 'Roast', 'Aroma', 'Espresso', 'Bean', 'Mornings'],
    specSchema: [
      { key: 'pressure_bar', label: 'Pump pressure', unit: 'bar', type: 'number', higherIsBetter: true },
      { key: 'water_tank_l', label: 'Water tank', unit: 'L', type: 'number', higherIsBetter: true },
      { key: 'brew_time_sec', label: 'Brew time', unit: 's', type: 'number', higherIsBetter: false },
      { key: 'milk_frother', label: 'Milk frother', type: 'boolean' },
      { key: 'capsule_or_bean', label: 'Type', type: 'text' },
    ],
  },
  {
    slug: 'robot-vacuums',
    name: 'Robot Vacuums',
    description: 'Robot vacuum cleaners compared on suction power, runtime and smart mapping.',
    icon: 'bot',
    brands: ['Sweepwell', 'Nordkit Home', 'Ferro Clean', 'Halcyon Home', 'Vantree Clean', 'Quillon Home'],
    modelWords: ['Roam', 'Sweep', 'Glide', 'Nav', 'Auto', 'Clean', 'Path', 'Orbit'],
    specSchema: [
      { key: 'suction_pa', label: 'Suction power', unit: 'Pa', type: 'number', higherIsBetter: true },
      { key: 'battery_runtime_min', label: 'Runtime', unit: 'min', type: 'number', higherIsBetter: true },
      { key: 'mapping', label: 'Smart mapping', type: 'boolean' },
      { key: 'noise_db', label: 'Noise level', unit: 'dB', type: 'number', higherIsBetter: false },
      { key: 'bin_capacity_l', label: 'Bin capacity', unit: 'L', type: 'number', higherIsBetter: true },
    ],
  },
  {
    slug: 'air-purifiers',
    name: 'Air Purifiers',
    description: 'Air purifiers compared on coverage area, clean air delivery rate and noise.',
    icon: 'wind',
    brands: ['Purevent', 'Nordkit Air', 'Ferro Home', 'Halcyon Air', 'Vantree Home', 'Aurelia Air'],
    modelWords: ['Clarity', 'Fresh', 'Pure', 'Breeze', 'Filt', 'Clean', 'Aura', 'Zephyr'],
    specSchema: [
      { key: 'coverage_sqm', label: 'Room coverage', unit: 'm²', type: 'number', higherIsBetter: true },
      { key: 'cadr_m3h', label: 'CADR', unit: 'm³/h', type: 'number', higherIsBetter: true },
      { key: 'filter_type', label: 'Filter type', type: 'text' },
      { key: 'noise_db', label: 'Noise level', unit: 'dB', type: 'number', higherIsBetter: false },
      { key: 'smart_app', label: 'App control', type: 'boolean' },
    ],
  },
];

export function getCategoryDef(slug: CategorySlug): CategoryDef {
  const def = CATEGORY_DEFS.find((c) => c.slug === slug);
  if (!def) throw new Error(`Unknown category: ${slug}`);
  return def;
}

export type { CategoryDef };
