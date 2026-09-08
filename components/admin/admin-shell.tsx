import type React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, Store, BarChart3, Sparkles } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/merchants', label: 'Merchants', icon: Store },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/ai-usage', label: 'AI usage', icon: Sparkles },
];

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-ink-800 p-4 md:block">
          <Link href="/" className="mb-6 block font-display text-lg text-paper">CARTWISE <span className="text-signal">admin</span></Link>
          <nav className="space-y-1 text-sm">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-2 rounded-sm px-2 py-2 text-ink-300 hover:bg-ink-900 hover:text-paper">
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-8 block text-xs text-ink-500 hover:text-ink-300">← Back to consumer site</Link>
        </aside>
        <main className="min-w-0 flex-1 p-5 md:p-8">
          <h1 className="mb-6 font-display text-2xl text-paper">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
