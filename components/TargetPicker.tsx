'use client';

import { PRESETS, type Preset } from '@/lib/presets';

export type Target =
  | { kind: 'preset'; preset: Preset }
  | { kind: 'custom'; mb: number };

export function targetMb(t: Target): number {
  return t.kind === 'preset' ? t.preset.mb : t.mb;
}

export function TargetPicker({
  value,
  onChange,
  disabled,
}: {
  value: Target;
  onChange: (t: Target) => void;
  disabled?: boolean;
}) {
  const activePresetId = value.kind === 'preset' ? value.preset.id : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = p.id === activePresetId;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ kind: 'preset', preset: p })}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                active
                  ? 'border-lime bg-lime text-ink'
                  : 'border-line bg-panel text-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {p.label}
            </button>
          );
        })}
        <label
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            value.kind === 'custom'
              ? 'border-lime bg-lime text-ink'
              : 'border-line bg-panel text-muted focus-within:border-line-strong'
          } ${disabled ? 'opacity-40' : ''}`}
        >
          <span>Custom</span>
          <input
            type="number"
            min={1}
            max={2048}
            step={1}
            inputMode="numeric"
            disabled={disabled}
            value={value.kind === 'custom' ? value.mb : ''}
            placeholder="15"
            onChange={(e) => {
              const mb = Number(e.target.value);
              if (Number.isFinite(mb) && mb > 0) onChange({ kind: 'custom', mb: Math.min(mb, 2048) });
            }}
            onFocus={(e) => {
              if (value.kind !== 'custom') onChange({ kind: 'custom', mb: 15 });
              e.target.select();
            }}
            className={`w-14 bg-transparent text-right outline-none tnum ${
              value.kind === 'custom' ? 'text-ink placeholder:text-ink/50' : 'text-fg placeholder:text-faint'
            }`}
            aria-label="Custom target size in megabytes"
          />
          <span className={value.kind === 'custom' ? 'text-ink/70' : 'text-faint'}>MB</span>
        </label>
      </div>
      {value.kind === 'preset' && (
        <p className="mt-3 text-sm leading-relaxed text-muted">{value.preset.note}</p>
      )}
    </div>
  );
}
