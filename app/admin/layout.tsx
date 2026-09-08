import type React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEMO_MODE } from '@/lib/config';

/**
 * Admin route protection. Middleware (middleware.ts) already redirects
 * unauthenticated visitors to /auth/login for any /admin/* path. This layer
 * adds the second check: the authenticated user must have
 * profiles.preferences.role === 'admin'.
 *
 * In demo mode there is no real user/role system, so admin pages render
 * with a visible "Demo data" banner instead of being gated — this keeps the
 * portfolio demo browsable without requiring a seeded admin account, while
 * live mode enforces real role-based access control.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!DEMO_MODE) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login?next=/admin');

    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', user.id).single();
    if (profile?.preferences?.role !== 'admin') redirect('/');
  }

  return <>{children}</>;
}
