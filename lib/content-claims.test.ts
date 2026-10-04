/**
 * Every quality figure the landing pages publish, held to the code that
 * produces it.
 *
 * WHY THIS FILE EXISTS. The five numeric target pages carried figures that were
 * wrong — not slightly, and every one of them in the tool's favour. The 50 MB
 * page advertised "~2.2 Mbit/s: clean 1080p" at five minutes, where the planner
 * really produces 1.17 Mbit/s at 960×540. The 25 MB page promised "good 720p"
 * at five minutes, where it produces 640×360. Six claims across three pages
 * overstated the output. Nothing caught it because the project had no tests at
 * all.
 *
 * WHY THE FIGURES ARE A TABLE AND NOT SENTENCES. A first attempt at a guard
 * searched the copy for each figure — `expect(copy).toContain('960×540')` — and
 * that is far weaker than it looks. A page legitimately names the same
 * resolution at two different lengths, so moving one of them to the wrong
 * duration leaves the other to satisfy the search. Mutating "five at 960×540"
 * into "five at 1280×720" passed the entire suite. Parsing the prose properly
 * meant guessing at English and produced false pairings off bare numerals
 * ("64 kbit/s" read as 64 minutes).
 *
 * So the figures moved into `ladder` on each page, structured, and the prose
 * now explains them without restating any. A table can be checked row by row,
 * and that is what happens below: every published row is regenerated from
 * `makePlan` and compared. `prose states no bare figures` then stops the
 * numbers from creeping back into the sentences, where nothing can check them.
 */

import { describe, expect, it } from 'vitest';

import { LANDING_PAGES, type LandingPage } from './content';
import { makePlan } from './plan';

const MB = 1024 * 1024;

/** The source every published row is quoted for. */
function reference(durationSeconds: number, width = 1920, height = 1080, videoBitrate = 20_000_000) {
  return {
    duration: durationSeconds,
    width,
    height,
    frameRate: 30,
    videoCodec: 'avc',
    videoBitrate,
    audioCodec: 'aac',
    audioBitrate: 128_000,
    container: 'mp4',
  } as never;
}

/** All prose on a page: intro, section bodies and headings, FAQ both halves. */
function proseOf(page: LandingPage): string {
  return [
    ...page.intro,
    ...page.sections.flatMap((s) => [s.heading, ...s.body]),
    ...page.faq.flatMap((f) => [f.q, f.a]),
  ].join('\n');
}

/** Target size in MB, taken from the slug so the test can't disagree with it. */
function targetMb(slug: string): number {
  const m = /^compress-video-to-(\d+)mb$/.exec(slug);
  if (!m) throw new Error(`${slug} is not a numeric target page`);
  return Number(m[1]);
}

const NUMERIC = LANDING_PAGES.filter((p) => /^compress-video-to-\d+mb$/.test(p.slug));

describe('the numeric target pages', () => {
  it('are the five this suite expects', () => {
    expect(NUMERIC.map((p) => p.slug)).toEqual([
      'compress-video-to-8mb',
      'compress-video-to-10mb',
      'compress-video-to-25mb',
      'compress-video-to-50mb',
      'compress-video-to-100mb',
    ]);
  });

  it.each(NUMERIC.map((p) => [p.slug, p] as const))('%s declares a ladder and a ceiling', (_s, page) => {
    expect(page.ladder?.length ?? 0).toBeGreaterThanOrEqual(4);
    expect(page.ceiling).toBeDefined();
  });
});

/* -------------------------------------------------------------------------- */
/*                      Every published row, regenerated                      */
/* -------------------------------------------------------------------------- */

describe.each(NUMERIC.map((p) => [p.slug, p] as const))('%s ladder', (slug, page) => {
  const mb = targetMb(slug);

  it.each((page.ladder ?? []).map((row) => ({ ...row })))(
    '$minutes min → $resolution at $mbits Mbit/s',
    ({ minutes, resolution, mbits }) => {
      const plan = makePlan(reference(minutes * 60), mb * MB, {});
      const long = Math.max(plan.width, plan.height);
      const short = Math.min(plan.width, plan.height);
      expect(`${long}×${short}`).toBe(resolution);
      // Published to 2 dp, so compare the published string to the same rounding.
      expect((plan.videoBitrate / 1e6).toFixed(2)).toBe(mbits);
    },
  );

  it('rows are ordered by length and never step the resolution back up', () => {
    const rows = page.ladder ?? [];
    const minutes = rows.map((r) => r.minutes);
    expect(minutes).toEqual([...minutes].sort((a, b) => a - b));

    const pixels = rows.map((r) => {
      const [w, h] = r.resolution.split('×').map(Number);
      return w * h;
    });
    expect(pixels).toEqual([...pixels].sort((a, b) => b - a));
  });
});

