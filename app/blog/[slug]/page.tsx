import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { ARTICLES, articleBySlug } from '@/lib/blog';
import { SITE_NAME, SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `${SITE_URL}/blog/${article.slug}/` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.datePublished,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${article.slug}/`,
  };

  return (
    <div className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5">
        <article className="pt-8 pb-16">
          <p className="font-mono text-xs text-faint">
            {article.datePublished} · {article.minutes} min read
          </p>
          <h1 className="mt-3 font-display text-3xl leading-[1.1] sm:text-4xl">{article.title}</h1>
          {article.sections.map((s, i) => (
            <section key={i}>
              {s.h2 && <h2 className="mt-12 font-display text-xl sm:text-2xl">{s.h2}</h2>}
              {s.paras.map((p) => (
                <p key={p.slice(0, 32)} className="mt-5 leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <div className="mt-16 rounded-2xl border border-line bg-panel p-6">
            <p className="font-display">Try it on a real file</p>
            <p className="mt-2 text-sm text-muted">
              Undercap compresses any video to an exact size, in your browser, free — no upload, no
              watermark, no account.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Open the compressor
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
