/**
 * The WebCodecs feature check, on its own, with no imports.
 *
 * This used to live in `lib/compress.ts` next to the engine it guards, which
 * read better and cost 138 KB: the mount-time `import('@/lib/compress')` that
 * only wanted these four lines pulled Mediabunny (540 KB raw) into the first
 * load of every page on the site, article pages included. The encoder now
 * arrives when a file does — see `analyze` and `compress` in `Tool.tsx`.
 *
 * Keep this file dependency-free. One import here puts the regression back.
 */
export function isSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'VideoEncoder' in window &&
    'VideoDecoder' in window
  );
}
