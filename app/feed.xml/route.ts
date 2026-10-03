import { ARTICLES } from '@/lib/blog';
import { SITE_NAME, absoluteUrl, canonicalUrl, ogImageUrl } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * RSS feed for the blog.
 *
 * The three articles are the only pages on this site written to be read rather
 * than used, and they were the only ones with no way to subscribe to them.
 * `waveform` has carried a feed since its blog existed; this is the same idea,
 * generated from `ARTICLES` rather than written by hand so it cannot drift from
 * what is published.
 *
 * Dates are emitted in RFC 822, which is what RSS 2.0 requires — an ISO date
 * here is the classic reason a reader shows an item as undated.
 *
 * The feed's own address uses `absoluteUrl`, not `canonicalUrl`: the latter
 * appends the trailing slash this site uses for pages, and `/feed.xml/` is not
 * where the file lives.
 */
const FEED_URL = absoluteUrl('/feed.xml');

const CHANNEL_TITLE = `${SITE_NAME}: notes on making video smaller`;
const CHANNEL_DESCRIPTION =
  'Short, factual pieces about how video compression actually works: the math of ' +
  'size targets, WebCodecs in the browser, and the real upload limits of 2026.';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function xml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** RFC 822, at 09:00 UTC — the articles carry a date, not a time of day. */
function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T09:00:00Z`).toUTCString();
}

export function GET(): Response {
  const newest = ARTICLES.reduce(
    (latest, article) => {
      const date = article.dateModified ?? article.datePublished;
      return date > latest ? date : latest;
    },
    ARTICLES[0]?.datePublished ?? '2026-10-01',
  );

  const items = [...ARTICLES]
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
    .map((article) => {
      const url = canonicalUrl(`/blog/${article.slug}/`);
      return [
        '    <item>',
        `      <title>${xml(article.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(article.datePublished)}</pubDate>`,
        `      <description>${xml(article.description)}</description>`,
        `      <enclosure url="${ogImageUrl()}" type="image/png" />`,
        '    </item>',
      ].join('\n');
    });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${xml(CHANNEL_TITLE)}</title>`,
    `    <link>${canonicalUrl('/blog/')}</link>`,
    `    <description>${xml(CHANNEL_DESCRIPTION)}</description>`,
    '    <language>en</language>',
    `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>`,
    `    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
