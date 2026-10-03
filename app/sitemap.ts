import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/lib/blog';
import { LANDING_PAGES } from '@/lib/content';
import { CONTENT_REVIEWED_ON, canonicalUrl } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * Sitemap.
 *
 * `lastModified` is `CONTENT_REVIEWED_ON`, not the build clock. The nuance is
 * the whole file: `new Date()` announced that every page had changed on every
 * push, including the pushes that didn't touch a line of copy, and a sitemap
 * that cries wolf ends up with its `lastmod` ignored — so the day a page
 * really does change, the signal no longer carries.
 *
 * Articles are the exception, and already were: they carry their own
 * publication date, which is a fact about the article rather than about the
 * site, plus a revision date when one exists.
 *
 * `changeFrequency` and `priority` are deliberately gone: Google has confirmed
 * it reads neither, and the only thing they did here was go stale.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_REVIEWED_ON;

  return [
    { url: canonicalUrl('/'), lastModified },
    ...LANDING_PAGES.map((p) => ({ url: canonicalUrl(`/${p.slug}`), lastModified })),
    { url: canonicalUrl('/blog'), lastModified },
    ...ARTICLES.map((a) => ({
      url: canonicalUrl(`/blog/${a.slug}`),
      lastModified: a.dateModified ?? a.datePublished,
    })),
    { url: canonicalUrl('/privacy'), lastModified },
    { url: canonicalUrl('/terms'), lastModified },
  ];
}
