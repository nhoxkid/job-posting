import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'
import type { RoleVaultScreen } from '../types'

export type AuthScreenProps = {
	mode: 'login' | 'register'
	go: (s: RoleVaultScreen) => void
}

export function AuthScreen({ mode, go }: AuthScreenProps) {
	const back = mode === 'login' ? 'Login' : 'Create Account'
	const p = usePalette()
	const fieldStyle = {
		width: '100%',
		border: `1.5px solid ${p.border}`,
		borderRadius: 11,
		padding: '13px 15px',
		fontSize: 15,
		fontFamily: "'Plus Jakarta Sans'",
		color: p.ink,
		background: p.surface,
		outline: 'none',
		boxSizing: 'border-box' as const,
	}
	const googleButtonStyle = {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		fontFamily: "'Plus Jakarta Sans'",
		fontWeight: 600,
		fontSize: 15,
		color: p.ink,
		background: p.surface,
		border: `1.5px solid ${p.border}`,
		borderRadius: 11,
		padding: 13,
		cursor: 'pointer',
	}

	return (
		<div style={{ animation: 'spr-up .35s ease both', minHeight: '100vh', background: p.pageBg, color: p.ink }}>
			<div style={{ background: p.surface, borderBottom: `1px solid ${p.borderSubtle}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<span onClick={() => go('landing')} style={{ fontWeight: 600, fontSize: 15, color: p.body, cursor: 'pointer' }}>← {back}</span>
				<ThemeToggle />
			</div>
			<div style={{ display: 'flex', justifyContent: 'center', padding: '56px 24px' }}>
				<div style={{ width: '100%', maxWidth: 430, background: p.surface, border: `1px solid ${p.border}`, borderRadius: 20, padding: '38px 36px', boxShadow: p.isDark ? '0 14px 40px rgba(0,0,0,0.45)' : '0 14px 40px rgba(16,33,27,0.06)' }}>
					<div style={{ textAlign: 'center', marginBottom: 30 }}>
						<div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
							<div style={{ width: 30, height: 30, background: p.accentButtonBg, borderRadius: '5px 15px 5px 15px' }} />
							<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: p.ink }}>RoleVault</span>
						</div>
						<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, margin: 0, letterSpacing: '-0.02em', color: p.ink }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
						<p style={{ fontSize: 14.5, color: p.muted, margin: '6px 0 0' }}>{mode === 'login' ? 'Log in to see roles matched to your resume.' : 'Upload a resume and get ranked matches in minutes.'}</p>
					</div>
					<label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: p.body, marginBottom: 7 }}>Email</label>
					<input placeholder='you@university.edu' style={{ ...fieldStyle, marginBottom: 16 }} />
					<label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: p.body, marginBottom: 7 }}>Password</label>
					<input type='password' placeholder={mode === 'login' ? '••••••••' : 'At least 8 characters'} style={{ ...fieldStyle, marginBottom: mode === 'login' ? 8 : 24 }} />
					{mode === 'login' && <div style={{ textAlign: 'right', marginBottom: 20 }}><span style={{ fontSize: 13, fontWeight: 600, color: p.accent, cursor: 'pointer' }}>Forgot password?</span></div>}
					<button onClick={() => go(mode === 'login' ? 'recommended' : 'onboarding')} style={{ width: '100%', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 11, padding: 14, cursor: 'pointer', marginBottom: 18 }}>
						{mode === 'login' ? 'Log In' : 'Create Account'}
					</button>
					{mode === 'login' && (
						<>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12, color: p.muted, fontSize: 13, marginBottom: 18 }}><span style={{ flex: 1, height: 1, background: p.borderSubtle }} />or<span style={{ flex: 1, height: 1, background: p.borderSubtle }} /></div>
							<button style={googleButtonStyle}>
								<span style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(#EA4335 0 25%,#FBBC05 25% 50%,#34A853 50% 75%,#4285F4 75% 100%)', display: 'inline-block' }} />Continue with Google
							</button>
						</>
					)}
					{mode === 'register' && (
						<button style={googleButtonStyle}>
							<span style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(#EA4335 0 25%,#FBBC05 25% 50%,#34A853 50% 75%,#4285F4 75% 100%)', display: 'inline-block' }} />Continue with Google
						</button>
					)}
					<div style={{ borderTop: `1px solid ${p.borderSubtle}`, marginTop: 26, paddingTop: 20, textAlign: 'center' }}>
						{mode === 'login' ? (
							<>
								<div style={{ fontSize: 15, color: p.body }}>{"Don't have an account? "}<span onClick={() => go('register')} style={{ fontWeight: 700, color: p.accent, cursor: 'pointer' }}>Sign up</span></div>
								<div onClick={() => go('browse')} style={{ fontSize: 13.5, color: p.muted, marginTop: 8, cursor: 'pointer' }}>Continue as guest (browse only) →</div>
							</>
						) : (
							<div style={{ fontSize: 15, color: p.body }}>Already have an account? <span onClick={() => go('login')} style={{ fontWeight: 700, color: p.accent, cursor: 'pointer' }}>Log in</span></div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
