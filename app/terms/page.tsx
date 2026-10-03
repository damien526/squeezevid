import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/Site';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The terms for using SqueezeVid: free for any purpose, provided as-is, your files stay yours and stay on your device.',
  alternates: { canonical: `${SITE_URL}/terms/` },
};

export default function TermsPage() {
  return (
    <div className="relative">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24">
        <h1 className="pt-8 font-display text-3xl sm:text-4xl">Terms of Use</h1>
        <p className="mt-3 font-mono text-xs text-faint">Last updated: October 1, 2026</p>

        <section className="mt-10 space-y-4 leading-relaxed text-muted">
          <h2 className="font-display text-xl text-fg">What SqueezeVid is</h2>
          <p>
            SqueezeVid is a free tool that compresses video files entirely in your browser. It is
            operated by an independent developer; you can reach the operator at{' '}
            <a href="mailto:damienyvert.dev@gmail.com" className="text-lime underline underline-offset-4">
              damienyvert.dev@gmail.com
            </a>
            . By using the site you accept these terms.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Your files and your rights</h2>
          <p>
            Your videos are processed on your device and never transmitted to us, so you keep every
            right you have in them, and we acquire none. You are responsible for the content you
            process: only compress material you own or are allowed to use.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Free, as-is, no warranty</h2>
          <p>
            SqueezeVid is provided free of charge, “as is” and “as available”, without warranties of
            any kind, express or implied. Compression quality depends on your target, your hardware
            and your browser; always keep your original file. To the maximum extent permitted by
            law, the operator is not liable for any damages arising from the use of the site,
            including lost or corrupted files. Nothing in these terms excludes liability that cannot
            legally be excluded.
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Acceptable use</h2>
          <p>
            Do not use the site in a way that breaks the law, infringes third-party rights, or
            attempts to disrupt the service (for example by probing, scraping at scale, or
            interfering with its infrastructure). Security findings are welcome at the contact
            address above or via{' '}
            <a href="/.well-known/security.txt" className="text-lime underline underline-offset-4">
              security.txt
            </a>
            .
          </p>

          <h2 className="pt-4 font-display text-xl text-fg">Changes</h2>
          <p>
            The tool and these terms may change over time; the date above reflects the latest
            revision. Significant changes will appear on this page. For how data is handled, see the{' '}
            <Link href="/privacy/" className="text-lime underline underline-offset-4">
              privacy page
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
