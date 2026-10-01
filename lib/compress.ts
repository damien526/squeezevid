/**
 * The compression engine. Wraps Mediabunny (WebCodecs) with size-targeting:
 * plan → encode → measure → tighten and retry if the result overshoots.
 *
 * Everything runs in the browser. The file never leaves the device.
 */
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  canEncodeAudio,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
} from 'mediabunny';
import { makePlan, tightenPlan, type CompressionPlan, type SourceInfo } from './plan';

export type { CompressionPlan, SourceInfo };
export { TargetTooSmallError } from './plan';

export function isSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'VideoEncoder' in window &&
    'VideoDecoder' in window
  );
}

export async function analyze(file: File): Promise<SourceInfo> {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  try {
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) {
      throw new Error('No video track found in this file.');
    }
    const audioTrack = await input.getPrimaryAudioTrack();

    const duration = await input.computeDuration();
    const frameRateMetrics = await videoTrack.computeFrameRateMetrics().catch(() => null);

    let videoBitrate = await videoTrack.getBitrate();
    if (videoBitrate === null) {
      const stats = await videoTrack.computePacketStats(200).catch(() => null);
      videoBitrate = stats?.averageBitrate ?? null;
    }

    let audioBitrate: number | null = null;
    let audioCodec: string | null = null;
    if (audioTrack) {
      audioCodec = (await audioTrack.getCodec()) ?? 'unknown';
      audioBitrate = await audioTrack.getBitrate();
      if (audioBitrate === null) {
        const stats = await audioTrack.computePacketStats(200).catch(() => null);
        audioBitrate = stats?.averageBitrate ?? null;
      }
    }

    return {
      fileName: file.name,
      fileBytes: file.size,
      duration,
      width: await videoTrack.getDisplayWidth(),
      height: await videoTrack.getDisplayHeight(),
      frameRate: frameRateMetrics?.bestGuessFrameRate ?? null,
      videoCodec: (await videoTrack.getCodec()) ?? 'unknown',
      videoBitrate,
      audioCodec,
      audioBitrate,
      mimeType: await input.getMimeType(),
    };
  } finally {
    input.dispose();
  }
}

export type CompressProgress = {
  /** 0..1 within the current attempt. */
  progress: number;
  /** Bytes written to the output so far in the current attempt. */
  writtenBytes: number;
  /** 1-based attempt number (a retry means the first pass overshot). */
  attempt: number;
};

export type CompressResult = {
  blob: Blob;
  bytes: number;
  plan: CompressionPlan;
  attempts: number;
  elapsedMs: number;
};

export type CompressHandle = {
  promise: Promise<CompressResult>;
  cancel: () => void;
};

const MAX_ATTEMPTS = 3;

export function compress(
  file: File,
  source: SourceInfo,
  targetBytes: number,
  opts: { muteAudio?: boolean; maxHeight?: number },
  onProgress: (p: CompressProgress) => void,
): CompressHandle {
  let cancelled = false;
  let activeConversion: Conversion | null = null;

  const run = async (): Promise<CompressResult> => {
    const started = performance.now();
    const canReencodeAudio = await canEncodeAudio('aac').catch(() => false);
    let plan = makePlan(source, targetBytes, { ...opts, canReencodeAudio });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (cancelled) throw new DOMException('Cancelled', 'AbortError');

      const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
      const target = new BufferTarget();
      const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target });

      target.onwrite = (_start, end) => {
        // BufferTarget writes are monotone enough for a live byte counter.
        onProgress({ progress: -1, writtenBytes: end, attempt });
      };

      const conversion = await Conversion.init({
        input,
        output,
        video: {
          codec: 'avc',
          width: plan.width,
          height: plan.height,
          fit: 'fill', // width/height already computed at source aspect ratio
          bitrate: Math.round(plan.videoBitrate),
          frameRate: plan.frameRate,
          forceTranscode: true,
        },
        audio:
          plan.audio === 'strip'
            ? { discard: true }
            : plan.audio === 'copy'
              ? {} // Mediabunny copies when it can
              : { codec: 'aac', bitrate: plan.audio.aacBitrate, forceTranscode: true },
      });

      if (!conversion.isValid) {
        const reasons = conversion.discardedTracks.map((t) => t.reason).join(', ');
        input.dispose();
        throw new Error(
          reasons.includes('undecodable')
            ? 'This video uses a codec your browser cannot decode.'
            : `Cannot convert this file (${reasons || 'unknown reason'}).`,
        );
      }

      activeConversion = conversion;
      conversion.onProgress = (p) => {
        onProgress({ progress: p, writtenBytes: -1, attempt });
      };

      try {
        await conversion.execute();
      } catch (err) {
        input.dispose();
        if (cancelled) throw new DOMException('Cancelled', 'AbortError');
        throw err;
      } finally {
        activeConversion = null;
      }
      input.dispose();

      const buffer = target.buffer;
      if (!buffer) throw new Error('Encoding produced no output.');

      if (buffer.byteLength <= targetBytes || attempt === MAX_ATTEMPTS) {
        return {
          blob: new Blob([buffer], { type: 'video/mp4' }),
          bytes: buffer.byteLength,
          plan,
          attempts: attempt,
          elapsedMs: performance.now() - started,
        };
      }
      // Overshot: rare, but bitrate control is not exact. Tighten and retry.
      plan = tightenPlan(plan, buffer.byteLength);
    }
    throw new Error('unreachable');
  };

  return {
    promise: run(),
    cancel: () => {
      cancelled = true;
      activeConversion?.cancel().catch(() => {});
    },
  };
}
