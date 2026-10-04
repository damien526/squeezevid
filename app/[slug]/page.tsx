import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tool } from '@/components/Tool';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { articleBySlug } from '@/lib/blog';
import { LANDING_PAGES, landingBySlug } from '@/lib/content';
import { jsonLdGraph, landingGraph } from '@/lib/jsonld';
import {
  SITE_NAME,
  SITE_TAGLINE,
  canonicalUrl,
  ogImageUrl,
  socialTitle,
} from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = landingBySlug(slug);
  if (!page) return {};
  const url = canonicalUrl(`/${page.slug}`);

  return {
    title: { absolute: page.title },
    description: page.metaDescription,
    alternates: { canonical: url },
    /**
     * ⚠ `images` IS NOT OPTIONAL HERE. Declaring an `openGraph` object in
     * `generateMetadata` REPLACES the layout's, and the file-based
     * `app/opengraph-image.tsx` is not resolved for this segment either — so
     * these pages shipped `twitter:card="summary_large_image"` with no image
     * at all, and every share rendered as a bare link. On a site whose
     * flagship page is "compress for Discord", that was the worst possible
     * place for it. Verified in the built HTML before the fix.
     */
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      locale: 'en_US',
      title: socialTitle(page.title),
      description: page.metaDescription,
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
      title: socialTitle(page.title),
      description: page.metaDescription,
      images: [ogImageUrl()],
    },
  };
}

export default async function LandingPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = landingBySlug(slug);
  if (!page) notFound();

  const others = LANDING_PAGES.filter((p) => p.slug !== page.slug).slice(0, 6);
  const reading = (page.relatedArticles ?? [])
    .map((slug) => articleBySlug(slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(landingGraph(page)) }}
      />
      <div className="dotgrid absolute inset-x-0 top-0 h-[360px]" aria-hidden="true" />
      <div className="relative">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-5">
          <section className="pt-8 sm:pt-12">
            <h1 className="font-display text-3xl leading-[1.08] sm:text-5xl">{page.h1}</h1>
            {page.intro.map((p) => (
              <p key={p.slice(0, 32)} className="mt-5 max-w-3xl leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </section>

          <section className="mt-10" aria-label="Video compressor">
            <Tool initialTargetId={page.targetId ?? undefined} />
          </section>

          {page.ladder && page.ladder.length > 0 && (
            /*
             * What the target actually produces, duration by duration.
             *
             * These figures used to be sentences, and three of them were wrong
             * in the tool's favour. As a table they are checked row by row
             * against the real planner in `lib/content-claims.test.ts`, which
             * is the whole reason they moved out of the prose — see the comment
             * on `ladder` in `lib/content.ts`.
             *
             * The table scrolls inside its own container rather than widening
             * the page: five rows of three columns is narrow, but a reader at
             * 320 px should not get a horizontally scrolling document.
             */
            <section className="mt-16">
              <h2 className="font-display text-xl sm:text-2xl">What you get, by clip length</h2>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[22rem] max-w-2xl border-collapse text-sm">
                  <caption className="caption-bottom pt-3 text-left text-xs text-faint">
                    For a 1080p 30 fps source with a 128 kbit/s AAC soundtrack — an ordinary screen
                    recording or phone export. SqueezeVid reports the resolution it picked for your
                    actual file before you download.
                  </caption>
                  <thead>
                    <tr className="border-b border-line text-left text-muted">
                      <th scope="col" className="py-2 pr-4 font-medium">Clip length</th>
                      <th scope="col" className="py-2 pr-4 font-medium">Resolution</th>
                      <th scope="col" className="py-2 font-medium">Video bitrate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.ladder.map((row) => (
                      <tr key={row.minutes} className="border-b border-line/60">
                        <th scope="row" className="py-2 pr-4 font-normal">
                          {row.minutes === 60 ? '1 hour' : `${row.minutes} min`}
                        </th>
                        <td className="py-2 pr-4 tabular-nums text-muted">{row.resolution}</td>
                        <td className="py-2 tabular-nums text-muted">{row.mbits} Mbit/s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {page.ceiling && (
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
                  Longest clip this target accepts: about {page.ceiling.withAudio} minutes with
                  sound, or about {page.ceiling.muted} with the audio removed. Past that SqueezeVid
                  declines the target and says why, rather than producing a file you would not send.
                </p>
              )}
            </section>
          )}

          {page.sections.map((s) => (
            <section key={s.heading} className="mt-16">
              <h2 className="font-display text-xl sm:text-2xl">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p.slice(0, 32)} className="mt-4 max-w-3xl leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}

          <section className="mt-16">
            <h2 className="font-display text-xl sm:text-2xl">Frequently asked</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {page.faq.map((f) => (
                <div key={f.q} className="py-5">
                  <dt className="font-medium">{f.q}</dt>
                  <dd className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {reading.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-xl sm:text-2xl">Read next</h2>
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

          <section className="mt-16 pb-24">
            <h2 className="text-sm font-semibold text-muted">Other limits</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}/`}
                  className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  {p.footerLabel}
                </Link>
              ))}
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
