import type { Metadata } from 'next';
import type React from 'react';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { SITE_URL } from '@/lib/config';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const display = Fraunces({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'CARTWISE — Compare smarter. Buy with confidence.', template: '%s · CARTWISE' },
  description:
    'CARTWISE is an AI-powered product comparison and shopping intelligence platform. Search, filter, compare and track prices across laptops, phones, headphones and more.',
  openGraph: {
    title: 'CARTWISE — Compare smarter. Buy with confidence.',
    description: 'Find the right product without the research overload.',
    siteName: 'CARTWISE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Navbar />
        <div className="flex-1 pb-16 md:pb-0">{children}</div>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
