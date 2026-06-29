import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '../brand/Logo'

const NAV_LINKS = [
  { to: '/jobs', label: 'Browse' },
  { to: '/recommended', label: 'Recommended' },
  { to: '/faq', label: 'FAQ' },
]

/**
 * Sticky top navigation shared by the in-app RoleVault screens. `maxWidth`
 * matches the content width of the screen it sits above.
 */
export function RvNav({ maxWidth = 1180 }: { maxWidth?: number }) {
  const { pathname } = useLocation()

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E6ECE7',
      }}
    >
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          padding: '15px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 30,
        }}
      >
        <BrandLogo />
        <nav style={{ display: 'flex', gap: 26, alignItems: 'center', marginLeft: 6 }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.to || pathname.startsWith(`${link.to}/`)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={active ? undefined : 'rv-nav-link'}
                style={{
                  fontWeight: active ? 700 : 600,
                  fontSize: 15,
                  color: active ? '#0A1410' : '#46554F',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <Link
          to="/profile"
          style={{
            marginLeft: 'auto',
            fontWeight: 600,
            fontSize: 15,
            color: '#12805A',
            background: '#fff',
            border: '1.5px solid #CFE6D9',
            borderRadius: 11,
            padding: '9px 18px',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          My Profile
        </Link>
      </div>
    </div>
  )
}
