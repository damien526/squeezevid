import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { ARTICLES } from '@/lib/blog';
import { blogIndexGraph, jsonLdGraph } from '@/lib/jsonld';
import {
  SITE_NAME,
  SITE_TAGLINE,
  canonicalUrl,
  ogImageUrl,
  socialTitle,
} from '@/lib/site';

const DESCRIPTION =
  'Notes on video compression from the people who do it in your browser: the math of size targets, WebCodecs, and the real upload limits of 2026.';

export const metadata: Metadata = {
  title: 'Blog',
  description: DESCRIPTION,
  alternates: { canonical: canonicalUrl('/blog') },
  openGraph: {
    type: 'website',
    url: canonicalUrl('/blog'),
    siteName: SITE_NAME,
    locale: 'en_US',
    title: socialTitle('Notes on making video smaller'),
    description: DESCRIPTION,
    images: [
      {
        url: ogImageUrl(),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME}: ${SITE_TAGLINE}`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle('Notes on making video smaller'),
    description: DESCRIPTION,
    images: [ogImageUrl()],
  },
};

export default function BlogIndex() {
  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(blogIndexGraph(ARTICLES, DESCRIPTION)) }}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-5">
        <h1 className="pt-8 font-display text-3xl sm:text-5xl">Notes on making video smaller</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Short, factual pieces about how compression actually works, written against the real
          behavior of the tool, dated where facts can age.
        </p>
        <ul className="mt-12 space-y-6 pb-24">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/blog/${a.slug}/`}
                className="group block rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-line-strong sm:p-8"
              >
                <p className="font-mono text-xs text-faint">
                  {a.datePublished} · {a.minutes} min
                </p>
                <h2 className="mt-2 font-display text-xl transition-colors group-hover:text-lime sm:text-2xl">
                  {a.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{a.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
