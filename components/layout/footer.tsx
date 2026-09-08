import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200 bg-ink-950 text-ink-200 pb-20 md:pb-0">
      <div className="container py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="font-display text-lg text-paper">CARTWISE</span>
          <p className="mt-2 text-sm text-ink-400">Compare smarter. Buy with confidence.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-semibold text-paper">Shop</h4>
          <ul className="space-y-2 text-ink-400">
            <li><Link href="/search" className="hover:text-paper">All products</Link></li>
            <li><Link href="/compare" className="hover:text-paper">Compare</Link></li>
            <li><Link href="/saved" className="hover:text-paper">Saved products</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-semibold text-paper">Account</h4>
          <ul className="space-y-2 text-ink-400">
            <li><Link href="/profile" className="hover:text-paper">Profile</Link></li>
            <li><Link href="/watchlists" className="hover:text-paper">Watchlists</Link></li>
            <li><Link href="/auth/login" className="hover:text-paper">Sign in</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-semibold text-paper">About</h4>
          <p className="text-ink-400">
            CARTWISE is a demonstration portfolio project. Product listings, prices and merchants are
            synthetic demo data unless a live product feed has been connected.
          </p>
        </div>
      </div>
    </footer>
  );
}
