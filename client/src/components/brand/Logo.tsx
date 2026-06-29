import { Link } from 'react-router-dom'

/** The RoleVault gradient mark. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '6px 15px 6px 15px',
        background: 'linear-gradient(140deg,#33C386,#0E4D37)',
        flexShrink: 0,
      }}
    />
  )
}

/** Clickable logo + wordmark, linking home. `variant` switches text colour. */
export function BrandLogo({
  size = 28,
  fontSize = 21,
  variant = 'light',
}: {
  size?: number
  fontSize?: number
  variant?: 'light' | 'dark'
}) {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <LogoMark size={size} />
      <span
        className="rv-display"
        style={{
          fontWeight: 800,
          fontSize,
          letterSpacing: '-0.02em',
          color: variant === 'dark' ? '#fff' : '#0A1410',
        }}
      >
        RoleVault
      </span>
    </Link>
  )
}
