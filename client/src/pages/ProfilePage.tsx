import { useState } from 'react'
import { Link } from 'react-router-dom'

type ProfileTab = 'profile' | 'resume' | 'password' | 'prefs' | 'delete'

const navItems: { key: ProfileTab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'resume', label: 'Resume & Matching' },
  { key: 'password', label: 'Password & Security' },
  { key: 'prefs', label: 'Job Preferences' },
]

const prefs = [
  { l: 'Job Type', v: 'Internship + New Grad', d: true },
  { l: 'Preferred Regions', v: 'US, CA, UK', d: false },
  { l: 'Sponsorship needed?', v: 'Yes — required', d: true },
  { l: 'Preferred Roles', v: 'SWE, ML, Backend', d: false },
]

const h1Style = { fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' } as const
const greenBtn = { fontWeight: 700, fontSize: 14, color: '#fff', background: 'linear-gradient(180deg,#1A9468,#127a56)', border: 'none', borderRadius: 11, padding: '11px 20px', cursor: 'pointer' } as const

/** Account settings. Presentational only — no account backend yet. */
export function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>('profile')

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: 28, display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, alignItems: 'start' }}>
      <aside style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: 14, position: 'sticky', top: 90, boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map((n) => (
            <div key={n.key} onClick={() => setTab(n.key)} style={{ fontSize: 14.5, fontWeight: tab === n.key ? 700 : 600, color: tab === n.key ? '#0A1410' : '#5C6B63', background: tab === n.key ? '#E7F3EC' : 'transparent', borderRadius: 11, padding: '11px 14px', cursor: 'pointer' }}>{n.label}</div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #EEF2EF', margin: '12px 0' }} />
        <div onClick={() => setTab('delete')} style={{ fontSize: 14.5, fontWeight: tab === 'delete' ? 700 : 600, color: tab === 'delete' ? '#B23B32' : '#9A4039', background: tab === 'delete' ? '#FBECEC' : 'transparent', borderRadius: 11, padding: '11px 14px', cursor: 'pointer' }}>Delete Account</div>
      </aside>

      <section style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: '30px 32px', minHeight: 420, boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
        {tab === 'profile' && (
          <>
            <h1 className="rv-display" style={{ ...h1Style, margin: '0 0 4px' }}>Profile</h1>
            <div style={{ fontSize: 15, color: '#7A8780', marginBottom: 30 }}>alex@university.edu</div>
            <h2 className="rv-display" style={{ fontWeight: 700, fontSize: 17, margin: '0 0 14px' }}>Notification Preferences</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 460 }}>
              {['Email new jobs matching my filters', 'Weekly digest of top-matched roles'].map((label) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid #E6ECE7', borderRadius: 12, padding: '14px 16px' }}>
                  <span style={{ fontSize: 14.5 }}>{label}</span>
                  <span style={{ width: 38, height: 22, borderRadius: 999, background: '#12805A', position: 'relative', display: 'inline-block' }}><span style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} /></span>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'resume' && (
          <>
            <h1 className="rv-display" style={{ ...h1Style, margin: '0 0 24px' }}>Resume &amp; Matching</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1.5px solid #E6ECE7', borderRadius: 12, padding: 16, maxWidth: 480, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#E7F3EC', color: '#12805A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>PDF</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14.5 }}>resume_example.pdf</div><div style={{ fontSize: 13, color: '#8B988F' }}>Uploaded 3 days ago · 14 skills detected</div></div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#B23B32', cursor: 'pointer' }}>Remove</span>
            </div>
            <Link to="/onboarding" style={{ ...greenBtn, textDecoration: 'none', display: 'inline-block' }}>Re-upload resume</Link>
          </>
        )}
        {tab === 'password' && (
          <>
            <h1 className="rv-display" style={{ ...h1Style, margin: '0 0 24px' }}>Password &amp; Security</h1>
            <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ l: 'Current password', p: '••••••••' }, { l: 'New password', p: 'At least 8 characters' }].map((f) => (
                <div key={f.l}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>{f.l}</label><input type="password" placeholder={f.p} style={{ width: '100%', border: '1.5px solid #E6ECE7', borderRadius: 11, padding: '12px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} /></div>
              ))}
              <button style={{ ...greenBtn, alignSelf: 'flex-start' }}>Update password</button>
            </div>
          </>
        )}
        {tab === 'prefs' && (
          <>
            <h1 className="rv-display" style={{ ...h1Style, margin: '0 0 24px' }}>Job Preferences</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', maxWidth: 560 }}>
              {prefs.map((p) => (
                <div key={p.l}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>{p.l}</label><div style={{ border: '1.5px solid #E6ECE7', borderRadius: 11, padding: '12px 14px', fontSize: 14.5, display: 'flex', justifyContent: 'space-between', cursor: p.d ? 'pointer' : 'default' }}>{p.v}{p.d && <span style={{ color: '#9AA8A2' }}>▾</span>}</div></div>
              ))}
            </div>
          </>
        )}
        {tab === 'delete' && (
          <>
            <h1 className="rv-display" style={{ ...h1Style, margin: '0 0 12px', color: '#B23B32' }}>Delete Account</h1>
            <p style={{ fontSize: 14.5, color: '#46554F', lineHeight: 1.6, maxWidth: 480, margin: '0 0 20px' }}>This permanently removes your account, resume, and all saved matches. This action cannot be undone.</p>
            <button style={{ fontWeight: 700, fontSize: 14, color: '#fff', background: '#B23B32', border: 'none', borderRadius: 11, padding: '11px 20px', cursor: 'pointer' }}>Delete my account</button>
          </>
        )}
        <div style={{ borderTop: '1px solid #EEF2EF', marginTop: 32, paddingTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button style={{ fontWeight: 600, fontSize: 14, color: '#46554F', background: '#fff', border: '1.5px solid #E6ECE7', borderRadius: 11, padding: '10px 18px', cursor: 'pointer' }}>Discard Changes</button>
          <button style={{ ...greenBtn, padding: '10px 20px' }}>Save Changes</button>
        </div>
      </section>
    </div>
  )
}
