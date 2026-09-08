import type { Merchant } from '@/lib/types';

// Demo merchants only. CARTWISE does not have — and does not claim to have —
// real affiliate relationships with any of these. See MerchantService for
// how a real merchant feed / affiliate network would be wired in.
export const MERCHANTS: Merchant[] = [
  { id: 'm-orbitgoods', slug: 'orbitgoods', name: 'OrbitGoods', logoText: 'ORBIT', isDemo: true, deliveryNotes: 'Free delivery over £30' },
  { id: 'm-brightaisle', slug: 'brightaisle', name: 'BrightAisle', logoText: 'BRIGHT AISLE', isDemo: true, deliveryNotes: 'Next-day delivery available' },
  { id: 'm-keplerstore', slug: 'keplerstore', name: 'Kepler Store', logoText: 'KEPLER', isDemo: true, deliveryNotes: 'Free returns within 30 days' },
  { id: 'm-fieldandfern', slug: 'fieldandfern', name: 'Field & Fern', logoText: 'FIELD & FERN', isDemo: true, deliveryNotes: 'Ships in 2–4 days' },
  { id: 'm-northlane', slug: 'northlane', name: 'Northlane', logoText: 'NORTHLANE', isDemo: true, deliveryNotes: 'Price-match guarantee' },
];

export function getMerchant(id: string): Merchant {
  const m = MERCHANTS.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown merchant: ${id}`);
  return m;
}
