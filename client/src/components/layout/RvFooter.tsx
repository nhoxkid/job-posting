import { Link } from 'react-router-dom'
import { LogoMark } from '../brand/Logo'

const linkStyle = { cursor: 'pointer', color: 'rgba(255,255,255,0.78)', textDecoration: 'none' }

/** Dark gradient footer used on the landing page. */
export function RvFooter() {
  return (
    <footer
      style={{
        background: 'linear-gradient(168deg,#0C4030,#08231A)',
        color: '#fff',
        padding: '56px 28px 36px',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: 32,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <LogoMark />
            <span className="rv-display" style={{ fontWeight: 800, fontSize: 20 }}>
              RoleVault
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 280,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            The job board that ranks roles by your resume and never hides visa sponsorship.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[
            { to: '/jobs', label: 'Browse jobs' },
            { to: '/recommended', label: 'Recommended' },
            { to: '/onboarding', label: 'Resume matching' },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { to: '/faq', label: 'FAQ' },
            { to: '/jobs/new', label: 'Post a job' },
          ]}
        />
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 14,
            }}
          >
            Get started
          </div>
          <Link
            to="/register"
            style={{
              display: 'block',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14,
              color: '#06281D',
              background: 'linear-gradient(180deg,#7CE7B0,#46C98A)',
              border: 'none',
              borderRadius: 11,
              padding: '11px 18px',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            Create free account
          </Link>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1180,
          margin: '36px auto 0',
          paddingTop: 22,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        <span>© 2026 RoleVault</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="rv-footer-link" style={linkStyle}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
