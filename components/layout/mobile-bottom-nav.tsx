'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Scale, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/compare', label: 'Compare', icon: Scale },
  { href: '/saved', label: 'Saved', icon: Heart },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex md:hidden border-t border-ink-200 bg-paper">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn('flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]', active ? 'text-signal' : 'text-ink-500')}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
