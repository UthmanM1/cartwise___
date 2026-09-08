import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignupForm } from '@/app/auth/signup/signup-form';

export const metadata: Metadata = { title: 'Create your account' };

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-sm text-ink-500">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
