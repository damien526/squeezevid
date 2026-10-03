import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { SITE_NAME, canonicalUrl, ogImageUrl } from '@/lib/site';

/**
 * The canonical is pinned to the home page rather than left to the layout's
 * `canonical: './'`.
 *
 * A relative canonical resolves against the internal `_not-found` segment,
 * which produced `https://www.squeezevid.app/_not-found/` — an address that
 * returns 404. Verified in the built `out/404.html` before the fix. The page
 * is `noindex`, so the damage was bounded, but a canonical pointing at a page
 * that does not exist is a false statement either way.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
  alternates: { canonical: canonicalUrl('/') },
  // Declared for the same reason as every other page: without an `openGraph`
  // block the `app/opengraph-image.tsx` file convention wins and ships the
  // robots-blocked `/opengraph-image` URL. `scripts/og-png.mjs` enforces it.
  openGraph: {
    type: 'website',
    url: canonicalUrl('/'),
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      { url: ogImageUrl(), width: 1200, height: 630, alt: SITE_NAME, type: 'image/png' },
    ],
  },
  twitter: { card: 'summary_large_image', images: [ogImageUrl()] },
};

export default function NotFound() {
  return (
    <div className="relative">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col items-start px-5 pt-16 pb-32">
        {/* An `<h1>`, not a `<p>`: the page had no heading of any level at all. */}
        <h1 className="font-display text-6xl">404</h1>
        <p className="mt-4 max-w-md text-muted">
          This page doesn’t exist, but the compressor does, and it’s one click away.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-lime px-7 py-3 font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Open the compressor
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
