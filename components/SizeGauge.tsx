'use client';

import { formatBytes } from '@/lib/format';

/**
 * The limit line — the site's one structural idea, here in its functional form.
 * A horizontal rail scaled so the limit sits at ~62% of the width; the file's
 * size fills the rail and either overflows the line (coral) or fits (lime).
 */
export function SizeGauge({
  limitBytes,
  valueBytes,
  label,
  pulsing = false,
}: {
  limitBytes: number;
  valueBytes: number;
  label?: string;
  pulsing?: boolean;
}) {
  // The limit sits at a fixed fraction of the rail; everything scales off it.
  const LIMIT_AT = 0.62;
  const scale = (bytes: number) => Math.min(1, (bytes / limitBytes) * LIMIT_AT);
  const fits = valueBytes <= limitBytes;
  const width = `${scale(valueBytes) * 100}%`;

  return (
    <div aria-hidden="true">
      <div className="rail">
        <div
          className={`rail-fill ${pulsing ? 'animate-pulse-soft' : ''}`}
          style={{
            width,
            backgroundColor: fits ? 'var(--color-lime)' : 'var(--color-over)',
          }}
        />
        <div className="rail-limit" style={{ left: `${LIMIT_AT * 100}%` }} />
      </div>
      <div className="relative mt-2 h-5 text-xs text-faint">
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap font-mono"
          style={{ left: `${LIMIT_AT * 100}%` }}
        >
          {label ?? `limit · ${formatBytes(limitBytes)}`}
        </span>
      </div>
    </div>
  );
}
