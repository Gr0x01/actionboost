import { ImageResponse } from 'next/og'
import { ABOOST_LOGO_PATHS, ABOOST_LOGO_VIEWBOX } from '@/components/ui'

export const runtime = 'edge'
export const alt = 'Aboost - AI Action Plan for Founders'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FDFCFB',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Brutalist card container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 64px',
            border: '3px solid #2C3E50',
            background: '#FFFFFF',
            boxShadow: '8px 8px 0 0 #2C3E50',
          }}
        >
          {/* Logo/Brand mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <svg width="320" height="58" viewBox={ABOOST_LOGO_VIEWBOX} fill="none">
              {ABOOST_LOGO_PATHS.map((d, i) => (
                <path key={i} d={d} fill="#2C3E50" />
              ))}
            </svg>
          </div>

          {/* Tagline - light/bold contrast */}
          <div
            style={{
              display: 'flex',
              fontSize: '36px',
              color: '#2C3E50',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontWeight: 300 }}>Stop guessing.</span>
            <span style={{ fontWeight: 900, marginLeft: '12px' }}>Start growing.</span>
          </div>

          {/* Subtitle - mono uppercase */}
          <div
            style={{
              fontSize: '18px',
              fontFamily: 'monospace',
              color: '#2C3E50',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textAlign: 'center',
            }}
          >
            $9.99 → 30-day growth plan → no fluff
          </div>
        </div>

        {/* Bottom accent - solid brutalist block */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '12px',
            background: '#E67E22',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
