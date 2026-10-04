import Link from 'next/link';
import { LANDING_PAGES } from '@/lib/content';

// Sister tools, same maker and same promise: free, no account, nothing leaves
// the browser. External links, so they use <a> rather than next/link.
const SISTER_TOOLS = [
  { href: 'https://www.graphmint.app', label: 'Graphmint: make charts online' },
  { href: 'https://www.onlinecull.com', label: 'OnlineCull: cull photos in your browser' },
  { href: 'https://www.papercv.app', label: 'PaperCV: free resume builder' },
  { href: 'https://www.music-waveform.com', label: 'Waveform: audio visualizer' },
  // The two French-language tools. Labelled in English with the language named,
  // so a reader here knows what they are getting before they click.
  { href: 'https://www.simulateurepargne.app', label: 'Simulateur d’épargne: French savings simulator' },
  { href: 'https://www.kiturgence.app', label: 'Kit Urgence: French emergency-kit planner' },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
      <Link href="/" className="font-display text-lg tracking-tight">
        SQUEEZE<span className="text-lime">VID</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm text-muted">
        <Link href="/compress-video-for-discord/" className="hidden transition-colors hover:text-fg sm:block">
          Discord
        </Link>
        <Link href="/compress-video-for-email/" className="hidden transition-colors hover:text-fg sm:block">
          Email
        </Link>
        <Link href="/blog/" className="transition-colors hover:text-fg">
          Blog
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg">
              SQUEEZE<span className="text-lime">VID</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-faint">
              Video compression that runs entirely in your browser. No upload, no account, no
              watermark. Your files never leave your device.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Compress for</p>
            <ul className="mt-3 space-y-2 text-sm text-faint">
              {LANDING_PAGES.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}/`} className="transition-colors hover:text-fg">
                    {p.footerLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">More</p>
            <ul className="mt-3 space-y-2 text-sm text-faint">
              <li>
                <Link href="/blog/" className="transition-colors hover:text-fg">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy/" className="transition-colors hover:text-fg">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms/" className="transition-colors hover:text-fg">
                  Terms
                </Link>
              </li>
              <li>
                <a href="mailto:damienyvert.dev@gmail.com" className="transition-colors hover:text-fg">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">More free tools</p>
            <ul className="mt-3 space-y-2 text-sm text-faint">
              {SISTER_TOOLS.map((t) => (
                <li key={t.href}>
                  <a href={t.href} rel="noopener" className="transition-colors hover:text-fg">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-12 text-xs text-faint">
          © {new Date().getFullYear()} SqueezeVid. Free to use, for any purpose.
        </p>
      </div>
    </footer>
  );
}
