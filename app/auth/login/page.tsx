import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/app/auth/login/login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-sm text-ink-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
