import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

export const dynamic = 'force-static';
export const alt = `${SITE_NAME} — fit any video under any size limit`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0a0b0d',
          color: '#f4f5f7',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, letterSpacing: '-1px' }}>
          UNDER<span style={{ color: '#d7f94c' }}>CAP</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 48,
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-3px',
          }}
        >
          <span>Fit any video under</span>
          <span style={{ color: '#d7f94c' }}>any size limit.</span>
        </div>
        {/* the limit-line motif */}
        <div style={{ display: 'flex', position: 'relative', marginTop: 72, height: 18 }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 1040,
              height: 18,
              background: '#191c22',
              borderRadius: 9,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 560,
              height: 18,
              background: '#d7f94c',
              borderRadius: 9,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 645,
              top: -14,
              width: 5,
              height: 46,
              background: '#d7f94c',
              display: 'flex',
            }}
          />
        </div>
        <div style={{ display: 'flex', marginTop: 56, fontSize: 30, color: '#9ba3af' }}>
          In your browser · No upload · No watermark · No account · Free
        </div>
      </div>
    ),
    size,
  );
}
