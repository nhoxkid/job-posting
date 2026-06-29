import { Link } from 'react-router-dom'
import { usePalette } from '../lib/palette'

const detectedSkills = ['Python', 'React', 'SQL', 'Node.js', 'Git']
const prefs = [
  { l: 'Job Type', v: 'Internship + New Grad', dropdown: true },
  { l: 'Preferred Regions', v: 'US, CA, UK', dropdown: false },
  { l: 'Sponsorship needed?', v: 'Yes — required', dropdown: true },
  { l: 'Preferred Roles', v: 'SWE, ML, Backend', dropdown: false },
]

/** Resume-upload onboarding. Presentational preview — no resume backend yet. */
export function OnboardingPage() {
  const p = usePalette()
  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '36px 28px 60px' }}>
      <h1
        className="rv-display"
        style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.025em', margin: '0 0 6px' }}
      >
        Upload your resume
      </h1>
      <p style={{ fontSize: 16, color: p.body, margin: '0 0 28px' }}>
        We&apos;ll analyze it to rank jobs by how well they match your skills and experience.
      </p>

      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          border: `2px dashed ${p.accentBorder}`,
          background: `linear-gradient(180deg,${p.accentSoftBg},${p.surfaceMuted})`,
          borderRadius: 20,
          padding: '50px 24px',
          textAlign: 'center',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 280,
            height: 200,
            background: 'radial-gradient(ellipse,rgba(95,214,160,0.22),transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: 16,
            background: p.surface,
            border: `1px solid ${p.accentBorder}`,
            color: p.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px -8px rgba(18,128,90,0.3)',
          }}
        >
          ⇧
        </div>
        <div
          className="rv-display"
          style={{ position: 'relative', fontWeight: 700, fontSize: 21, marginBottom: 6 }}
        >
          Drag and drop your resume here
        </div>
        <div style={{ position: 'relative', fontSize: 14, color: p.muted, marginBottom: 18 }}>
          PDF or DOCX, up to 5MB
        </div>
        <button
          style={{
            position: 'relative',
            fontWeight: 700,
            fontSize: 14,
            color: '#fff',
            background: 'linear-gradient(180deg,#1A9468,#127a56)',
            border: 'none',
            borderRadius: 11,
            padding: '11px 24px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px -8px rgba(18,128,90,0.5)',
          }}
        >
          Browse Files
        </button>
      </div>

      <div
        style={{
          background: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: 18,
          padding: 22,
          marginTop: 18,
          boxShadow: p.shadow,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: p.accentSoftBg,
                color: p.accent,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '5px 10px',
                borderRadius: 999,
              }}
            >
              <span style={{ width: 6, height: 6, background: p.accent, borderRadius: '50%' }} />
              AI
            </span>
            <span className="rv-display" style={{ fontWeight: 700, fontSize: 18 }}>
              Detected Skills Preview
            </span>
          </div>
          <span style={{ fontSize: 13, color: p.muted }}>From resume_xyz.pdf</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 16 }}>
          {detectedSkills.map((s) => (
            <span
              key={s}
              style={{
                fontWeight: 600,
                fontSize: 13.5,
                color: p.accent,
                background: p.accentSoftBg,
                border: `1px solid ${p.accentBorder}`,
                borderRadius: 9,
                padding: '7px 14px',
              }}
            >
              {s}
            </span>
          ))}
          <span
            style={{
              fontWeight: 600,
              fontSize: 13.5,
              color: p.muted,
              background: p.chipBg,
              borderRadius: 9,
              padding: '7px 14px',
            }}
          >
            +8 more
          </span>
        </div>
        <div
          style={{
            borderTop: `1px solid ${p.borderSubtle}`,
            paddingTop: 14,
            fontSize: 14,
            color: p.body,
          }}
        >
          Experience level inferred:{' '}
          <strong style={{ color: p.accent }}>Entry level / New Grad</strong>
        </div>
      </div>

      <div
        style={{
          background: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: 18,
          padding: 24,
          marginTop: 18,
          boxShadow: p.shadow,
        }}
      >
        <h2
          className="rv-display"
          style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', margin: '0 0 20px' }}
        >
          Preferences
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
          {prefs.map((pref) => (
            <div key={pref.l}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: p.body,
                  marginBottom: 7,
                }}
              >
                {pref.l}
              </label>
              <div
                style={{
                  border: `1.5px solid ${p.border}`,
                  borderRadius: 11,
                  padding: '12px 14px',
                  fontSize: 14.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  cursor: pref.dropdown ? 'pointer' : 'default',
                }}
              >
                {pref.v}
                {pref.dropdown && <span style={{ color: p.muted }}>▾</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <Link
          to="/jobs"
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: p.body,
            background: p.surface,
            border: `1.5px solid ${p.border}`,
            borderRadius: 12,
            padding: '13px 22px',
            textDecoration: 'none',
          }}
        >
          Skip for now
        </Link>
        <Link
          to="/recommended"
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
            background: 'linear-gradient(180deg,#1A9468,#127a56)',
            border: 'none',
            borderRadius: 12,
            padding: '13px 24px',
            textDecoration: 'none',
            boxShadow: '0 10px 24px -8px rgba(18,128,90,0.5)',
          }}
        >
          Save and see recommendations →
        </Link>
      </div>
    </div>
  )
}
