/** Single source of truth for the site's identity. Update SITE_URL when a custom domain lands. */
export const SITE_URL = 'https://www.squeezevid.app';
export const SITE_NAME = 'SqueezeVid';
export const SITE_TAGLINE = 'Fit any video under any size limit';

/**
 * The meta description for the home page.
 *
 * Kept under 160 characters on purpose: Google truncates around there, and the
 * previous 196-character version lost "Files never leave your device" — the
 * line that answers the objection people actually have — past the cut.
 */
export const SITE_DESCRIPTION =
  'Compress any video to an exact target size, right in your browser. 20 MB for Discord, 25 MB for email, or any limit you type. No upload, no account.';

/**
 * Who operates the site.
 *
 * These values already appear in the copy: /terms names the publisher and
 * carries the contact address, as the law requires. The structured data reads
 * them from here so the two can't drift — and so the `sameAs` below points at
 * a profile that exists rather than at a plausible-looking URL.
 */
export const PUBLISHER_NAME = 'Damien Yvert';

export const PUBLISHER_EMAIL = 'damienyvert.dev@gmail.com';

/** The operator's only public profile, and so the graph's only `sameAs`. */
export const PUBLISHER_LINKEDIN = 'https://www.linkedin.com/in/damien-yvert/';

/**
 * When the content last actually changed.
 *
 * This — not the build clock — is what the sitemap's `lastmod` and the
 * markup's `dateModified` carry. A clock date claims every page changed on
 * every push, including the pushes that didn't touch a line of copy, and a
 * sitemap that cries wolf ends up with its `lastmod` ignored. Then the day a
 * page really does change, the signal no longer carries.
 *
 * ⚠ Advance this by hand, and only when copy, `lib/content.ts` or `lib/blog.ts`
 * changes. A styling tweak, a build fix or a component rename leave it alone.
 *
 * Blog articles are the exception: they carry their own `datePublished`, which
 * is a fact about the article rather than about the site, and the sitemap uses
 * that for them.
 */
export const CONTENT_REVIEWED_ON = '2026-10-03';

/** Absolute URL for an internal path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Canonical form of an internal URL. `trailingSlash: true` is on. */
export function canonicalUrl(path = '/'): string {
  const url = absoluteUrl(path);
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * URL of a page's social card.
 *
 * WHY THIS INDIRECTION — Next writes its social image WITHOUT an extension:
 * `out/opengraph-image`. Served as-is by a static host it comes back as
 * `application/octet-stream`, and the Facebook, X, LinkedIn and Slack crawlers
 * then refuse the preview. `trailingSlash: true` adds a second risk, a
 * redirect from `/opengraph-image` to `/opengraph-image/`.
 *
 * `scripts/og-png.mjs` therefore copies it to `out/og/home.png` after the
 * build: an ordinary address, with an extension, that every social crawler
 * accepts. This is the address the pages declare, and it is why `robots.ts`
 * can close `/opengraph-image` without taking the previews down with it.
 */
export function ogImageUrl(): string {
  return absoluteUrl('/og/home.png');
}

/**
 * Title for social cards.
 *
 * The `<title>` and the `og:title` do not have the same constraint. Google
 * displays the first in a fixed width and cuts whatever overflows — always the
 * end, so always the brand. A card shared in a chat app has no such width, and
 * reaches the reader with no domain in sight: there, the brand has to be
 * written. A title that already carries the site name is returned as-is.
 */
export function socialTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
}
