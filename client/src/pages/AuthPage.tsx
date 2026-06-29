import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/brand/Logo'

const inputStyle = {
  width: '100%',
  border: '1.5px solid #E6ECE7',
  borderRadius: 12,
  padding: '13px 15px',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
} as const

/**
 * Login / register screen. These are presentational only — the platform has no
 * auth backend yet, so submitting advances through the intended onboarding flow.
 */
export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(168deg,#0C4030,#08231A)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', animation: 'spr-up .35s ease both' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: -160, left: -100, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(95,214,160,0.32),transparent 62%)', filter: 'blur(30px)', animation: 'auroraA 22s ease-in-out infinite' }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: -160, right: -120, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(46,160,180,0.28),transparent 62%)', filter: 'blur(34px)', animation: 'auroraB 26s ease-in-out infinite' }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 430, background: 'rgba(255,255,255,0.98)', borderRadius: 24, padding: '38px 36px', boxShadow: '0 40px 90px -30px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <LogoMark size={32} />
            <span className="rv-display" style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>RoleVault</span>
          </div>
          <h1 className="rv-display" style={{ fontWeight: 700, fontSize: 25, margin: 0, letterSpacing: '-0.02em' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p style={{ fontSize: 14.5, color: '#7A8780', margin: '6px 0 0' }}>{mode === 'login' ? 'Log in to see roles matched to your resume.' : 'Upload a resume and get ranked matches in minutes.'}</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); navigate(mode === 'login' ? '/recommended' : '/onboarding') }}
        >
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>Email</label>
          <input type="email" placeholder="you@university.edu" style={{ ...inputStyle, marginBottom: 16 }} />
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>Password</label>
          <input type="password" placeholder={mode === 'login' ? '••••••••' : 'At least 8 characters'} style={{ ...inputStyle, marginBottom: mode === 'login' ? 8 : 24 }} />
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#12805A', cursor: 'pointer' }}>Forgot password?</span>
            </div>
          )}
          <button type="submit" style={{ width: '100%', fontWeight: 700, fontSize: 16, color: '#fff', background: 'linear-gradient(180deg,#1A9468,#127a56)', border: 'none', borderRadius: 12, padding: 14, cursor: 'pointer', marginBottom: 18, boxShadow: '0 10px 24px -8px rgba(18,128,90,0.55)' }}>
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#9AA8A2', fontSize: 13, marginBottom: 18 }}>
          <span style={{ flex: 1, height: 1, background: '#EEF2EF' }} />or<span style={{ flex: 1, height: 1, background: '#EEF2EF' }} />
        </div>
        <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontWeight: 600, fontSize: 15, color: '#0A1410', background: '#fff', border: '1.5px solid #E6ECE7', borderRadius: 12, padding: 13, cursor: 'pointer' }}>
          <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(#EA4335 0 25%,#FBBC05 25% 50%,#34A853 50% 75%,#4285F4 75% 100%)', display: 'inline-block' }} />Continue with Google
        </button>

        <div style={{ borderTop: '1px solid #EEF2EF', marginTop: 26, paddingTop: 20, textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              <div style={{ fontSize: 15, color: '#46554F' }}>
                Don&apos;t have an account? <Link to="/register" style={{ fontWeight: 700, color: '#12805A', textDecoration: 'none' }}>Sign up</Link>
              </div>
              <Link to="/jobs" style={{ display: 'block', fontSize: 13.5, color: '#8B988F', marginTop: 8, textDecoration: 'none' }}>Continue as guest (browse only) →</Link>
            </>
          ) : (
            <div style={{ fontSize: 15, color: '#46554F' }}>
              Already have an account? <Link to="/login" style={{ fontWeight: 700, color: '#12805A', textDecoration: 'none' }}>Log in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
