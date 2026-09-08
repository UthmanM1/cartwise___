/**
 * Mulberry32 seeded PRNG. Used so demo product data, prices and price
 * history are deterministic across server restarts and builds — the same
 * seed always produces the same catalog, which matters for a portfolio demo
 * and for tests that assert on generated data.
 */
export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

export function pick<T>(rng: () => number, arr: T[]): T {
  const item = arr[Math.floor(rng() * arr.length)];
  if (item === undefined) throw new Error('pick() called on empty array');
  return item;
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(rng: () => number, min: number, max: number, decimals = 1): number {
  const v = rng() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(v * factor) / factor;
}
