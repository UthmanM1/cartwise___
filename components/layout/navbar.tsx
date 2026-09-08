import Link from 'next/link';
import { Search, Scale, Heart, User } from 'lucide-react';
import { CATEGORIES } from '@/lib/data/category-list';

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-paper/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex flex-col leading-none shrink-0">
          <span className="font-display text-xl tracking-tight text-ink-950">CARTWISE</span>
          <span className="hidden sm:block text-[10px] uppercase tracking-[0.18em] text-ink-500">Compare smarter</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 text-sm text-ink-700">
          {CATEGORIES.slice(0, 6).map((c) => (
            <Link key={c.slug} href={`/search?category=${c.slug}`} className="hover:text-signal transition-colors">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/search" className="p-2 text-ink-700 hover:text-signal" aria-label="Search">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/compare" className="p-2 text-ink-700 hover:text-signal" aria-label="Compare">
            <Scale className="h-5 w-5" />
          </Link>
          <Link href="/saved" className="p-2 text-ink-700 hover:text-signal" aria-label="Saved">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/profile" className="p-2 text-ink-700 hover:text-signal" aria-label="Profile">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
