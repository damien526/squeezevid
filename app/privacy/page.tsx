import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { contentPageGraph, jsonLdGraph } from '@/lib/jsonld';
import { SITE_NAME, canonicalUrl, ogImageUrl, socialTitle } from '@/lib/site';

const DESCRIPTION =
  'SqueezeVid never sees your videos; they are processed entirely in your browser. Here is exactly what is and is not collected.';

export const metadata: Metadata = {
  title: 'Privacy',
  description: DESCRIPTION,
  alternates: { canonical: canonicalUrl('/privacy') },
  // Declared so the `app/opengraph-image.tsx` file convention cannot override
  // the layout's `images` with the robots-blocked `/opengraph-image` URL.
  openGraph: {
    type: 'website',
    url: canonicalUrl('/privacy'),
    siteName: SITE_NAME,
    locale: 'en_US',
    title: socialTitle('Privacy'),
    description: DESCRIPTION,
    images: [
      { url: ogImageUrl(), width: 1200, height: 630, alt: SITE_NAME, type: 'image/png' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle('Privacy'),
    description: DESCRIPTION,
    images: [ogImageUrl()],
  },
};

export default function PrivacyPage() {
  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            contentPageGraph({
              url: canonicalUrl('/privacy'),
              name: 'Privacy',
              description: DESCRIPTION,
              crumb: 'Privacy',
            }),
          ),
        }}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24">
        <h1 className="pt-8 font-display text-3xl sm:text-4xl">Privacy</h1>
        <p className="mt-3 font-mono text-xs text-faint">Last updated: October 1, 2026</p>

        <section className="mt-10 space-y-4 leading-relaxed text-muted">
          <h2 className="font-display text-xl text-fg">Your videos</h2>
          <p>
            SqueezeVid never receives your videos. Files are opened, analyzed, re-encoded and saved
            entirely inside your browser using WebCodecs. There is no upload endpoint on this site:
            not a policy choice we could quietly change, but how the product is built. If you watch
            your network tab while compressing, you will see no video data leave your machine.
          </p>
          <p>
            Filenames, file contents, thumbnails and metadata all stay on your device. Nothing about
            a specific video is stored by us anywhere, because it never reaches us.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">What is collected</h2>
          <p>
            We use Vercel Web Analytics, which is cookieless, to count page views and understand
            which pages are useful. Additionally, the tool reports a small set of anonymous usage
            events so we can find and fix failures: that a file was loaded (its rounded size in MB,
            duration in seconds, and codec name, never its name or content), that a compression
            started, succeeded (how long it took, input and output size in MB), failed (an error
            category), or was canceled, and that a download happened.
          </p>
          <p>
            These events contain no identifiers, no filenames, and nothing that could reconstruct
            what a video showed. They exist to answer questions like “do exports fail more often on
            HEVC input?”, not to profile anyone.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Cookies and accounts</h2>
          <p>
            There are no accounts, no logins, and no cookies set by us. Your settings live in the
            page while it is open and disappear when you close it. The site makes no requests to
            third-party domains: fonts are self-hosted, there are no ad or tracking scripts, and
            the analytics described above are served from this site’s own origin.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Hosting</h2>
          <p>
            The site is hosted on Vercel. Like any web host, Vercel processes the technical data
            needed to deliver pages (your IP address and request headers in transient access logs)
            and computes the aggregate, cookieless statistics mentioned above on our behalf. Vercel
            operates globally, so these requests may be served from infrastructure outside the EU
            under its standard data-processing terms. We never see raw IP addresses or individual
            visitor profiles, only aggregate counts.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Who runs this, and your rights</h2>
          <p>
            SqueezeVid is operated by an independent developer, who acts as the data controller for
            the little data described on this page. You can reach the operator at{' '}
            <a href="mailto:damienyvert.dev@gmail.com" className="text-lime underline underline-offset-4">
              damienyvert.dev@gmail.com
            </a>{' '}
            for any privacy question, including the access, rectification, erasure, restriction,
            portability and objection rights granted by the GDPR. In practice there is usually
            nothing to retrieve or erase: we hold no account data and no content, and the usage
            events are anonymous aggregates that cannot be tied back to you. You also have the
            right to complain to your local data-protection authority.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Questions</h2>
          <p>
            This page is deliberately short because the architecture does the heavy lifting: a tool
            that cannot see your files has very little privacy left to explain. If anything is
            unclear, write to the address above. Security reports are welcome too, via{' '}
            <a href="/.well-known/security.txt" className="text-lime underline underline-offset-4">
              security.txt
            </a>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
