import Link from 'next/link';
import { PackageX } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center gap-3 py-16 text-center">
      <PackageX className="h-10 w-10 text-ink-300" />
      <h1 className="font-display text-xl text-ink-950">Product not found</h1>
      <p className="max-w-sm text-sm text-ink-500">This listing may have been removed or the link is incorrect.</p>
      <Link href="/search" className="mt-2 text-sm text-signal hover:underline">Browse all products</Link>
    </div>
  );
}
