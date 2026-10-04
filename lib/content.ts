/**
 * Landing page content. Every page is real, dated, honest copy: no invented
 * numbers, no keyword soup. Facts about platform limits are current as of
 * October 2026 and say so in the text.
 */

export type LandingPage = {
  slug: string;
  footerLabel: string;
  /** <title> without the site suffix. */
  title: string;
  metaDescription: string;
  h1: string;
  /** Preset id passed to the tool, or null for the generic pages. */
  targetId: string | null;
  intro: string[];
  sections: { heading: string; body: string[] }[];
  faq: { q: string; a: string }[];
  /**
   * What this target actually produces, duration by duration.
   *
   * STRUCTURED, NOT PROSE, AND THAT IS THE POINT. These figures used to be
   * written into the section copy by hand, and three of them were simply
   * wrong — the 50 MB page advertised "~2.2 Mbit/s: clean 1080p" at five
   * minutes where the planner really produces 1.17 Mbit/s at 960×540, and the
   * 25 MB page promised "good 720p" where it produces 640×360. Every error
   * flattered the tool.
   *
   * A sentence cannot be checked against `makePlan` without parsing English,
   * which is how the first attempt at a guard failed: searching the copy for
   * "960×540" passes even when the figure has been moved to the wrong
   * duration, because the page mentions that resolution twice for different
   * lengths. A table can be checked row by row, and
   * `lib/content-claims.test.ts` does exactly that against the real planner.
   *
   * So the numbers live here and are rendered as a table; the prose explains
   * what they mean and states no figures of its own. Rows are quoted for a
   * 1080p 30 fps source with a 128 kbit/s AAC track — an ordinary screen
   * recording or phone export — which the table's caption says out loud.
   */
  ladder?: { minutes: number; resolution: string; mbits: string }[];
  /**
   * Longest clip this target accepts, in whole minutes, with audio and without.
   * Also verified against the planner rather than estimated.
   */
  ceiling?: { withAudio: number; muted: number };
  /**
   * Blog articles worth reading after this page, by slug.
   *
   * These exist because the three articles had exactly ONE inbound internal
   * link each — from /blog/ — while every other page on the site had fifteen.
   * A landing page answers "how do I get under 20 MB"; the article behind it
   * answers "why is the limit 20 MB". Linking the second from the first is
   * both the useful thing for a reader and the only thing that gets the
   * article crawled as something other than a leaf.
   */
  relatedArticles?: string[];
};

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'compress-video-for-discord',
    footerLabel: 'Discord (20 MB)',
    title: 'Compress a Video for Discord: Free, No Upload, No Watermark',
    metaDescription:
      'Fit any video under Discord’s 20 MB upload limit, right in your browser. Free, no watermark, no account. The file never leaves your device.',
    h1: 'Compress a video for Discord',
    targetId: 'discord',
    relatedArticles: ['video-upload-limits-2026', 'how-to-hit-an-exact-video-file-size'],
    intro: [
      'Discord’s free upload limit is 20 MB per file (raised from 10 MB in August 2026). Anything bigger gets rejected before it even starts uploading, and unlike images, Discord never compresses video for you.',
      'SqueezeVid fixes that locally: drop your clip, and it re-encodes to land just under 20 MB using your computer’s own hardware encoder. Nothing is uploaded to any server, there is no queue, no watermark, and no account.',
    ],
    sections: [
      {
        heading: 'Discord’s limits, as of late 2026',
        body: [
          'Free accounts can attach files up to 20 MB. Nitro Basic raises that to 50 MB, and full Nitro to 1 GB. Some boosted servers raise the ceiling for their members, but 20 MB is the number you can count on everywhere.',
          'If you’re sending to a channel where you don’t know everyone’s plan, targeting 20 MB is the safe move, which is why it’s the default preset here. Nitro Basic users can switch to the 50 MB preset for noticeably better quality.',
        ],
      },
      {
        heading: 'How the clip stays watchable at 20 MB',
        body: [
          'A size limit is really a bitrate budget: 20 MB spread over a 60-second clip allows about 2.6 Mbit/s, plenty for sharp 1080p. Spread over 10 minutes it’s only ~260 kbit/s, which would turn 1080p into mush. When the budget per pixel gets too thin, SqueezeVid automatically steps the resolution down (1080p → 720p → 540p…) so you get a smaller-but-sharp picture instead of a big blurry one.',
          'Game clips with lots of motion are the hardest case. If a long clip comes out rough, trim it to the moment that matters before compressing: duration is the single biggest lever.',
        ],
      },
    ],
    faq: [
      {
        q: 'Why does Discord say my file is too big?',
        a: 'Free Discord accounts can attach files up to 20 MB (as of August 2026). Discord checks the file size before uploading and rejects anything larger; it never compresses video for you.',
      },
      {
        q: 'Will the compressed video have a watermark?',
        a: 'No. SqueezeVid adds nothing to your video: no watermark, no outro, no metadata branding. It only re-encodes the picture to fit the size you asked for.',
      },
      {
        q: 'Does my clip get uploaded to a server to be compressed?',
        a: 'No. Compression runs entirely in your browser using WebCodecs and your machine’s hardware encoder. The file never leaves your device, which is also why there’s no waiting in an upload queue.',
      },
    ],
  },
  {
    slug: 'compress-video-for-email',
    footerLabel: 'Email (18 MB)',
    title: 'Compress a Video for Email: Fit Under Gmail’s 25 MB Limit',
    metaDescription:
      'Gmail’s 25 MB limit really means ~18 MB per attachment, because of base64 encoding. Compress your video to fit, free and entirely in your browser.',
    h1: 'Compress a video to email it',
    targetId: 'email',
    relatedArticles: ['video-upload-limits-2026', 'how-to-hit-an-exact-video-file-size'],
    intro: [
      'Gmail and most providers advertise a 25 MB limit, then reject your 22 MB video anyway. The catch: attachments are base64-encoded for transport, which inflates them by roughly 33%. The real ceiling for the file itself is about 18 MB on Gmail, and less on many corporate servers.',
      'SqueezeVid targets that real ceiling. The 18 MB Email preset produces a file that survives encoding overhead and actually arrives, instead of bouncing or silently converting into a Drive link.',
    ],
    sections: [
      {
        heading: 'Why “25 MB” rejects a 20 MB file',
        body: [
          'Email is a text protocol: binary attachments are re-written in base64, which uses 4 characters for every 3 bytes. Your 20 MB video becomes ~27 MB of encoded text, blowing through the 25 MB message limit. That’s also why the safe attachment size is limit ÷ 1.37, plus headroom for the message itself.',
          'Corporate mail servers are often stricter: 10 MB message limits are still common on Exchange. If the video is going to someone’s work address and must get through, the 10 MB preset is the cautious choice.',
        ],
      },
      {
        heading: 'Attachment vs. link',
        body: [
          'Over the limit, Gmail quietly swaps your attachment for a Google Drive link, which needs permissions, can expire, and looks like effort for the recipient. A file that fits as a plain attachment just works, forever, in every client, with no access requests. That’s usually worth a modest quality trade.',
        ],
      },
    ],
    faq: [
      {
        q: 'What is the maximum video size I can email?',
        a: 'Gmail and Outlook.com cap the whole message around 25 MB and 20 MB respectively, measured after base64 encoding inflates attachments by ~33%. In practice a video attachment should stay under ~18 MB for Gmail, and under ~14 MB for Outlook.com.',
      },
      {
        q: 'Why not just send a Google Drive or WeTransfer link?',
        a: 'Links work, but they add friction: permissions, expiry dates, a download step, and sometimes a blocked domain on corporate networks. An attachment that fits the limit opens inline in every mail client with zero setup.',
      },
      {
        q: 'Is the video uploaded anywhere while compressing?',
        a: 'No. SqueezeVid runs entirely in your browser: the file is read locally, re-encoded locally by your own hardware, and saved back to your downloads. No server ever sees it.',
      },
    ],
  },
  {
    slug: 'compress-video-to-8mb',
    ladder: [
      { minutes: 1, resolution: '960×540', mbits: '0.91' },
      { minutes: 2, resolution: '640×360', mbits: '0.46' },
      { minutes: 3, resolution: '426×240', mbits: '0.28' },
      { minutes: 5, resolution: '426×240', mbits: '0.14' },
    ],
    ceiling: { withAudio: 7, muted: 13 },
    footerLabel: '8 MB',
    title: 'Compress a Video to 8 MB: Free, In Your Browser',
    metaDescription:
      'Shrink any video under 8 MB, the classic limit of webhooks, bots, forums and older platforms. Free, no upload, no watermark, no account.',
    h1: 'Compress a video to 8 MB',
    targetId: '8mb',
    relatedArticles: ['how-to-hit-an-exact-video-file-size', 'video-upload-limits-2026'],
    intro: [
      '8 MB was Discord’s original upload limit, and it outlived Discord: countless webhooks, chat bots, forum attachments and embed systems still enforce it today. It’s the lowest common denominator of video sharing.',
      'SqueezeVid treats 8 MB as a hard budget: it measures your clip’s duration, reserves room for audio and container overhead, and spends every remaining bit on the picture, re-encoding locally, in your browser, with nothing uploaded.',
    ],
    sections: [
      {
        heading: 'What fits in 8 MB, honestly',
        body: [
          'Eight megabytes is the tightest target on this site, and the arithmetic is blunt. The table above is not an estimate: it is what the planner decides for an ordinary 1080p clip, working out the bitrate budget first and then picking the largest resolution that budget can keep sharp. A single minute already costs you half the frame.',
          'Past the ceiling above it stops accepting the job and says why, rather than handing back a file you would not send. Trimming buys you more than any setting: duration is the one lever that moves the result further than every other combined.',
        ],
      },
      {
        heading: 'At this size, the soundtrack competes with the picture',
        body: [
          'At eight megabytes the audio track is not a rounding error. An ordinary 128 kbit/s AAC track takes about an eighth of the budget over one minute and well over half of it by five — past that, most of your file is sound. SqueezeVid re-encodes the track smaller as soon as copying it would crowd out the video, and the plan tells you when it did.',
          'So if the audio is not carrying the clip — gameplay, a screen recording, anything scored with music you don’t need — “Remove audio” in Options is the highest-value switch on this page. It hands the whole audio share back to the picture, which at this target is often the difference between 360p and 540p.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can any video be compressed to 8 MB?',
        a: 'Quality depends almost entirely on duration — see the table above for what each length actually yields. Under a minute a 1080p source still looks clean; a few minutes in, the picture is small. Past the ceiling SqueezeVid refuses the target outright and explains why, instead of producing garbage.',
      },
      {
        q: 'Why is my compressed file slightly under 8 MB rather than exactly 8 MB?',
        a: 'SqueezeVid plans against 93% of the target on purpose, so it aims about 7% low. Encoders don’t hit a requested bitrate exactly, and a file at 8.01 MB is rejected just as firmly as one at 80 MB. If a pass still overshoots, the tool re-runs tighter automatically.',
      },
      {
        q: 'What is the longest clip that fits in 8 MB?',
        a: 'The ceiling is listed with the table above: a few minutes with sound, roughly double with the audio removed. Beyond that SqueezeVid declines the target rather than encode something unwatchable. If your clip is longer, trim it to the part that matters — at this size a short clip at half-frame reads far better than a long one at a quarter.',
      },
    ],
  },
  {
    slug: 'compress-video-to-10mb',
    ladder: [
      { minutes: 1, resolution: '960×540', mbits: '1.17' },
      { minutes: 2, resolution: '640×360', mbits: '0.52' },
      { minutes: 3, resolution: '640×360', mbits: '0.37' },
      { minutes: 5, resolution: '426×240', mbits: '0.20' },
    ],
    ceiling: { withAudio: 9, muted: 16 },
    footerLabel: '10 MB',
    title: 'Compress a Video to 10 MB Online: No Upload, No Watermark',
    metaDescription:
      'Get any video under 10 MB, a common cap on upload forms, ticket systems and strict mail servers. Free and entirely local to your browser.',
    h1: 'Compress a video to 10 MB',
    targetId: '10mb',
    relatedArticles: ['video-upload-limits-2026', 'how-to-hit-an-exact-video-file-size'],
    intro: [
      '10 MB is the quiet default of the business internet: upload forms, helpdesk tickets, CMS media libraries and plenty of corporate mail servers stop there. It was also Discord’s free limit from 2024 until August 2026, which is why so many tools still talk about it.',
      'SqueezeVid compresses to a hair under 10 MB in your browser: no upload to a compression server (ironic, when the problem is an upload limit), no watermark, no account.',
    ],
    sections: [
      {
        heading: 'Duration decides quality',
        body: [
          'A size target is really a bitrate budget, and ten megabytes is a small one. The table above is the planner’s own output for an ordinary 1080p clip; it runs that calculation before encoding anything and tells you what it decided, so the result is never a surprise.',
          'Past the ceiling the target is declined rather than fudged. Two extra megabytes sound trivial next to the 8 MB preset, but they buy real headroom at the same resolution — the budget scales with duration, not with how badly you want it to fit.',
        ],
      },
      {
        heading: 'Why 10 MB is a worse deal than it looks',
        body: [
          'Ten megabytes is an awkward number: large enough that people expect it to be comfortable, small enough that a 128 kbit/s soundtrack still takes a tenth of it over one minute and about half by five. Audio eating half the file is not a theoretical risk here, it is what happens at five minutes if nothing intervenes, which is why the planner shrinks the track first.',
          'If the form you are filling in accepts a little more, the 25 MB preset is a genuine step up rather than a marginal one: a one-minute clip keeps its full frame there instead of losing half of it. It is worth checking the limit before assuming it.',
        ],
      },
    ],
    faq: [
      {
        q: 'The form I’m using says “max 10 MB”. Will the output really fit?',
        a: 'Yes: SqueezeVid verifies the final file size after encoding, and if a pass lands over the target it automatically re-encodes tighter. The download button only appears with a file that actually fits.',
      },
      {
        q: 'Does compressing to 10 MB change my video’s format?',
        a: 'The output is always an MP4 with H.264 video and AAC audio, the most widely compatible combination there is. It plays everywhere: browsers, phones, Slack, Teams, email previews.',
      },
      {
        q: 'Will a 1080p video still be 1080p after compressing to 10 MB?',
        a: 'No, and that is deliberate. Ten megabytes does not carry enough bitrate for 1080p at any useful length, so the planner steps down — see the table above for how far, at each length. A smaller sharp picture beats a full-size smeared one, and the plan states the resolution it chose before you download.',
      },
    ],
  },
  {
    slug: 'compress-video-to-25mb',
    ladder: [
      { minutes: 1, resolution: '1920×1080', mbits: '3.12' },
      { minutes: 2, resolution: '1280×720', mbits: '1.50' },
      { minutes: 3, resolution: '960×540', mbits: '0.96' },
      { minutes: 5, resolution: '640×360', mbits: '0.52' },
      { minutes: 10, resolution: '426×240', mbits: '0.26' },
    ],
    ceiling: { withAudio: 22, muted: 40 },
    footerLabel: '25 MB',
    title: 'Compress a Video to 25 MB: Free, In Your Browser',
    metaDescription:
      'Fit any video under 25 MB for upload forms, LMS platforms and messaging apps, compressed locally in your browser, free and watermark-free.',
    h1: 'Compress a video to 25 MB',
    targetId: '25mb',
    relatedArticles: ['video-upload-limits-2026', 'how-to-hit-an-exact-video-file-size'],
    intro: [
      '25 MB is the advertised ceiling of Gmail messages, a frequent cap on learning platforms, application portals and ticket systems, and Discord’s former Nitro-free limit from the 2023–2024 era.',
      'SqueezeVid hits the target locally: your machine’s hardware encoder does the work, your file never leaves your device, and the result carries no watermark.',
    ],
    sections: [
      {
        heading: 'One caveat: email is not really 25 MB',
        body: [
          'If this video is going out as an email attachment, 25 MB is a trap: mail encoding inflates attachments by about a third, so Gmail’s 25 MB message limit really fits an ~18 MB file. Use the Email preset for that. For upload forms and platforms that check the file itself, 25 MB means 25 MB and this page’s preset is the right one.',
        ],
      },
      {
        heading: 'What 25 MB actually buys, minute by minute',
        body: [
          'The first minute is genuinely comfortable: a 1080p source keeps every pixel. The fifth is not, and no tool can make it so — spread that thin, there is barely any video bitrate left once the soundtrack has taken its share. The table above shows exactly where the steps fall.',
          'This is the smallest target where a one-minute clip still keeps its full resolution, which makes it the right default for anything short: a screen recording of a bug, a demo, a clip for a ticket. Past a few minutes the 50 and 100 MB presets stop being luxuries — they are the difference between half a frame and a whole one.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is 25 MB enough for good 1080p quality?',
        a: 'For about the first minute, yes — a 1080p source keeps its full frame. After that the planner steps down, and the table above says by how much at each length. Sharp 1080p needs more bitrate than 25 MB can supply past a minute or so, and a downscaled picture that stays crisp beats a full-size one starved of bits.',
      },
      {
        q: 'What happens if my video is already under 25 MB?',
        a: 'The size gauge will show your file already sitting under the limit line. Compressing it further is optional; you might still want to, to leave headroom or to convert a MOV/WebM/MKV into a universally playable MP4.',
      },
      {
        q: 'How long a video can 25 MB hold?',
        a: 'The ceiling is listed with the table above, and roughly doubles with the audio removed — but at that length the picture is a quarter-frame, which is only worth it if the content is legible that small, like a slide deck. Past those limits SqueezeVid declines the target instead of guessing.',
      },
    ],
  },
  {
    slug: 'compress-video-to-50mb',
    ladder: [
      { minutes: 1, resolution: '1920×1080', mbits: '6.37' },
      { minutes: 2, resolution: '1920×1080', mbits: '3.12' },
      { minutes: 3, resolution: '1280×720', mbits: '2.04' },
      { minutes: 5, resolution: '960×540', mbits: '1.17' },
      { minutes: 10, resolution: '640×360', mbits: '0.52' },
      { minutes: 20, resolution: '426×240', mbits: '0.26' },
    ],
    ceiling: { withAudio: 45, muted: 81 },
    footerLabel: '50 MB',
    title: 'Compress a Video to 50 MB: Free, No Upload',
    metaDescription:
      'Compress any video under 50 MB (Discord Nitro Basic’s limit and a common portal cap) locally in your browser, free, no watermark, no account.',
    h1: 'Compress a video to 50 MB',
    targetId: '50mb',
    relatedArticles: ['how-to-hit-an-exact-video-file-size', 'video-upload-limits-2026'],
    intro: [
      '50 MB is Discord’s Nitro Basic limit (as of late 2026) and a common ceiling on job-application portals, LMS uploads and document-management systems.',
      'It is also the first target here that is genuinely roomy: a 1080p source keeps every pixel it started with for the first couple of minutes, and SqueezeVid just rebalances the bitrate, re-encoding locally with your hardware encoder in well under real-time.',
    ],
    sections: [
      {
        heading: 'What 50 MB buys you',
        body: [
          'Two minutes is the point where full 1080p still survives intact, which is a useful thing to know before you record: trimming to that length keeps the whole frame for free. The table above shows where each step down happens after that.',
          'The hard ceiling is listed with the table, and roughly doubles with the audio removed — though the picture at that length is a quarter-frame. The planner decides per file and reports what it changed, so you see the resolution before you download rather than after.',
        ],
      },
      {
        heading: 'Phone footage is the easy case',
        body: [
          'Phones record at enormous safety bitrates — a minute of 4K iPhone video at 50 Mbit/s weighs well over 300 MB — and almost none of it is doing visible work. At a 50 MB target that same minute still comes out at 2560×1440, well beyond what any phone or laptop screen resolves, having shed roughly four fifths of its weight.',
          'This is why phone clips often look untouched after compression while screen recordings of dense text do not. Bitrate is spent on change between frames: a handheld shot of a face has far less of it than a terminal scrolling code. If your source is a screen recording, assume the figures above rather than the generous phone case.',
        ],
      },
    ],
    faq: [
      {
        q: 'Will I lose quality compressing a phone video to 50 MB?',
        a: 'Usually less than you’d expect. Phones record at very high safety bitrates; a minute of 4K iPhone footage can weigh 350+ MB. At a 50 MB target that minute still comes out at 2560×1440 — sharper than any phone or laptop screen shows — having lost about four fifths of its file size.',
      },
      {
        q: 'How long does compressing to 50 MB take?',
        a: 'SqueezeVid uses your computer’s hardware encoder through WebCodecs, so it typically runs several times faster than real-time; a 5-minute clip generally takes well under a minute on a modern laptop. There is no upload and no queue, which is where cloud tools lose most of their time.',
      },
      {
        q: 'Does a 50 MB video stay in 1080p?',
        a: 'For the first couple of minutes, yes; after that the planner steps down, as the table above sets out. If keeping 1080p matters more than keeping the whole clip, trim it; otherwise the 100 MB preset holds full resolution noticeably longer.',
      },
    ],
  },
  {
    slug: 'compress-video-to-100mb',
    ladder: [
      { minutes: 1, resolution: '1920×1080', mbits: '12.87' },
      { minutes: 3, resolution: '1920×1080', mbits: '4.21' },
      { minutes: 5, resolution: '1280×720', mbits: '2.47' },
      { minutes: 10, resolution: '960×540', mbits: '1.17' },
      { minutes: 20, resolution: '640×360', mbits: '0.52' },
      { minutes: 60, resolution: '426×240', mbits: '0.15' },
    ],
    ceiling: { withAudio: 90, muted: 120 },
    footerLabel: '100 MB',
    title: 'Compress a Video to 100 MB: Free, In Your Browser',
    metaDescription:
      'Bring any video under 100 MB for uploads, shared drives and messaging, compressed locally in your browser with no upload and no watermark.',
    h1: 'Compress a video to 100 MB',
    targetId: '100mb',
    relatedArticles: ['how-to-hit-an-exact-video-file-size', 'why-in-browser-video-compression-is-fast'],
    intro: [
      '100 MB comfortably clears most upload forms, shared-drive policies and messaging apps, while being a fraction of what cameras and screen recorders actually produce.',
      'It is the most generous preset here: a 1080p clip keeps full resolution for the first few minutes, and a 4K phone clip under a minute keeps all 3840×2160. Everything runs locally, with your hardware encoder and no upload step at all.',
    ],
    sections: [
      {
        heading: 'The economics of 100 MB',
        body: [
          'Three minutes is the practical edge of full resolution here, and ten minutes still gives you a perfectly legible half-frame — the table above has the exact steps. That makes this the preset for anything you would actually sit and watch.',
          'The ceiling runs to well over an hour, and to two hours with the audio removed. So an hour-long screen recording does fit under 100 MB — but it arrives at a quarter-frame, which is fine for a talking head and useless for anything with small text on screen. Length and legibility are the trade, and the planner shows you which side of it you are on before you download.',
        ],
      },
      {
        heading: 'When 100 MB is the wrong target',
        body: [
          'Two cases. If the file is already modest — a 40 MB phone clip, say — this preset has nothing to do: the planner refuses to inflate a light source to fill a budget, caps the bitrate near the source’s own quality and tells you it did. You would be re-encoding for no gain, and a re-encode is always a small quality loss.',
          'And if what you actually need is an upload that fits a specific limit, pick that limit instead. Compressing to 100 MB and hoping is how you discover a 50 MB cap the slow way; the presets exist so the target is the constraint rather than a guess.',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I compress a very large file, say 2 GB, in the browser?',
        a: 'Yes. SqueezeVid streams the file from disk rather than loading it into memory at once, so multi-gigabyte inputs work. Only the compressed output is held in memory, and at a 100 MB target that’s trivial.',
      },
      {
        q: 'Why use this instead of a desktop app like HandBrake?',
        a: 'HandBrake is excellent, if you want to install software and pick codecs, profiles and rate-control modes yourself. SqueezeVid answers a narrower question: “make this file fit under X” with zero installation and zero settings, using the same hardware encoder a native app would.',
      },
      {
        q: 'Will a 4K video stay in 4K at 100 MB?',
        a: 'For about the first minute, yes — a 4K phone clip keeps all 3840×2160. Past that the planner steps down, because 4K needs more bitrate than this budget can hold for long. If 4K matters more than length, trim first; if length matters more, let it downscale.',
      },
    ],
  },
  {
    slug: 'convert-mov-to-mp4',
    footerLabel: 'MOV → MP4',
    title: 'Convert MOV to MP4 Online: Free, No Upload, In Your Browser',
    metaDescription:
      'Turn iPhone MOV (HEVC) videos into universally playable MP4 files, converted locally in your browser, free, with an optional size target.',
    h1: 'Convert MOV to MP4',
    targetId: null,
    relatedArticles: ['why-in-browser-video-compression-is-fast', 'how-to-hit-an-exact-video-file-size'],
    intro: [
      'iPhones record MOV files, often with HEVC video inside, and half the internet refuses to play them: Windows machines without codec packs, older players, many upload forms, most embeds.',
      'SqueezeVid reads the MOV locally in your browser, decodes it with your machine’s hardware, and writes a standard MP4 with H.264 video and AAC audio, the one combination that plays everywhere. Pick a size target while you’re at it, or a generous one just to convert.',
    ],
    sections: [
      {
        heading: 'Why MOV files cause trouble',
        body: [
          'MOV is Apple’s QuickTime container, and since 2017 iPhones default to HEVC (H.265) compression inside it. HEVC is efficient but patent-encumbered, so plenty of software either can’t decode it or won’t. MP4 with H.264 is over twenty years old, royalty-settled, and supported by effectively every device and website on earth.',
          'Your browser’s hardware decoder handles the HEVC side (every modern computer and phone decodes HEVC in silicon), and the hardware encoder writes H.264 back out, so conversion runs at several times real-time, locally.',
        ],
      },
      {
        heading: 'Converting without shrinking',
        body: [
          'If you only need compatibility, not compression, pick a target comfortably above your file’s current size; the planner will spend the full budget and preserve quality. If the file also needs to fit a limit, you get conversion and compression in the same pass.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does converting MOV to MP4 lose quality?',
        a: 'Conversion here re-encodes the video, so there is a generational loss, but at a healthy bitrate it is not visible. Give the tool a generous size target and the output will be visually indistinguishable from the source while playing on everything.',
      },
      {
        q: 'Is my MOV uploaded to a conversion server?',
        a: 'No. The file is read, decoded, re-encoded and packaged entirely inside your browser using WebCodecs. It never leaves your device, which also makes this faster than any upload-convert-download cycle.',
      },
      {
        q: 'My MOV is HEVC/H.265. Will it work?',
        a: 'Yes on virtually all modern machines: browsers delegate HEVC decoding to your hardware, and Macs, iPhones and every recent Windows laptop decode it in silicon. If a particular machine truly cannot decode the codec, SqueezeVid says so plainly instead of failing silently.',
      },
    ],
  },
  {
    slug: 'reduce-video-file-size',
    footerLabel: 'Any size (guide)',
    title: 'Reduce Video File Size Online: Free, Private, No Upload',
    metaDescription:
      'Shrink any video to any size you need, locally in your browser. How bitrate, resolution and duration decide file size, and a tool that does the math for you.',
    h1: 'Reduce a video’s file size',
    targetId: null,
    relatedArticles: ['how-to-hit-an-exact-video-file-size', 'why-in-browser-video-compression-is-fast'],
    intro: [
      'Every video’s size is just bitrate × duration. Reducing it means lowering the bitrate, and doing that well means knowing how low you can go before the picture falls apart, and when to trade resolution instead.',
      'SqueezeVid does that math for you, backwards: you say what the file must weigh, it works out the best bitrate and resolution that fit, then encodes locally in your browser. No upload, no queue, no watermark, no account.',
    ],
    sections: [
      {
        heading: 'The three levers',
        body: [
          'Bitrate is the direct lever: halve it, halve the file. H.264 tolerates a surprising amount of squeezing before artifacts show, especially on static content like screen recordings.',
          'Resolution is the rescue lever: when the bitrate budget per pixel gets too thin, a 720p image encoded properly beats a 1080p image starved of bits. SqueezeVid switches rungs automatically when the budget demands it.',
          'Duration is the lever nobody wants to hear about: trimming a clip to the part that matters does more than any encoder setting. If a target seems impossible, cut first, compress second.',
        ],
      },
      {
        heading: 'Common targets',
        body: [
          'Sharing on Discord? The free limit is 20 MB. Emailing? Gmail’s 25 MB really means ~18 MB after encoding overhead. Posting through a form or helpdesk? 10 MB and 25 MB caps are everywhere. SqueezeVid ships presets for each: pick one, or type any number of megabytes.',
        ],
      },
    ],
    faq: [
      {
        q: 'How do I reduce a video’s file size without losing quality?',
        a: 'Strictly, any re-encode trades some quality, but most videos carry far more bitrate than their content needs, so the loss is often invisible. The key is matching the bitrate to the content and stepping resolution down when the budget is tight, which is exactly the planning SqueezeVid automates.',
      },
      {
        q: 'What’s the best format for small video files?',
        a: 'For compatibility, MP4 with H.264 video and AAC audio: it plays on effectively every device and platform. Newer codecs like AV1 compress better but still hit playback and upload-form compatibility issues; when the goal is “send this anywhere”, H.264 remains the right answer.',
      },
      {
        q: 'Why trust a browser tool with no upload over a cloud compressor?',
        a: 'Two reasons: time and privacy. Uploading a 1 GB file to a cloud compressor takes minutes before work even starts; local compression starts instantly and uses your own hardware encoder. And a file that never leaves your device can’t be retained, scanned or leaked by anyone’s server.',
      },
    ],
  },
];

export function landingBySlug(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
