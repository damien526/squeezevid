import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Tool } from '@/components/Tool';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { LANDING_PAGES, landingBySlug } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = landingBySlug(slug);
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.metaDescription,
    alternates: { canonical: `${SITE_URL}/${page.slug}/` },
    openGraph: { title: page.title, description: page.metaDescription },
  };
}

export default async function LandingPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = landingBySlug(slug);
  if (!page) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const others = LANDING_PAGES.filter((p) => p.slug !== page.slug).slice(0, 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
