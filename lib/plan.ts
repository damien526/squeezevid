/**
 * Turns "this file must end up under N bytes" into concrete encoder settings.
 *
 * The budget math: target bytes, minus a container-overhead margin, minus the
 * audio track, leaves the video bit budget. If bits-per-pixel would drop below
 * a floor that H.264 can't survive, we walk down a resolution ladder instead
 * of starving the encoder.
 */

export type SourceInfo = {
  fileName: string;
  fileBytes: number;
  duration: number; // seconds
  width: number; // display dimensions (rotation applied)
  height: number;
  frameRate: number | null;
  videoCodec: string | null;
  /** Average video bitrate in bits/s, null if unknown. */
  videoBitrate: number | null;
  audioCodec: string | null;
  /** Average audio bitrate in bits/s, null if no audio track. */
  audioBitrate: number | null;
  mimeType: string;
};

export type CompressionPlan = {
  targetBytes: number;
  videoBitrate: number; // bits/s
  width: number;
  height: number;
  frameRate: number | undefined; // undefined = keep source
  /** 'copy' = passthrough, 'aac-XX' = re-encode at XX kbps, 'strip' = no audio. */
  audio: 'copy' | 'strip' | { aacBitrate: number };
  /** Human-readable notes about what the plan decided and why. */
  notes: string[];
};

/** Fraction of the target reserved for container overhead + estimation error. */
const SAFETY = 0.93;

/** Below this bits-per-pixel-per-frame, H.264 turns to mush; downscale instead. */
const MIN_BPP = 0.045;

/** Encoder floor: below this, refuse and ask for a bigger target. */
const MIN_VIDEO_BITRATE = 80_000;

/** Resolution ladder (short-edge heights). */
const LADDER = [2160, 1440, 1080, 720, 540, 480, 360, 240];

export class TargetTooSmallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TargetTooSmallError';
  }
}

function evenRound(n: number): number {
  return Math.max(2, 2 * Math.round(n / 2));
}

export function makePlan(
  src: SourceInfo,
  targetBytes: number,
  opts: { muteAudio?: boolean; maxHeight?: number; canReencodeAudio?: boolean } = {},
): CompressionPlan {
  const canReencodeAudio = opts.canReencodeAudio ?? true;
  const notes: string[] = [];
  const duration = Math.max(src.duration, 0.1);
  const budgetBits = targetBytes * 8 * SAFETY;

  // --- Audio ---
  let audio: CompressionPlan['audio'];
  let audioBits: number;
  if (opts.muteAudio || src.audioCodec === null) {
    audio = 'strip';
    audioBits = 0;
    if (opts.muteAudio) notes.push('Audio removed as requested.');
  } else {
    const srcAudioBitrate = src.audioBitrate ?? 128_000;
    const copyBits = srcAudioBitrate * duration;
    if (src.audioCodec === 'aac' && copyBits <= budgetBits * 0.2) {
      // Cheap enough: keep the original track untouched.
      audio = 'copy';
      audioBits = copyBits;
    } else if (!canReencodeAudio) {
      // This browser has no AAC encoder (e.g. Firefox): copy if at all viable.
      if (src.audioCodec === 'aac' && copyBits <= budgetBits * 0.5) {
        audio = 'copy';
        audioBits = copyBits;
        notes.push('Audio kept as-is: this browser cannot re-encode AAC.');
      } else {
        throw new TargetTooSmallError(
          'This browser cannot re-encode the audio track, and keeping it would blow the size budget. Enable “Remove audio” in Options, or pick a larger target.',
        );
      }
    } else {
      // Audio would eat the budget; re-encode it smaller.
      const kbps = budgetBits * 0.15 >= 96_000 * duration ? 96 : 64;
      audio = { aacBitrate: kbps * 1000 };
      audioBits = kbps * 1000 * duration;
      notes.push(`Audio re-encoded at ${kbps} kbps AAC to leave room for the picture.`);
    }
    if (audioBits > budgetBits * 0.8) {
      throw new TargetTooSmallError(
        `At ${Math.round(duration)}s, the audio track alone nearly fills ${Math.round(
          targetBytes / (1024 * 1024),
        )} MB. Pick a larger target, trim the video, or remove the audio.`,
      );
    }
  }

  // --- Video budget ---
  let videoBitrate = (budgetBits - audioBits) / duration;

  // Never inflate a light source to fill the budget. H.264 needs more bits
  // than modern codecs for the same quality, hence the codec-dependent factor.
  if (src.videoBitrate) {
    const equivalence = src.videoCodec === 'avc' ? 1.05 : 1.8;
    const cap = src.videoBitrate * equivalence;
    if (cap < videoBitrate) {
      videoBitrate = Math.max(cap, MIN_VIDEO_BITRATE);
      notes.push('Bitrate capped near the source’s own quality; spending more bits wouldn’t look better.');
    }
  }
  if (videoBitrate < MIN_VIDEO_BITRATE) {
    throw new TargetTooSmallError(
      `This target leaves under ${Math.round(MIN_VIDEO_BITRATE / 1000)} kbps for ${Math.round(
        duration,
      )}s of video. The result would be unwatchable. Pick a larger target or trim the video first.`,
    );
  }

  // --- Resolution ---
  const srcShort = Math.min(src.width, src.height);
  const fps = Math.min(src.frameRate ?? 30, 60);
  let frameRate: number | undefined = src.frameRate && src.frameRate > 60 ? 60 : undefined;
  if (frameRate) notes.push('Frame rate capped at 60 fps.');

  let outShort = srcShort;
  for (const rung of LADDER) {
    outShort = Math.min(srcShort, rung);
    const scale = outShort / srcShort;
    const pixels = src.width * scale * (src.height * scale);
    if (videoBitrate / (pixels * fps) >= MIN_BPP) break;
  }
  // If even the lowest rung is starved, cap the frame rate too.
  {
    const scale = outShort / srcShort;
    const pixels = src.width * scale * (src.height * scale);
    if (videoBitrate / (pixels * fps) < MIN_BPP * 0.66 && fps > 30) {
      frameRate = 30;
      notes.push('Frame rate reduced to 30 fps to protect image quality.');
    }
  }

  if (opts.maxHeight && opts.maxHeight < outShort) {
    outShort = opts.maxHeight;
    notes.push(`Resolution capped at ${opts.maxHeight}p as requested.`);
  }

  const scale = outShort / srcShort;
  const width = evenRound(src.width * scale);
  const height = evenRound(src.height * scale);
  if (outShort < srcShort && !opts.maxHeight) {
    notes.push(
      `Downscaled to ${Math.max(width, height)}×${Math.min(width, height)}: at this size budget, a smaller sharp image beats a larger blurry one.`,
    );
  }

  return { targetBytes, videoBitrate, width, height, frameRate, audio, notes };
}

/** After an overshoot, tighten the plan proportionally. */
export function tightenPlan(plan: CompressionPlan, actualBytes: number): CompressionPlan {
  const ratio = plan.targetBytes / actualBytes;
  return {
    ...plan,
    videoBitrate: Math.max(MIN_VIDEO_BITRATE, plan.videoBitrate * ratio * 0.95),
  };
}
