import { track } from '@vercel/analytics';

/**
 * Funnel events, prod-only. Invisible on the free Vercel plan (pageviews only),
 * but instrumented now so they light up the day the account goes Pro.
 */
export function event(name: string, data?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV !== 'production') return;
  try {
    track(name, data);
  } catch {
    // analytics must never break the tool
  }
}
