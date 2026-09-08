import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <Compass className="h-10 w-10 text-ink-300" />
      <h1 className="font-display text-2xl text-ink-950">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="mt-2 text-sm text-signal hover:underline">Back to home</Link>
    </div>
  );
}
