import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/Site';

export default function NotFound() {
  return (
    <div className="relative">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col items-start px-5 pt-16 pb-32">
        <p className="font-display text-6xl">404</p>
        <p className="mt-4 max-w-md text-muted">
          This page doesn’t exist — but the compressor does, and it’s one click away.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-lime px-7 py-3 font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Open the compressor
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
