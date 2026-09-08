/**
 * Shared constants with NO imports from server-only modules (no
 * lib/services/*, no lib/supabase/server, no next/headers anywhere in
 * their dependency chain). This file exists specifically so client
 * components and hooks can reference values like MAX_COMPARE_PRODUCTS
 * without accidentally pulling ProductService (and therefore the Supabase
 * server client, which imports next/headers) into the browser bundle.
 *
 * Rule of thumb: if a constant needs to be read from a 'use client' file,
 * it belongs here — not in a service file, even if it feels more "at home"
 * next to the service that also uses it.
 */
export const MAX_COMPARE_PRODUCTS = 4;
