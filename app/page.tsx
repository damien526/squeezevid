import Link from 'next/link';
import { Tool } from '@/components/Tool';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { LANDING_PAGES } from '@/lib/content';
import { homeGraph, jsonLdGraph } from '@/lib/jsonld';
import type { Metadata } from 'next';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  canonicalUrl,
  ogImageUrl,
} from '@/lib/site';

/**
 * The home page declares its own `openGraph` block for one reason: without
 * one, the `app/opengraph-image.tsx` file convention overrides the `images`
 * inherited from the layout, and this page shipped the extensionless,
 * robots-blocked `/opengraph-image` URL. `scripts/og-png.mjs` fails the build
 * if that ever comes back.
 */
export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/') },
  openGraph: {
    type: 'website',
    url: canonicalUrl('/'),
    siteName: SITE_NAME,
    locale: 'en_US',
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
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
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [ogImageUrl()],
  },
};

const FAQ = [
  {
    q: 'Is SqueezeVid really free?',
    a: 'Yes: free, no account, no watermark, no file limits, no “3 free exports”. Compression runs on your own computer, so serving you costs almost nothing, and the tool can stay genuinely free.',
  },
  {
    q: 'Is my video uploaded to a server?',
    a: 'No. SqueezeVid runs entirely in your browser using WebCodecs. The file is read from your disk, re-encoded by your machine’s own hardware, and saved back to your downloads. It never touches a server; there is nothing to upload it to.',
  },
  {
    q: 'Why is it faster than online compressors?',
    a: 'Two reasons. Cloud tools spend minutes uploading your file before work starts; SqueezeVid starts instantly. And it uses your computer’s hardware video encoder, the same silicon a native app would use, rather than a shared server queue, so encoding typically runs several times faster than real-time.',
  },
  {
    q: 'What formats can I compress?',
    a: 'Input: MP4, MOV, WebM and MKV, including HEVC footage from iPhones, wherever your hardware can decode it. Output: MP4 with H.264 video and AAC audio, the most universally playable combination there is.',
  },
  {
    q: 'How does it guarantee the file fits under my limit?',
    a: 'It computes the exact bitrate budget your target allows for your clip’s duration, encodes a few percent under it for safety, then measures the real result. If a pass overshoots, it automatically re-encodes tighter. The download button only appears with a file that fits.',
  },
  {
    q: 'Will the quality be ruined?',
    a: 'Quality is decided by target size versus duration: physics, not the tool. SqueezeVid spends the available bits as well as they can be spent, stepping down resolution when the budget per pixel gets too thin, and tells you what it decided. Short clips survive tiny targets well; for very long clips it will honestly warn you when a target is unrealistic.',
  },
  {
    q: 'Which browsers work?',
    a: 'Up-to-date Chrome, Edge, Brave, Opera and Firefox on desktop. Safari’s WebCodecs support is still partial, and phones can work but desktop is recommended for large files.',
  },
  {
    q: 'Is there a file size or length limit?',
    a: 'No hard limit. The input is streamed from disk rather than loaded whole, so multi-gigabyte recordings work. Only the compressed output lives in memory, and that is at most the size you asked for.',
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(homeGraph(FAQ)) }}
      />
      <div className="dotgrid absolute inset-x-0 top-0 h-[480px]" aria-hidden="true" />
      <div className="relative">
        <SiteHeader />

        <main className="mx-auto w-full max-w-5xl px-5">
          {/* Hero */}
          <section className="pt-10 sm:pt-16">
            <h1 className="font-display text-4xl leading-[1.05] sm:text-6xl">
              Fit any video
              <br />
              under <span className="text-lime">any size limit.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Pick a target (20 MB for Discord, 18 MB for email, or any number) and get a file
              that actually fits. Compressed by <strong className="font-semibold text-fg">your own computer</strong>,
              right in the browser. No upload, no queue, no watermark, no account.
            </p>
          </section>

          {/* Tool */}
          <section className="mt-10" aria-label="Video compressor">
            <Tool />
          </section>

          {/* Why local */}
          <section className="mt-24 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'No upload, so it’s fast',
                body: 'Cloud compressors make you upload a huge file to shrink it: minutes of waiting before work even starts. SqueezeVid starts instantly and encodes with your machine’s hardware encoder, typically several times faster than real-time.',
              },
              {
                title: 'Private by architecture',
                body: 'Your video is read from disk, re-encoded, and saved, all inside the browser. There is no server to retain it, scan it, or leak it. Not a policy promise: there is simply nowhere for the file to go.',
              },
              {
                title: 'An exact target, not a quality dial',
                body: 'Limits are numbers, so the tool takes a number. It computes the bitrate your duration allows, downscales only when the math demands it, verifies the real output size, and re-runs tighter if needed.',
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-line bg-panel p-6">
                <h2 className="font-display text-lg">{c.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
              </div>
            ))}
          </section>

          {/* How it works */}
          <section className="mt-24">
            <h2 className="font-display text-2xl sm:text-3xl">How it works</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                ['Drop a video', 'MP4, MOV, WebM or MKV. Any length, any size. The file opens locally; nothing is sent anywhere.'],
                ['Pick the limit', 'A preset like Discord’s 20 MB, or any number of megabytes. The gauge shows how far over the line your file sits.'],
                ['Download the fit', 'Hardware encoding brings it under the line, the size is verified, and you save a clean MP4 with no watermark.'],
              ].map(([t, b], i) => (
                <li key={t} className="rounded-2xl border border-line bg-panel p-6">
                  <span className="font-display text-lime">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-2 font-display text-lg">{t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{b}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Use cases / internal links */}
          <section className="mt-24">
            <h2 className="font-display text-2xl sm:text-3xl">Compress for a specific limit</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Every platform draws its line somewhere. These pages explain each limit and open the
              tool with the right target preselected.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {LANDING_PAGES.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}/`}
                  className="group rounded-xl border border-line bg-panel px-5 py-4 transition-colors hover:border-line-strong"
                >
                  <span className="text-sm font-medium transition-colors group-hover:text-lime">
                    {p.h1}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-24 pb-24">
            <h2 className="font-display text-2xl sm:text-3xl">Questions, answered plainly</h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {FAQ.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="font-display text-base sm:text-lg">{f.q}</dt>
                  <dd className="mt-2 max-w-3xl leading-relaxed text-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
