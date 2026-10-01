import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Undercap never sees your videos — they are processed entirely in your browser. Here is exactly what is and is not collected.',
  alternates: { canonical: `${SITE_URL}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <div className="relative">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24">
        <h1 className="pt-8 font-display text-3xl sm:text-4xl">Privacy</h1>
        <p className="mt-3 font-mono text-xs text-faint">Last updated: October 1, 2026</p>

        <section className="mt-10 space-y-4 leading-relaxed text-muted">
          <h2 className="font-display text-xl text-fg">Your videos</h2>
          <p>
            Undercap never receives your videos. Files are opened, analyzed, re-encoded and saved
            entirely inside your browser using WebCodecs. There is no upload endpoint on this site —
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
            duration in seconds, and codec name — never its name or content), that a compression
            started, succeeded (how long it took, input and output size in MB), failed (an error
            category), or was canceled, and that a download happened.
          </p>
          <p>
            These events contain no identifiers, no filenames, and nothing that could reconstruct
            what a video showed. They exist to answer questions like “do exports fail more often on
            HEVC input?” — not to profile anyone.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Cookies and accounts</h2>
          <p>
            There are no accounts, no logins, and no cookies set by us. Your settings live in the
            page while it is open and disappear when you close it.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Questions</h2>
          <p>
            This page is deliberately short because the architecture does the heavy lifting: a tool
            that cannot see your files has very little privacy left to explain.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