/* -------------------------------------------------------------------------- */
/*                            Published ceilings                              */
/* -------------------------------------------------------------------------- */

describe('duration ceilings', () => {
  /**
   * Longest duration the planner still accepts, to the minute.
   *
   * Probed rather than derived: the ceiling falls out of the interaction
   * between the audio rule, `MIN_VIDEO_BITRATE` and the resolution ladder, and
   * re-deriving that here would just be a second implementation to keep in
   * step with the first.
   */
  function ceilingMinutes(mb: number, muteAudio: boolean): number {
    let last = 0;
    for (let s = 60; s <= 7200; s += 15) {
      try {
        makePlan(reference(s), mb * MB, { muteAudio });
        last = s;
      } catch {
        break;
      }
    }
    return Math.floor(last / 60);
  }

  it.each(NUMERIC.map((p) => [p.slug, p] as const))('%s states a true ceiling', (slug, page) => {
    const mb = targetMb(slug);
    expect(page.ceiling!.withAudio).toBe(ceilingMinutes(mb, false));
    expect(page.ceiling!.muted).toBe(ceilingMinutes(mb, true));
  });
});

/* -------------------------------------------------------------------------- */
/*                   The prose must not restate the figures                   */
/* -------------------------------------------------------------------------- */

describe('prose states no bare figures', () => {
  /**
   * The regression guard. Resolutions and Mbit/s readings belong in `ladder`,
   * where they are checked; a figure written into a sentence is a figure
   * nothing verifies, which is how the original six errors shipped.
   *
   * Scoped to the numeric pages. The Discord and email pages quote bitrates in
   * prose too, but those are illustrative arithmetic about a platform limit
   * ("20 MB over 60 seconds allows about 2.6 Mbit/s") rather than claims about
   * what the planner will hand you, and they are correct — verified in
   * `platform arithmetic` below.
   */
  /**
   * The distinction the guard enforces is INPUT versus OUTPUT.
   *
   * A figure describing the source — the reference soundtrack at 128 kbit/s, an
   * iPhone recording at 50 Mbit/s — is a fact about the file you bring, fixed
   * and independently checkable, and it belongs in the prose where it explains
   * something. A figure describing what comes out is a claim about `makePlan`,
   * and those live in `ladder` where each one is regenerated and compared.
   *
   * So the permitted figures are enumerated rather than pattern-matched: a new
   * output figure written into a sentence fails here, and adding it to the
   * allow-list is a deliberate act that has to be justified next to these.
   */
  const SOURCE_FIGURES = [
    '128 kbit/s', // the reference soundtrack, stated in the table caption
    '50 Mbit/s', // a 4K iPhone recording, on the 50 MB page
  ];

  const OUTPUT_RESOLUTIONS_ALLOWED = [
    // 4K source figures: they describe a different source than the ladder's, so
    // they cannot live in it. Both are checked under `4K phone source`.
    '3840×2160',
    '2560×1440',
  ];

  it.each(NUMERIC.map((p) => [p.slug, p] as const))('%s', (_slug, page) => {
    let prose = proseOf(page);
    for (const allowed of SOURCE_FIGURES) prose = prose.split(allowed).join('«source»');

    const resolutions = prose.match(/\d{3,4}×\d{3,4}/g) ?? [];
    expect(resolutions.filter((r) => !OUTPUT_RESOLUTIONS_ALLOWED.includes(r))).toEqual([]);
    expect(prose).not.toMatch(/\d+(\.\d+)?\s*Mbit\/s/);
    expect(prose).not.toMatch(/\d+\s*kbit\/s/);
  });

  it('the allow-list is not quietly unused', () => {
    const all = NUMERIC.map(proseOf).join('\n');
    for (const figure of SOURCE_FIGURES) expect(all).toContain(figure);
  });
});

/* -------------------------------------------------------------------------- */
/*                 Figures that are arithmetic, not planner output            */
/* -------------------------------------------------------------------------- */

