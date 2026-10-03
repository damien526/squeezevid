'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatBytes, formatBytesParts, formatDuration, mbToBytes } from '@/lib/format';
import { presetById, PRESETS } from '@/lib/presets';
import type { CompressHandle, CompressResult, SourceInfo } from '@/lib/compress';
import { isSupported } from '@/lib/supported';
import { event } from './analytics';
import { SizeGauge } from './SizeGauge';
import { TargetPicker, targetMb, type Target } from './TargetPicker';

type Phase =
  | { name: 'idle' }
  | { name: 'unsupported' }
  | { name: 'analyzing'; fileName: string }
  | { name: 'ready'; file: File; info: SourceInfo; inlineError?: string }
  | {
      name: 'compressing';
      file: File;
      info: SourceInfo;
      progress: number;
      writtenBytes: number;
      attempt: number;
    }
  | { name: 'done'; file: File; info: SourceInfo; result: CompressResult; url: string }
  | { name: 'error'; message: string };

export function Tool({ initialTargetId }: { initialTargetId?: string }) {
  const [phase, setPhase] = useState<Phase>({ name: 'idle' });
  const [target, setTarget] = useState<Target>(() => {
    const preset = (initialTargetId && presetById(initialTargetId)) || PRESETS[0];
    return { kind: 'preset', preset };
  });
  const [muteAudio, setMuteAudio] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const [dragOver, setDragOver] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const handleRef = useRef<CompressHandle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Feature-detect WebCodecs; read the ?target= deep link from landing pages.
  // `isSupported` comes from `lib/supported`, not from `lib/compress`: the
  // engine — and the 540 KB of Mediabunny behind it — must not be downloaded
  // to answer a question about `window`.
  useEffect(() => {
    if (!isSupported()) {
      setPhase({ name: 'unsupported' });
      event('unsupported');
    }
    const raw = new URLSearchParams(window.location.search).get('target');
    if (!raw) return;
    const preset = presetById(raw);
    if (preset) setTarget({ kind: 'preset', preset });
    else {
      const mb = Number(raw);
      if (Number.isFinite(mb) && mb > 0) setTarget({ kind: 'custom', mb });
    }
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setPhase({ name: 'analyzing', fileName: file.name });
    try {
      const { analyze } = await import('@/lib/compress');
      const info = await analyze(file);
      setPhase({ name: 'ready', file, info });
      event('file_loaded', {
        mb: Math.round(file.size / 1048576),
        seconds: Math.round(info.duration),
        codec: info.videoCodec ?? 'unknown',
      });
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes('No video track')
          ? 'That file has no video track. Drop a video file (MP4, MOV, WebM, MKV…).'
          : 'Could not read this file. It may use an unsupported format. MP4, MOV, WebM and MKV work best.';
      setPhase({ name: 'error', message });
      event('load_failed', { type: file.type || 'unknown' });
    }
  }, []);

  const start = useCallback(async () => {
    if (phase.name !== 'ready') return;
    const { file, info } = phase;
    const limitBytes = mbToBytes(targetMb(target));
    const { compress, TargetTooSmallError } = await import('@/lib/compress');

    setPhase({ name: 'compressing', file, info, progress: 0, writtenBytes: 0, attempt: 1 });
    event('compress_started', { targetMb: targetMb(target) });
    const handle = (() => {
      try {
        return compress(file, info, limitBytes, { muteAudio, maxHeight }, (p) => {
          setPhase((prev) => {
            if (prev.name !== 'compressing') return prev;
            return {
              ...prev,
              progress: p.progress >= 0 ? p.progress : prev.progress,
              writtenBytes: p.writtenBytes >= 0 ? p.writtenBytes : prev.writtenBytes,
              attempt: p.attempt,
            };
          });
        });
      } catch (err) {
        if (err instanceof TargetTooSmallError) {
          setPhase({ name: 'ready', file, info, inlineError: err.message });
          event('compress_failed', { reason: 'target_too_small' });
          return null;
        }
        throw err;
      }
    })();
    if (!handle) return;
    handleRef.current = handle;

    try {
      const result = await handle.promise;
      const url = URL.createObjectURL(result.blob);
      setPhase({ name: 'done', file, info, result, url });
      event('compress_done', {
        ms: Math.round(result.elapsedMs),
        inMb: Math.round(file.size / 1048576),
        outMb: Math.round(result.bytes / 1048576),
        attempts: result.attempts,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setPhase({ name: 'ready', file, info });
        event('compress_canceled');
        return;
      }
      if (err instanceof TargetTooSmallError) {
        setPhase({ name: 'ready', file, info, inlineError: err.message });
        event('compress_failed', { reason: 'target_too_small' });
        return;
      }
      const message = err instanceof Error ? err.message : 'Compression failed.';
      setPhase({ name: 'ready', file, info, inlineError: message });
      event('compress_failed', { reason: message.slice(0, 80) });
    } finally {
      handleRef.current = null;
    }
  }, [phase, target, muteAudio, maxHeight]);

  const reset = useCallback(() => {
    if (phase.name === 'done') URL.revokeObjectURL(phase.url);
    setPhase({ name: 'idle' });
  }, [phase]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void loadFile(file);
    },
    [loadFile],
  );

  const limitBytes = mbToBytes(targetMb(target));

  if (phase.name === 'unsupported') {
    return (
      <div className="rounded-2xl border border-line bg-panel p-8 text-center">
        <p className="font-display text-xl">Your browser can’t run the encoder</p>
        <p className="mx-auto mt-3 max-w-md text-muted">
          SqueezeVid compresses video with WebCodecs, which this browser doesn’t support. It works in
          up-to-date Chrome, Edge, Firefox, Opera and Brave on desktop.
        </p>
      </div>
    );
  }

  // ---------- idle / analyzing ----------
  if (phase.name === 'idle' || phase.name === 'analyzing' || phase.name === 'error') {
    const analyzing = phase.name === 'analyzing';
    return (
      <div>
        <div
          role="button"
          tabIndex={0}
          aria-label="Choose a video file"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors sm:p-16 ${
            dragOver ? 'border-lime bg-panel-2' : 'border-line bg-panel hover:border-line-strong'
          }`}
        >
          {analyzing ? (
            <>
              <p className="font-display text-2xl animate-pulse-soft">Reading file…</p>
              <p className="mt-2 truncate text-sm text-muted">{phase.fileName}</p>
            </>
          ) : (
            <>
              <p className="font-display text-2xl sm:text-3xl">Drop a video here</p>
              <p className="mt-3 text-muted">
                or <span className="font-medium text-lime underline underline-offset-4">browse files</span>
              </p>
              <p className="mt-6 text-sm text-faint">
                MP4 · MOV · WebM · MKV. Any length, any size. Nothing is uploaded.
              </p>
            </>
          )}
        </div>
        {phase.name === 'error' && (
          <p className="mt-4 rounded-xl border border-over/30 bg-over/10 px-4 py-3 text-sm text-over" role="alert">
            {phase.message}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/*,.mkv,.mov,.mp4,.webm,.m4v"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void loadFile(file);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  // ---------- compressing ----------
  if (phase.name === 'compressing') {
    const pct = Math.round(phase.progress * 100);
    const written = formatBytesParts(phase.writtenBytes);
    return (
      <div className="rounded-2xl border border-line bg-panel p-6 sm:p-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="truncate text-sm text-muted">{phase.info.fileName}</p>
          <p className="shrink-0 font-mono text-sm text-muted tnum">
            {pct}%{phase.attempt > 1 ? ` · pass ${phase.attempt}` : ''}
          </p>
        </div>
        <p className="mt-6 font-display text-5xl sm:text-6xl tnum" aria-live="polite">
          {written.value}
          <span className="ml-2 text-2xl text-muted sm:text-3xl">{written.unit}</span>
        </p>
        <p className="mt-1 text-sm text-faint">written so far by the local hardware encoder</p>
        <div className="mt-8">
          <SizeGauge limitBytes={limitBytes} valueBytes={phase.writtenBytes} pulsing />
        </div>
        <button
          type="button"
          onClick={() => handleRef.current?.cancel()}
          className="mt-6 rounded-full border border-line px-5 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          Cancel
        </button>
      </div>
    );
  }

  // ---------- done ----------
  if (phase.name === 'done') {
    const { result, file } = phase;
    const out = formatBytesParts(result.bytes);
    const fits = result.bytes <= limitBytes;
    const savedPct = Math.max(0, Math.round((1 - result.bytes / file.size) * 100));
    const stem = file.name.replace(/\.[^.]+$/, '');
    return (
      <div className="rounded-2xl border border-line bg-panel p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              fits ? 'bg-lime text-ink' : 'bg-over text-ink'
            }`}
          >
            {fits ? `✓ fits under ${formatBytes(limitBytes)}` : 'still over the target'}
          </span>
          <span className="text-xs text-faint">
            −{savedPct}% · {(result.elapsedMs / 1000).toFixed(1)}s
            {result.attempts > 1 ? ` · ${result.attempts} passes` : ''}
          </span>
        </div>

        <p className="mt-6 font-display text-5xl sm:text-6xl tnum">
          <span className="text-muted/60 line-through decoration-over/70 decoration-4">
            {formatBytes(file.size)}
          </span>
          <span className="mx-3 text-muted">→</span>
          {out.value}
          <span className="ml-2 text-2xl text-muted sm:text-3xl">{out.unit}</span>
        </p>

        <div className="mt-8">
          <SizeGauge limitBytes={limitBytes} valueBytes={result.bytes} />
        </div>

        {result.plan.notes.length > 0 && (
          <ul className="mt-6 space-y-1 text-sm text-muted">
            {result.plan.notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        )}

        <video src={phase.url} controls playsInline className="mt-8 max-h-80 w-full rounded-xl bg-ink" />

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={phase.url}
            download={`${stem}-under-${targetMb(target)}mb.mp4`}
            onClick={() => event('download')}
            className="rounded-full bg-lime px-7 py-3 font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Download MP4
          </a>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-line px-6 py-3 text-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            Compress another
          </button>
        </div>
      </div>
    );
  }

  // ---------- ready ----------
  const { info, inlineError } = phase;
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 sm:p-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="min-w-0 truncate font-medium">{info.fileName}</p>
        <p className="font-mono text-xs text-faint">
          {info.width}×{info.height} · {formatDuration(info.duration)}
          {info.frameRate ? ` · ${Math.round(info.frameRate)} fps` : ''} ·{' '}
          {(info.videoCodec ?? 'video').toUpperCase()}
          {info.audioCodec ? ` + ${info.audioCodec.toUpperCase()}` : ' · no audio'}
        </p>
      </div>

      <p className="mt-6 font-display text-5xl sm:text-6xl tnum">
        {formatBytesParts(info.fileBytes).value}
        <span className="ml-2 text-2xl text-muted sm:text-3xl">{formatBytesParts(info.fileBytes).unit}</span>
      </p>

      <div className="mt-8">
        <SizeGauge limitBytes={limitBytes} valueBytes={info.fileBytes} />
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-muted">Make it fit under</p>
        <TargetPicker value={target} onChange={setTarget} />
      </div>

      <button
        type="button"
        onClick={() => setShowOptions((v) => !v)}
        aria-expanded={showOptions}
        className="mt-6 text-sm text-faint underline-offset-4 hover:text-muted hover:underline"
      >
        {showOptions ? 'Hide options' : 'Options'}
      </button>
      {showOptions && (
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={muteAudio}
              onChange={(e) => setMuteAudio(e.target.checked)}
              className="h-4 w-4 accent-[#d7f94c]"
            />
            Remove audio
          </label>
          <label className="flex items-center gap-2 text-muted">
            Max resolution
            <select
              value={maxHeight ?? 'auto'}
              onChange={(e) => setMaxHeight(e.target.value === 'auto' ? undefined : Number(e.target.value))}
              className="rounded-lg border border-line bg-panel-2 px-2 py-1 text-fg"
            >
              <option value="auto">Auto</option>
              <option value="1080">1080p</option>
              <option value="720">720p</option>
              <option value="480">480p</option>
            </select>
          </label>
        </div>
      )}

      {inlineError && (
        <p className="mt-6 rounded-xl border border-over/30 bg-over/10 px-4 py-3 text-sm text-over" role="alert">
          {inlineError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void start()}
          className="rounded-full bg-lime px-8 py-3 font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Compress to {targetMb(target)} MB
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-faint underline-offset-4 hover:text-muted hover:underline"
        >
          Choose a different file
        </button>
      </div>
    </div>
  );
}
