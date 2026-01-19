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
          background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EEE6 50%, #EDE4DA 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo/Brand mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #E67E22 0%, #D4A574 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
              boxShadow: '0 8px 32px rgba(230, 126, 34, 0.3)',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
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
              fontSize: '56px',
              fontWeight: 700,
              color: '#1C2B3A',
              letterSpacing: '-0.02em',
            }}
          >
            Actionboo.st
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 500,
            color: '#2C3E50',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.3,
            marginBottom: '32px',
          }}
        >
          AI-Powered Growth Strategy
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#7F8C8D',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Real competitive research. Actionable insights. Not ChatGPT fluff.
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '8px',
            background: 'linear-gradient(90deg, #E67E22 0%, #4F7CAC 100%)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
