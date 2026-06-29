import { useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RvFooter } from '../components/layout/RvFooter'
import { LogoMark } from '../components/brand/Logo'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { useJobs } from '../features/jobs'
import { formatRelativeTime } from '../lib/format'
import { companyInitials, logoColors, sponsorsVisa } from '../lib/jobDisplay'
import { usePalette } from '../lib/palette'

const marqueeBase = [
  'Northwind',
  'Lumen',
  'Vela',
  'Quanta AI',
  'Beacon',
  'Forge',
  'Acme Labs',
  'Halcyon',
]
const marquee = [...marqueeBase, ...marqueeBase]

const features = [
  {
    num: '01',
    title: 'Resume-ranked results',
    body: 'Upload once and every listing reorders to your skills and experience — no endless scrolling.',
  },
  {
    num: '02',
    title: 'Sponsorship, up front',
    body: 'Each role is tagged for visa sponsorship so international students never apply blind.',
  },
  {
    num: '03',
    title: 'Built for early careers',
    body: 'Only internships, co-ops, and new-grad roles. No senior listings cluttering your search.',
  },
]

const heroCards = [
  {
    top: 6,
    right: 6,
    left: undefined,
    width: 316,
    match: 94,
    title: 'SWE Intern',
    company: 'Acme Labs',
    loc: 'San Francisco',
    initials: 'AL',
    bg: '#E7F3EC',
    fg: '#12805A',
    delay: '0s',
    rot: '3deg',
  },
  {
    top: 188,
    left: 0,
    right: undefined,
    width: 294,
    match: 88,
    title: 'Back-end Intern',
    company: 'Forge',
    loc: 'New York',
    initials: 'FG',
    bg: '#EEF2F1',
    fg: '#46554F',
    delay: '0.5s',
    rot: '-4deg',
  },
  {
    top: 332,
    right: 36,
    left: undefined,
    width: 286,
    match: 71,
    title: 'Data Science New Grad',
    company: 'Vela',
    loc: 'Remote, CA',
    initials: 'VE',
    bg: '#E7F3EC',
    fg: '#12805A',
    delay: '0.9s',
    rot: '2.5deg',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const p = usePalette()
  const [search, setSearch] = useState('')
  const { data } = useJobs({ status: 'open', pageSize: 6 })
  const recentJobs = data?.data ?? []

  const submitSearch = () => {
    navigate(search.trim() ? `/jobs?search=${encodeURIComponent(search.trim())}` : '/jobs')
  }

  return (
    <div style={{ background: p.pageBg, minHeight: '100vh', animation: 'spr-up .4s ease both' }}>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(168deg,#0C4030 0%,#072A1E 52%,#08231A 100%)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -180,
            left: -120,
            width: 620,
            height: 620,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(95,214,160,0.42),rgba(95,214,160,0) 62%)',
            filter: 'blur(30px)',
            animation: 'auroraA 20s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -80,
            right: -160,
            width: 680,
            height: 680,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(46,160,180,0.34),rgba(46,160,180,0) 60%)',
            filter: 'blur(36px)',
            animation: 'auroraB 24s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1.3px)',
            backgroundSize: '28px 28px',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 40% 30%,#000 30%,transparent 80%)',
            maskImage: 'radial-gradient(ellipse 90% 80% at 40% 30%,#000 30%,transparent 80%)',
          }}
        />

        {/* Dark nav */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: 1180,
            margin: '0 auto',
            padding: '22px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 30,
          }}
        >
          <Link
            to="/"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <LogoMark size={30} />
            <span
              className="rv-display"
              style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: '#fff' }}
            >
              RoleVault
            </span>
          </Link>
          <nav style={{ display: 'flex', gap: 26, alignItems: 'center', marginLeft: 6 }}>
            <Link
              to="/jobs"
              className="rv-nav-link-dark"
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: 'rgba(255,255,255,0.82)',
                textDecoration: 'none',
              }}
            >
              Browse
            </Link>
            <Link
              to="/faq"
              className="rv-nav-link-dark"
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: 'rgba(255,255,255,0.82)',
                textDecoration: 'none',
              }}
            >
              FAQ
            </Link>
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <ThemeToggle />
            <Link
              to="/login"
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: '#fff',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 11,
                padding: '10px 18px',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
              }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: '#06281D',
                background: 'linear-gradient(180deg,#7CE7B0,#46C98A)',
                borderRadius: 11,
                padding: '11px 20px',
                textDecoration: 'none',
                boxShadow: '0 8px 20px -6px rgba(70,201,138,0.6)',
              }}
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 1180,
            margin: '0 auto',
            padding: '46px 28px 64px',
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: '#BFF3D8',
                fontWeight: 600,
                fontSize: 13,
                padding: '7px 15px',
                borderRadius: 999,
                marginBottom: 26,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  background: '#5FD6A0',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #5FD6A0',
                  display: 'inline-block',
                }}
              />
              Built for students &amp; new grads
            </div>
            <h1
              className="rv-display"
              style={{
                fontWeight: 800,
                fontSize: 60,
                lineHeight: 1.02,
                letterSpacing: '-0.035em',
                margin: '0 0 20px',
                color: '#fff',
              }}
            >
              Internships that
              <br />
              <span
                className="rv-serif-i"
                style={{
                  fontWeight: 400,
                  background: 'linear-gradient(100deg,#7CE7B0,#5FD6A0,#9BE8FF)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontSize: 66,
                }}
              >
                actually fit
              </span>{' '}
              you.
            </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.74)',
                maxWidth: 480,
                margin: '0 0 30px',
              }}
            >
              RoleVault ranks every opening by how well it matches your resume — and flags visa
              sponsorship up front, so you never apply blind.
            </p>
            <div style={{ display: 'flex', gap: 10, maxWidth: 560 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 14,
                  padding: '0 16px',
                  backdropFilter: 'blur(14px)',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17 }}>⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                  placeholder="Search roles, companies, skills..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: '#fff',
                    fontSize: 15,
                    padding: '16px 0',
                  }}
                />
              </div>
              <button
                onClick={submitSearch}
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#06281D',
                  background: 'linear-gradient(180deg,#7CE7B0,#46C98A)',
                  border: 'none',
                  borderRadius: 14,
                  padding: '0 26px',
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px -8px rgba(70,201,138,0.7)',
                }}
              >
                Search
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {['Sponsors visas', 'Remote', 'Internship', 'New Grad'].map((tag, i) => (
                <Link
                  key={tag}
                  to={`/jobs?search=${encodeURIComponent(tag)}`}
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: i === 0 ? '#06281D' : 'rgba(255,255,255,0.88)',
                    background: i === 0 ? '#5FD6A0' : 'rgba(255,255,255,0.08)',
                    border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.16)',
                    borderRadius: 999,
                    padding: '7px 14px',
                    textDecoration: 'none',
                  }}
                >
                  {tag}
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 30, marginTop: 36 }}>
              <Stat value={data ? `${data.total}+` : '12,000+'} label="open roles" />
              <div style={{ width: 1, background: 'rgba(255,255,255,0.14)' }} />
              <Stat value="480" label="companies hiring" />
              <div style={{ width: 1, background: 'rgba(255,255,255,0.14)' }} />
              <Stat value="92%" label="visa-tagged" valueColor="#5FD6A0" />
            </div>
          </div>

          {/* Floating decorative cards */}
          <div style={{ position: 'relative', height: 440 }}>
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 60,
                left: 30,
                width: 340,
                height: 340,
                borderRadius: '50%',
                background: 'radial-gradient(circle,rgba(95,214,160,0.32),transparent 65%)',
                filter: 'blur(20px)',
              }}
            />
            {heroCards.map((card) => (
              <div
                key={card.initials}
                onClick={() => navigate('/jobs')}
                style={
                  {
                    '--r': card.rot,
                    position: 'absolute',
                    top: card.top,
                    right: card.right,
                    left: card.left,
                    width: card.width,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.97)',
                    borderRadius: 20,
                    padding: 18,
                    boxShadow:
                      card.match === 94
                        ? '0 36px 70px -22px rgba(0,0,0,0.6),0 0 0 2px #5FD6A0'
                        : '0 36px 70px -24px rgba(0,0,0,0.55)',
                    animation: `floaty 6.5s ease-in-out infinite ${card.delay}`,
                  } as CSSProperties
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className="rv-display"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: card.bg,
                      color: card.fg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {card.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="rv-display"
                      style={{ fontWeight: 700, fontSize: 15, color: '#0A1410' }}
                    >
                      {card.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#6A7872' }}>
                      {card.company} · {card.loc}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      className="rv-display"
                      style={{ fontWeight: 800, fontSize: 19, color: '#12805A', lineHeight: 1 }}
                    >
                      {card.match}%
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#9AA8A2',
                        letterSpacing: '0.04em',
                      }}
                    >
                      MATCH
                    </div>
                  </div>
                </div>
                {card.match === 94 && (
                  <>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 999,
                        background: '#EAF2EE',
                        marginTop: 14,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: '94%',
                          height: '100%',
                          background: 'linear-gradient(90deg,#46C98A,#12805A)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 13 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#12805A',
                          background: '#E7F3EC',
                          borderRadius: 999,
                          padding: '3px 9px',
                        }}
                      >
                        ✓ Sponsors
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#5C6B63',
                          background: '#F1F4F2',
                          borderRadius: 999,
                          padding: '3px 9px',
                        }}
                      >
                        Internship
                      </span>
                    </div>
                  </>
                )}
                {card.match === 88 && (
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: '#EAF2EE',
                      marginTop: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '88%',
                        height: '100%',
                        background: 'linear-gradient(90deg,#46C98A,#12805A)',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '18px 0',
            overflow: 'hidden',
            WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)',
            maskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 54,
              width: 'max-content',
              animation: 'marquee 28s linear infinite',
              whiteSpace: 'nowrap',
            }}
          >
            {marquee.map((m, i) => (
              <span
                key={i}
                className="rv-display"
                style={{ fontWeight: 700, fontSize: 17, color: 'rgba(255,255,255,0.42)' }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Recent postings (real data) */}
      <section style={{ background: p.pageBg, padding: '64px 28px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 26,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: p.accent,
                  marginBottom: 8,
                }}
              >
                Fresh this week
              </div>
              <h2
                className="rv-display"
                style={{
                  fontWeight: 800,
                  fontSize: 32,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: p.ink,
                }}
              >
                Recent job postings
              </h2>
            </div>
            <Link
              to="/jobs"
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: p.accent,
                background: p.surface,
                border: `1px solid ${p.accentBorder}`,
                borderRadius: 11,
                padding: '11px 18px',
                textDecoration: 'none',
              }}
            >
              Browse all {data?.total ?? ''} →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {recentJobs.map((job) => {
              const colors = logoColors(job.company)
              return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="rv-job-card"
                  style={{
                    display: 'block',
                    background: p.surface,
                    border: `1px solid ${p.border}`,
                    borderRadius: 18,
                    padding: 20,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'box-shadow .18s,border-color .18s,transform .18s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                    <div
                      className="rv-display"
                      style={{
                        width: 46,
                        height: 46,
                        flexShrink: 0,
                        borderRadius: 13,
                        background: colors.bg,
                        color: colors.fg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {companyInitials(job.company)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="rv-display"
                        style={{ fontWeight: 700, fontSize: 16.5, lineHeight: 1.25, color: p.ink }}
                      >
                        {job.title}
                      </div>
                      <div style={{ fontSize: 13, color: p.muted, marginTop: 3 }}>
                        {job.company} · {job.location}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 18,
                    }}
                  >
                    {sponsorsVisa(job) ? (
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: p.accent,
                          background: p.accentSoftBg,
                          borderRadius: 999,
                          padding: '5px 11px',
                        }}
                      >
                        ✓ Sponsors visa
                      </span>
                    ) : (
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: p.muted,
                          background: p.chipBg,
                          borderRadius: 999,
                          padding: '5px 11px',
                        }}
                      >
                        No sponsorship
                      </span>
                    )}
                    <span style={{ fontSize: 12.5, color: p.muted }}>
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          background: p.surface,
          padding: '72px 28px',
          borderTop: `1px solid ${p.borderSubtle}`,
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 44px' }}>
            <h2
              className="rv-display"
              style={{
                fontWeight: 800,
                fontSize: 34,
                letterSpacing: '-0.025em',
                margin: '0 0 12px',
                color: p.ink,
              }}
            >
              Built around your resume
            </h2>
            <p style={{ fontSize: 17, color: p.body, lineHeight: 1.55, margin: 0 }}>
              Upload once. We read your skills and experience, then rank the whole board for you.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {features.map((f) => (
              <div
                key={f.num}
                style={{
                  position: 'relative',
                  background: p.surfaceMuted,
                  border: `1px solid ${p.border}`,
                  borderRadius: 20,
                  padding: '28px 24px',
                  overflow: 'hidden',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle,rgba(95,214,160,0.18),transparent 70%)',
                  }}
                />
                <div
                  className="rv-serif-i"
                  style={{ fontSize: 30, color: p.accent, marginBottom: 14 }}
                >
                  {f.num}
                </div>
                <h3
                  className="rv-display"
                  style={{
                    fontWeight: 700,
                    fontSize: 19,
                    letterSpacing: '-0.01em',
                    margin: '0 0 8px',
                    color: p.ink,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 14.5, color: p.body, lineHeight: 1.55, margin: 0 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RvFooter />
    </div>
  )
}

function Stat({
  value,
  label,
  valueColor = '#fff',
}: {
  value: string
  label: string
  valueColor?: string
}) {
  return (
    <div>
      <div className="rv-display" style={{ fontWeight: 800, fontSize: 24, color: valueColor }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
