const MB = 1024 * 1024;

/** "47.3 MB", "812 KB" — binary units, like file managers show. */
export function formatBytes(bytes: number): string {
  if (bytes >= MB) {
    const mb = bytes / MB;
    return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes)} B`;
}

/** Split value and unit so the UI can style them separately. */
export function formatBytesParts(bytes: number): { value: string; unit: string } {
  const s = formatBytes(bytes);
  const i = s.indexOf(' ');
  return { value: s.slice(0, i), unit: s.slice(i + 1) };
}

export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function mbToBytes(mb: number): number {
  return mb * MB;
}

export { MB };
