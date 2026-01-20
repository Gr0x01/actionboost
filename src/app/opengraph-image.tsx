import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Actionboo.st - AI Action Plan for Founders'
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
            <div
              style={{
                width: '72px',
                height: '72px',
                background: '#E67E22',
                border: '3px solid #2C3E50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                boxShadow: '4px 4px 0 0 #2C3E50',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: '#2C3E50',
                letterSpacing: '-0.02em',
              }}
            >
              Actionboo.st
            </span>
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
