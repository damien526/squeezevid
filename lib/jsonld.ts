/**
 * Structured data for the site.
 *
 * ⚠ THE RULE THIS FILE EXISTS FOR — JSON-LD is read one page at a time. An
 * `@id` declared elsewhere does not exist: a page that writes
 * `publisher: { '@id': '…/#org' }` without declaring the `#org` node in the
 * same document produces a dangling reference, which engines drop in silence.
 * The `#website` / `#org` / `#person` base is therefore REPEATED ON EVERY
 * PAGE — that is what `siteGraph()` is for. Never "factor it out" to one page.
 *
 * What this replaced: the home page carried an anonymous `WebApplication` plus
 * an `FAQPage`, the ten landing pages carried an `FAQPage` and nothing else,
 * and the articles carried an `Article` with no image and no `dateModified`.
 * Nothing tied the pages of the site into a single entity.
 *
 * `@id` NAMING CONVENTION:
 *   · global entities → fragment on the root     `/#website`, `/#org`, `/#person`
 *   · per-page nodes  → fragment on the page URL `/compress-video-to-8mb/#page`
 */
import type { Article } from './blog';
import type { LandingPage } from './content';
import {
  CONTENT_REVIEWED_ON,
  PUBLISHER_EMAIL,
  PUBLISHER_LINKEDIN,
  PUBLISHER_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  canonicalUrl,
  ogImageUrl,
} from './site';

export const WEBSITE_ID = canonicalUrl('/') + '#website';
export const ORG_ID = canonicalUrl('/') + '#org';
export const PERSON_ID = canonicalUrl('/') + '#person';
/** One application, one identifier, whichever page describes it. */
export const APP_ID = canonicalUrl('/') + '#app';
export const BLOG_ID = canonicalUrl('/blog') + '#blog';

/** The page that names the publisher, as the law requires it to. */
const PUBLISHER_PAGE = canonicalUrl('/terms');

type Node = Record<string, unknown>;

const ref = (id: string) => ({ '@id': id });

const breadcrumbId = (url: string) => `${url}#breadcrumb`;

/**
 * The site, its publisher, and the person behind it. Three identical nodes on
 * every page: this is what lets an engine resolve the brand as one stable
 * entity rather than as a pile of unrelated pages.
 *
 * `sameAs` is declared on `Person` only, and carries one address: the
 * operator's LinkedIn profile, which exists. `Organization` has none — the
 * site has no company page, and a personal profile is not one. An invented
 * `sameAs` points at nothing and damages the entity instead of strengthening it.
 */
export function siteGraph(): Node[] {
  return [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: canonicalUrl('/'),
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: ref(ORG_ID),
    },
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: canonicalUrl('/'),
      email: PUBLISHER_EMAIL,
      // Reciprocal of `Person.worksFor` below: both directions are declared,
      // or the link only holds one way.
      founder: ref(PERSON_ID),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/icon-512.png'),
        width: 512,
        height: 512,
      },
    },
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: PUBLISHER_NAME,
      // /terms is the page that names the publisher: the only verifiable
      // address for this entity on the site.
      url: PUBLISHER_PAGE,
      email: PUBLISHER_EMAIL,
      sameAs: [PUBLISHER_LINKEDIN],
      worksFor: ref(ORG_ID),
    },
  ];
}

/**
 * What the tool does, for an engine. The list is capabilities that are real
 * and checkable in the app; it is not a sales pitch.
 */
const FEATURE_LIST = [
  'Compress a video to an exact target size, not a quality slider',
  'Presets for Discord, email, and common upload caps from 8 MB to 100 MB',
  'Convert MOV (HEVC) to universally playable MP4',
  'Hardware encoding through WebCodecs, several times real-time at 1080p',
  'Runs entirely in the browser: the file is never uploaded',
  'No account, no queue, no watermark',
];

/** The application itself — ONE node for the whole site, with a stable `@id`. */
export function webApplication(): Node {
  return {
    '@type': 'WebApplication',
    '@id': APP_ID,
    name: SITE_NAME,
    url: canonicalUrl('/'),
    description: SITE_DESCRIPTION,
    screenshot: ogImageUrl(),
    image: ogImageUrl(),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript and the WebCodecs API',
    inLanguage: 'en',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: FEATURE_LIST,
    isPartOf: ref(WEBSITE_ID),
    publisher: ref(ORG_ID),
    author: ref(PERSON_ID),
  };
}

/**
 * The document itself — one node per page, and only one.
 *
 * The type stays `WebPage` even on pages that carry an FAQ. The two nodes are
 * deliberately separate: `FAQPage` is the markup Google stopped displaying in
 * 2023 and may stop reading, `WebPage` carries the durable signals. Housing
 * them together would make the second depend on the first.
 */
export function webPage({
  url,
  name,
  description,
  mainEntity,
  hasBreadcrumb,
}: {
  url: string;
  name: string;
  description: string;
  mainEntity?: string;
  hasBreadcrumb?: boolean;
}): Node {
  return {
    '@type': 'WebPage',
    '@id': `${url}#page`,
    url,
    name,
    description,
    inLanguage: 'en',
    dateModified: CONTENT_REVIEWED_ON,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: ogImageUrl(),
      width: 1200,
      height: 630,
    },
    isPartOf: ref(WEBSITE_ID),
    ...(mainEntity ? { mainEntity: ref(mainEntity) } : {}),
    ...(hasBreadcrumb ? { breadcrumb: ref(breadcrumbId(url)) } : {}),
    publisher: ref(ORG_ID),
  };
}

