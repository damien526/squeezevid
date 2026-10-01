/**
 * Blog articles. Written against the real behavior of the engine — every claim
 * here is something the code actually does or a verifiable platform fact,
 * dated when it can change.
 */

export type Article = {
  slug: string;
  title: string;
  description: string;
  datePublished: string; // ISO
  minutes: number;
  sections: { h2?: string; paras: string[] }[];
};

export const ARTICLES: Article[] = [
  {
    slug: 'why-in-browser-video-compression-is-fast',
    title: 'Why in-browser video compression beats uploading to the cloud',
    description:
      'The math of upload time, what WebCodecs actually is, and why a browser tab with access to your hardware encoder outruns a server farm for this job.',
    datePublished: '2026-10-01',
    minutes: 6,
    sections: [
      {
        paras: [
          'There is something absurd about the standard way to shrink a video online: your file is too big to upload somewhere, so you… upload it somewhere. A 1.5 GB screen recording crawls up your home connection for ten minutes, waits in a server queue, gets compressed, and comes back down. The compression itself was never the slow part.',
          'Undercap takes the other path: the video never moves. Your browser reads the file from disk, your computer’s own hardware encoder re-encodes it, and the result lands in your downloads folder. This article is about why that is not just more private but usually much faster — and what made it possible only recently.',
        ],
      },
      {
        h2: 'The upload tax',
        paras: [
          'Home connections are asymmetric: upload bandwidth is typically a fifth to a tenth of download. On a common 20 Mbit/s uplink, a 1.5 GB file takes ten minutes to upload — before any work starts. The cloud compressor then has to do the same decode-encode work your machine could do, and send the result back.',
          'Local processing deletes that entire tax. The only I/O is reading from your own disk, at hundreds of megabytes per second. For large files, the race is over before it starts.',
        ],
      },
      {
        h2: 'WebCodecs: the browser grew a media engine',
        paras: [
          'For most of the web’s history, browser JavaScript could not touch video frames efficiently; tools that tried shipped ffmpeg compiled to WebAssembly. That works, but it runs the codec in software, single-threaded by default, inside a sandbox with memory limits — often slower than real-time, and prone to falling over on big files.',
          'WebCodecs, shipped in Chromium in 2021 and in Firefox in 2024, changed the deal: it hands web pages the same hardware video encoders and decoders that native apps use — the dedicated silicon in your CPU or GPU that encodes H.264 without breaking a sweat. Undercap is built on it (via the excellent Mediabunny library). On an ordinary laptop, 1080p commonly encodes at several times real-time.',
          'That is the quiet story here: “in your browser” stopped meaning “a toy version of the real thing”. The browser version now uses the same encoder silicon as desktop software.',
        ],
      },
      {
        h2: 'Privacy as a side effect of architecture',
        paras: [
          'Cloud tools answer “what happens to my video?” with a privacy policy. A local tool answers with architecture: there is no server to retain, scan, or leak your file, because the file never leaves. For screen recordings full of names and dashboards, or family videos, that difference is not cosmetic.',
          'It also makes the economics of “free” honest. Cloud compressors burn real bandwidth and CPU per file, which is why they meter you — three free exports, watermarks, upsells at every corner. When your machine does the work, serving one more user costs the site effectively nothing, and free can just mean free.',
        ],
      },
      {
        h2: 'What the cloud is still better at',
        paras: [
          'Fairness requires the list: a server can run slower, better codecs (two-pass AV1 at crawl speed) for the absolute best quality-per-byte; a phone with a weak chip may encode slower than a beefy server; and a browser cannot batch a hundred files unattended overnight. If you need those, a desktop tool like HandBrake or a paid cloud service is the right call.',
          'But for the everyday case — this clip must get under that limit, now — the shortest path runs through your own hardware.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-hit-an-exact-video-file-size',
    title: 'How to compress a video to an exact file size',
    description:
      'File size is bitrate × duration — everything else is detail. The actual math Undercap runs: budgets, safety margins, the resolution ladder, and the verify-and-retry pass.',
    datePublished: '2026-10-01',
    minutes: 7,
    sections: [
      {
        paras: [
          'Most video tools offer a quality slider and wish you luck. But upload limits are not qualities — they are numbers. “Under 20 MB” is a spec, and hitting a spec takes arithmetic, not vibes. Here is the arithmetic, exactly as Undercap runs it.',
        ],
      },
      {
        h2: 'Size is bitrate × duration',
        paras: [
          'A video file is essentially a stream of bits flowing at some rate for some time, so its size is simply bitrate multiplied by duration. A 20 MB target for a 60-second clip means the whole file may flow at about 2.8 Mbit/s. That single division is the heart of every size-targeted encode.',
          'It also explains the harsh truth about long videos: the same 20 MB across 20 minutes is only ~140 kbit/s — not enough for watchable 1080p, no matter how clever the encoder. Duration, not the tool, decides what a target can look like.',
        ],
      },
      {
        h2: 'Subtract before you spend',
        paras: [
          'The video track does not get the whole budget. The container (MP4 boxes, sample tables) costs real bytes, and the audio track flows at its own rate — a typical 128 kbit/s AAC track eats about 1 MB per minute, which at small targets is serious money.',
          'So the planner works like an accountant: take the target, hold back ~7% for container overhead and encoder imprecision, subtract the audio (kept as-is when it is cheap, re-encoded at 96 or 64 kbit/s when it is not, with the option to drop it entirely), and hand the video encoder what remains. If what remains is below the floor where H.264 produces anything watchable, Undercap refuses with an honest message instead of delivering sludge.',
        ],
      },
      {
        h2: 'The resolution ladder',
        paras: [
          'Encoders have a thin red line measured in bits per pixel per frame. Give 1080p60 only 500 kbit/s — about 0.004 bits per pixel — and you get smearing and blocking. The fix is counterintuitive but reliable: shrink the picture. The same 500 kbit/s at 540p carries four times the bits per pixel, and a sharp 540p beats a mushy 1080p on every screen.',
          'Undercap automates the trade with a ladder — 2160, 1440, 1080, 720, 540, 480, 360, 240 — stepping down until the budget per pixel crosses a sanity threshold (and capping frame rate at 60, or 30 in emergencies). The result panel tells you which rung it chose and why.',
        ],
      },
      {
        h2: 'Trust, but verify',
        paras: [
          'Encoders treat a requested bitrate as a strong suggestion, not a contract — real output lands a few percent off in either direction. For a hard limit, “a few percent over” means rejection. So after encoding, Undercap weighs the actual file. Under the limit: done. Over: it re-encodes with the bitrate scaled down by the overshoot, which in practice settles the matter in one retry.',
          'That verification step is the difference between “compressed near 20 MB” and a download button that only ever hands you a file that actually fits.',
        ],
      },
      {
        h2: 'One trap: email limits lie',
        paras: [
          'Gmail says 25 MB, and will reject your 20 MB attachment anyway. Email encodes attachments in base64 — 4 characters per 3 bytes, a 33% markup — and the limit applies after encoding. The real ceiling for the file is roughly limit ÷ 1.37. That is why Undercap’s Email preset targets 18 MB, not 25.',
        ],
      },
    ],
  },
  {
    slug: 'video-upload-limits-2026',
    title: 'Video upload size limits in 2026: Discord, Gmail, and everywhere else',
    description:
      'The current numbers, their history, and the encoding fine print — Discord’s move to 20 MB, what Gmail’s 25 MB really fits, and the 10 MB forms that never die.',
    datePublished: '2026-10-01',
    minutes: 6,
    sections: [
      {
        paras: [
          'Upload limits change more often than the blog posts about them. Half the articles ranking for “Discord file size limit” in late 2026 still say 25 MB — a number from 2023 that has been wrong twice since. Here is the current map, with dates, so you can tell when this page itself ages.',
        ],
      },
      {
        h2: 'Discord: 20 MB free, finally',
        paras: [
          'Discord’s free upload cap has been a moving target: 8 MB for years, raised to 25 MB in April 2023, cut back to 10 MB in September 2024, and raised again to 20 MB in August 2026 — the current number. Nitro Basic lifts it to 50 MB and full Nitro to 1 GB. Some boosted servers raise the ceiling for their members, but 20 MB is the only number you can count on in every server.',
          'Two details matter. Discord checks size before upload — you cannot sneak a large file in. And while it recompresses images, it never compresses video for you; an oversized clip is simply refused. Hence the eternal query “compress video for Discord”.',
        ],
      },
      {
        h2: 'Email: the 25 MB that means 18',
        paras: [
          'Gmail allows 25 MB per message, Outlook.com 20 MB — measured on the encoded message, not your file. Attachments travel base64-encoded at a 33% size markup, so the practical ceiling for a video file is about 18 MB on Gmail and 14 MB on Outlook.com, minus a little for the message itself.',
          'Corporate mail is stricter: 10 MB total-message limits remain common on Exchange setups. If a video absolutely must land in a work inbox, 10 MB is the cautious target. Over the limit, Gmail silently converts your attachment to a Drive link — with permissions, expiry, and friction the recipient will notice.',
        ],
      },
      {
        h2: 'The quiet 10 and 25 MB caps everywhere else',
        paras: [
          'Beyond the famous platforms lies a vast mid-internet of upload forms with small, hard caps: helpdesk tickets, CMS media libraries, job portals, LMS assignment boxes, bug trackers. 10 MB and 25 MB are the recurring numbers, with 8 MB surviving in older webhooks and forum software — Discord’s original limit outliving its origin.',
          'These forms rarely explain themselves; they just reject the file. The playbook is always the same: find the number, compress to just under it, done. That is literally all Undercap does — pick the number, and it handles the just-under part, locally, with a verified result.',
        ],
      },
      {
        h2: 'A note on checking these numbers',
        paras: [
          'Every figure above is current as of October 2026 and phrased with its date on purpose. When you read this later, Discord may have moved again — their support article “File Attachments FAQ” is the authoritative source, and this site’s presets get updated when the platforms move.',
        ],
      },
    ],
  },
];

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
