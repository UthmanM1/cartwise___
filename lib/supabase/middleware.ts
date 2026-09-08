import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/config';

/** Refreshes the Supabase auth session on every request. Called from middleware.ts. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Demo mode (no Supabase project configured): there is no auth system to
  // refresh or enforce, so every route is browsable. /saved, /watchlists,
  // /profile and /admin still exist and render (with "sign in" prompts or
  // demo banners) rather than 404ing, per the app's demo-mode requirement.
  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = ['/saved', '/watchlists', '/profile'];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');

  if ((isProtected || isAdmin) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
