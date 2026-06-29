import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '../brand/Logo'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useTheme } from '../../providers/theme-context'

const NAV_LINKS = [
  { to: '/jobs', label: 'Browse' },
  { to: '/recommended', label: 'Recommended' },
  { to: '/faq', label: 'FAQ' },
]

/**
 * Sticky top navigation shared by the in-app RoleVault screens. `maxWidth`
 * matches the content width of the screen it sits above. Adapts its surface and
 * link colours to the active theme (`resolvedTheme`).
 */
export function RvNav({ maxWidth = 1180 }: { maxWidth?: number }) {
  const { pathname } = useLocation()
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: dark ? 'rgba(8,35,26,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${dark ? '#1C4334' : '#E6ECE7'}`,
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
            const activeColor = dark ? '#F1F7F4' : '#0A1410'
            const idleColor = dark ? '#9FB8AE' : '#46554F'
            return (
              <Link
                key={link.to}
                to={link.to}
                className={active ? undefined : dark ? 'rv-nav-link-dark' : 'rv-nav-link'}
                style={{
                  fontWeight: active ? 700 : 600,
                  fontSize: 15,
                  color: active ? activeColor : idleColor,
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <Link
            to="/profile"
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: dark ? '#5FD6A0' : '#12805A',
              background: dark ? 'rgba(95,214,160,0.10)' : '#fff',
              border: `1.5px solid ${dark ? '#1C4334' : '#CFE6D9'}`,
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
    </div>
  )
}