/**
 * The visible FAQ, word for word.
 *
 * The text must match what the reader sees exactly — that is the validity
 * condition Google sets, and the reason the FAQ is a plain `<dl>` rather than
 * an accordion.
 */
export function faqPage(url: string, items: readonly { q: string; a: string }[]): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    inLanguage: 'en',
    isPartOf: ref(WEBSITE_ID),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumb(url: string, trail: { name: string; url: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId(url),
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: step.url,
    })),
  };
}

export const HOME_CRUMB = { name: SITE_NAME, url: canonicalUrl('/') };
export const BLOG_CRUMB = { name: 'Blog', url: canonicalUrl('/blog') };

/* -------------------------------------------------------------------------- */
/*                          One graph per page shape                          */
/* -------------------------------------------------------------------------- */

/** Home: the base, the document, the application. No breadcrumb at the root. */
export function homeGraph(faq: readonly { q: string; a: string }[]): Node[] {
  const url = canonicalUrl('/');
  return [
    ...siteGraph(),
    webPage({ url, name: SITE_NAME, description: SITE_DESCRIPTION, mainEntity: APP_ID }),
    webApplication(),
    faqPage(url, faq),
  ];
}

/** A landing page: document, FAQ, application, breadcrumb, and the base. */
export function landingGraph(page: LandingPage): Node[] {
  const url = canonicalUrl(`/${page.slug}`);
  return [
    ...siteGraph(),
    webPage({
      url,
      name: page.h1,
      description: page.metaDescription,
      mainEntity: APP_ID,
      hasBreadcrumb: true,
    }),
    webApplication(),
    faqPage(url, page.faq),
    breadcrumb(url, [HOME_CRUMB, { name: page.footerLabel, url }]),
  ];
}

/** The blog index: a `Blog` node that the articles declare themselves part of. */
export function blogIndexGraph(articles: readonly Article[], description: string): Node[] {
  const url = canonicalUrl('/blog');
  return [
    ...siteGraph(),
    webPage({ url, name: 'Blog', description, hasBreadcrumb: true, mainEntity: BLOG_ID }),
    {
      '@type': 'Blog',
      '@id': BLOG_ID,
      url,
      name: `${SITE_NAME} notes`,
      description,
      inLanguage: 'en',
      isPartOf: ref(WEBSITE_ID),
      publisher: ref(ORG_ID),
      blogPost: articles.map((a) => ({
        '@type': 'BlogPosting',
        '@id': `${canonicalUrl(`/blog/${a.slug}`)}#article`,
        headline: a.title,
        url: canonicalUrl(`/blog/${a.slug}`),
        datePublished: a.datePublished,
      })),
    },
    breadcrumb(url, [HOME_CRUMB, BLOG_CRUMB]),
  ];
}

/**
 * An article.
 *
 * `BlogPosting` rather than the bare `Article` it used to be: the pages live
 * under a blog, and the more specific type is the one that matches.
 *
 * Three fields the previous markup lacked, each for a concrete reason:
 *   · `image` — without it the page is not eligible for an article rich
 *     result at all, whatever else is correct;
 *   · `dateModified` — without it an engine cannot tell an update from a
 *     reprint;
 *   · a `Person` author — an `Organization` author is accepted, but a named
 *     person carries the authorship signal an organisation cannot.
 */
export function articleGraph(article: Article): Node[] {
  const url = canonicalUrl(`/blog/${article.slug}`);
  return [
    ...siteGraph(),
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: article.title,
      description: article.description,
      url,
      datePublished: article.datePublished,
      // The article's own revision date when it has one, the site's content
      // review date otherwise: never the build clock.
      dateModified: article.dateModified ?? article.datePublished,
      image: {
        '@type': 'ImageObject',
        url: ogImageUrl(),
        width: 1200,
        height: 630,
      },
      wordCount: article.sections.reduce(
        (total, section) =>
          total + section.paras.reduce((n, p) => n + p.split(/\s+/).filter(Boolean).length, 0),
        0,
      ),
      timeRequired: `PT${article.minutes}M`,
      inLanguage: 'en',
      author: ref(PERSON_ID),
      publisher: ref(ORG_ID),
      isPartOf: ref(BLOG_ID),
      mainEntityOfPage: `${url}#page`,
    },
    {
      '@type': 'Blog',
      '@id': BLOG_ID,
      url: canonicalUrl('/blog'),
      name: `${SITE_NAME} notes`,
      inLanguage: 'en',
      isPartOf: ref(WEBSITE_ID),
      publisher: ref(ORG_ID),
    },
    webPage({ url, name: article.title, description: article.description, hasBreadcrumb: true }),
    breadcrumb(url, [HOME_CRUMB, BLOG_CRUMB, { name: article.title, url }]),
  ];
}

/** An ordinary page outside the catalogue — privacy and terms. */
export function contentPageGraph({
  url,
  name,
  description,
  crumb,
}: {
  url: string;
  name: string;
  description: string;
  crumb: string;
}): Node[] {
  return [
    ...siteGraph(),
    webPage({ url, name, description, hasBreadcrumb: true }),
    breadcrumb(url, [HOME_CRUMB, { name: crumb, url }]),
  ];
}

/**
 * Wraps a page's nodes in a single `@graph` and returns the string to drop
 * into the `<script>`. One `@context`, one block: nodes can cite each other by
 * `@id` with nothing dangling.
 */
export function jsonLdGraph(nodes: Node[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(
    /</g,
    '\\u003c',
  );
}