describe('platform arithmetic on the Discord and email pages', () => {
  const bitrate = (mb: number, seconds: number) => (mb * 8) / seconds;

  it('20 MB over 60 s really is about 2.6 Mbit/s', () => {
    expect(bitrate(20, 60)).toBeCloseTo(2.67, 1);
  });

  it('20 MB over 10 min really is about 260 kbit/s', () => {
    expect(bitrate(20, 600) * 1000).toBeCloseTo(267, 0);
  });

  it('base64 inflation makes Gmail’s 25 MB about 18 MB of file', () => {
    // 4 characters per 3 bytes, so divide by 4/3, then leave headroom.
    expect(25 / (4 / 3)).toBeCloseTo(18.75, 2);
  });
});

/**
 * The audio-share reasoning behind the "Remove audio" advice. The pages state
 * these in words ("about an eighth of the budget", "about half by five"), so
 * the test pins the arithmetic and leaves the phrasing alone.
 */
describe('audio share of the budget', () => {
  const SAFETY = 0.93; // plan.ts
  const share = (mb: number, minutes: number) =>
    (128_000 * minutes * 60) / (mb * MB * 8 * SAFETY);

  it('is about an eighth of 8 MB at one minute', () => {
    expect(share(8, 1)).toBeCloseTo(0.125, 2);
  });

  it('is well over half of 8 MB at five minutes', () => {
    expect(share(8, 5)).toBeGreaterThan(0.5);
  });

  it('is about a tenth of 10 MB at one minute, and about half at five', () => {
    expect(share(10, 1)).toBeCloseTo(0.1, 2);
    expect(share(10, 5)).toBeCloseTo(0.49, 2);
  });
});

/** The 4K phone-footage claims on the 50 MB and 100 MB pages. */
describe('4K phone source', () => {
  const fourK = (minutes: number) => reference(minutes * 60, 3840, 2160, 50_000_000);
  const prose = (slug: string) => proseOf(LANDING_PAGES.find((p) => p.slug === slug)!);

  it('50 MB keeps 2560×1440 for a one-minute 4K clip', () => {
    const plan = makePlan(fourK(1), 50 * MB, {});
    expect(`${Math.max(plan.width, plan.height)}×${Math.min(plan.width, plan.height)}`).toBe('2560×1440');
    expect(prose('compress-video-to-50mb')).toContain('2560×1440');
  });

  it('100 MB keeps the full 3840×2160 for a one-minute 4K clip', () => {
    const plan = makePlan(fourK(1), 100 * MB, {});
    expect(`${Math.max(plan.width, plan.height)}×${Math.min(plan.width, plan.height)}`).toBe('3840×2160');
    expect(plan.notes.join(' ')).not.toContain('Downscaled');
    expect(prose('compress-video-to-100mb')).toContain('3840×2160');
  });

  it('a minute of 4K at 50 Mbit/s really does weigh over 300 MB', () => {
    expect((50_000_000 * 60) / 8 / MB).toBeGreaterThan(300);
  });
});

/* -------------------------------------------------------------------------- */
/*                               Page substance                               */
/* -------------------------------------------------------------------------- */

/**
 * The five numeric pages were the thinnest on the site — one section and two
 * FAQ entries each, where the Discord and email pages carried two and three.
 * Thin is not a crime, but these are the highest-intent commercial queries the
 * site targets, and they were the least served of any page here.
 */
describe('numeric target pages carry their weight', () => {
  it.each(NUMERIC.map((p) => [p.slug, p] as const))('%s has two sections and three FAQs', (_s, page) => {
    expect(page.sections.length).toBeGreaterThanOrEqual(2);
    expect(page.faq.length).toBeGreaterThanOrEqual(3);
  });

  it.each(NUMERIC.map((p) => [p.slug, p] as const))('%s is not thin', (_s, page) => {
    expect(proseOf(page).split(/\s+/).length).toBeGreaterThanOrEqual(400);
  });
});

/** Metadata limits, for every landing page rather than just the numeric ones. */
describe('every landing page', () => {
  it.each(LANDING_PAGES.map((p) => [p.slug, p] as const))('%s has usable metadata', (_s, page) => {
    // The layout appends " · SqueezeVid" to the social title but the <title>
    // ships `absolute`, so 60 is the budget that matters here.
    expect(page.title.length).toBeLessThanOrEqual(60);
    expect(page.metaDescription.length).toBeGreaterThanOrEqual(110);
    expect(page.metaDescription.length).toBeLessThanOrEqual(160);
    expect(page.h1.trim()).not.toBe('');
  });

  it('has unique titles and descriptions', () => {
    expect(new Set(LANDING_PAGES.map((p) => p.title)).size).toBe(LANDING_PAGES.length);
    expect(new Set(LANDING_PAGES.map((p) => p.metaDescription)).size).toBe(LANDING_PAGES.length);
  });
});
