import { ImageResponse } from 'next/og'
import { BOOST_LOGO_PATHS, BOOST_LOGO_VIEWBOX } from '@/components/ui'

export const runtime = 'edge'
export const alt = 'Boost - Your 30-Day Marketing Plan'
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
        {/* Soft brutalist card - offset shadow, visible border, slight radius */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '56px 80px',
            background: '#FFFFFF',
            border: '2px solid #2C3E50',
            borderRadius: '6px',
            boxShadow: '6px 6px 0 rgba(44, 62, 80, 0.15)',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <svg width="360" height="84" viewBox={BOOST_LOGO_VIEWBOX} fill="none">
              {BOOST_LOGO_PATHS.map((d, i) => (
                <path key={i} d={d} fill="#2C3E50" />
              ))}
            </svg>
          </div>

          {/* Tagline - bold */}
          <div
            style={{
              display: 'flex',
              fontSize: '42px',
              color: '#2C3E50',
              textAlign: 'center',
              marginBottom: '24px',
              fontWeight: 700,
            }}
          >
            Your 30-Day Marketing Plan
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '22px',
              color: '#7F8C8D',
              textAlign: 'center',
            }}
          >
            Real competitor research. Actionable strategy. $29.
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '10px',
            background: '#E67E22',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
