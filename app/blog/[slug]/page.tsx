import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { ARTICLES, articleBySlug } from '@/lib/blog';
import { articleGraph, jsonLdGraph } from '@/lib/jsonld';
import {
  PUBLISHER_NAME,
  SITE_NAME,
  SITE_TAGLINE,
  canonicalUrl,
  ogImageUrl,
  socialTitle,
} from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) return {};
  const url = canonicalUrl(`/blog/${article.slug}`);

  return {
    /**
     * `absolute`, with `metaTitle` where the headline is too long for a
     * `<title>`, and WITHOUT the brand suffix.
     *
     * Two constraints, not one. The layout's `%s · SqueezeVid` template pushed
     * these titles to 82 and 74 characters, past the width Google renders —
     * and it is always the end that goes, so both lost what located them.
     * Dropping the brand from the `<title>` buys back thirteen characters that
     * a reader scanning a result page can actually use; the brand still rides
     * on the social card below, which has no such width and reaches the reader
     * with no domain in sight.
     */
    title: { absolute: article.metaTitle ?? article.title },
    description: article.description,
    alternates: { canonical: url },
    // Same trap as the landing pages: declaring `openGraph` here replaces the
    // layout's, so the image has to be named explicitly or the card ships empty.
    openGraph: {
      title: socialTitle(article.title),
      description: article.description,
      type: 'article',
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified ?? article.datePublished,
      authors: [PUBLISHER_NAME],
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
      title: socialTitle(article.title),
      description: article.description,
      images: [ogImageUrl()],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articleBySlug(slug);
  if (!article) notFound();

  const reading = (article.related ?? [])
    .map((slug) => articleBySlug(slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a) && a!.slug !== article.slug);

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(articleGraph(article)) }}
      />
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
              SqueezeVid compresses any video to an exact size, in your browser, free. No upload, no
              watermark, no account.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-lime px-6 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Open the compressor
            </Link>
          </div>

          {reading.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-xl sm:text-2xl">Keep reading</h2>
              <ul className="mt-6 space-y-4">
                {reading.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/blog/${a.slug}/`}
                      className="group block rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-line-strong"
                    >
                      <p className="font-medium transition-colors group-hover:text-lime">
                        {a.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{a.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
