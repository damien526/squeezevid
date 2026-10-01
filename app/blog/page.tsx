import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { ARTICLES } from '@/lib/blog';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on video compression from the people who do it in your browser: the math of size targets, WebCodecs, and the real upload limits of 2026.',
  alternates: { canonical: `${SITE_URL}/blog/` },
};

export default function BlogIndex() {
  return (
    <div className="relative">
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
