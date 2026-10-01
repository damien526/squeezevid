import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export: `next build` produces `out/`, served as-is by Vercel.
  // Everything — demuxing, decoding, encoding, muxing — runs in the browser.
  output: 'export',

  // `next/image` needs a server to optimize on the fly.
  images: { unoptimized: true },

  // One folder per route: avoids 404s on reload with static hosting.
  trailingSlash: true,
};

export default nextConfig;
