import { Link } from 'react-router-dom'
import { usePalette } from '../lib/palette'

export function NotFoundPage() {
  const p = usePalette()
  return (
    <div
      style={{
        minHeight: '100vh',
        background: p.pageBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <div className="rv-serif-i" style={{ fontSize: 80, color: p.accent, lineHeight: 1 }}>
          404
        </div>
        <h1
          className="rv-display"
          style={{
            fontWeight: 800,
            fontSize: 30,
            color: p.ink,
            margin: '14px 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Page not found
        </h1>
        <p style={{ color: p.body, fontSize: 16, margin: '0 0 26px' }}>
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          to="/"
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#06281D',
            background: 'linear-gradient(180deg,#7CE7B0,#46C98A)',
            borderRadius: 12,
            padding: '13px 26px',
            textDecoration: 'none',
            boxShadow: '0 10px 24px -8px rgba(70,201,138,0.6)',
          }}
        >
          Back home
        </Link>
      </div>
    </div>
  )
}
