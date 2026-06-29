import type { RoleVaultScreen } from '../types'

export type AuthScreenProps = {
	mode: 'login' | 'register'
	go: (s: RoleVaultScreen) => void
}

export function AuthScreen({ mode, go }: AuthScreenProps) {
	const back = mode === 'login' ? 'Login' : 'Create Account'
	return (
		<div style={{ animation: 'spr-up .35s ease both', minHeight: '100vh', background: '#F7F9F8' }}>
			<div style={{ background: '#fff', borderBottom: '1px solid #ECF0EE', padding: '16px 28px' }}>
				<span onClick={() => go('landing')} style={{ fontWeight: 600, fontSize: 15, color: '#5E6E68', cursor: 'pointer' }}>← {back}</span>
			</div>
			<div style={{ display: 'flex', justifyContent: 'center', padding: '56px 24px' }}>
				<div style={{ width: '100%', maxWidth: 430, background: '#fff', border: '1px solid #E8EDEB', borderRadius: 20, padding: '38px 36px', boxShadow: '0 14px 40px rgba(16,33,27,0.06)' }}>
					<div style={{ textAlign: 'center', marginBottom: 30 }}>
						<div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
							<div style={{ width: 30, height: 30, background: '#1A7A52', borderRadius: '5px 15px 5px 15px' }} />
							<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>RoleVault</span>
						</div>
						<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
						<p style={{ fontSize: 14.5, color: '#7A8780', margin: '6px 0 0' }}>{mode === 'login' ? 'Log in to see roles matched to your resume.' : 'Upload a resume and get ranked matches in minutes.'}</p>
					</div>
					<label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>Email</label>
					<input placeholder='you@university.edu' style={{ width: '100%', border: '1.5px solid #E3E9E6', borderRadius: 11, padding: '13px 15px', fontSize: 15, fontFamily: "'Plus Jakarta Sans'", color: '#10211B', marginBottom: 16, outline: 'none', boxSizing: 'border-box' }} />
					<label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>Password</label>
					<input type='password' placeholder={mode === 'login' ? '••••••••' : 'At least 8 characters'} style={{ width: '100%', border: '1.5px solid #E3E9E6', borderRadius: 11, padding: '13px 15px', fontSize: 15, fontFamily: "'Plus Jakarta Sans'", color: '#10211B', marginBottom: mode === 'login' ? 8 : 24, outline: 'none', boxSizing: 'border-box' }} />
					{mode === 'login' && <div style={{ textAlign: 'right', marginBottom: 20 }}><span style={{ fontSize: 13, fontWeight: 600, color: '#1A7A52', cursor: 'pointer' }}>Forgot password?</span></div>}
					<button onClick={() => go(mode === 'login' ? 'recommended' : 'onboarding')} style={{ width: '100%', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16, color: '#fff', background: '#1A7A52', border: 'none', borderRadius: 11, padding: 14, cursor: 'pointer', marginBottom: 18 }}>
						{mode === 'login' ? 'Log In' : 'Create Account'}
					</button>
					{mode === 'login' && (
						<>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#9AA8A2', fontSize: 13, marginBottom: 18 }}><span style={{ flex: 1, height: 1, background: '#ECF0EE' }} />or<span style={{ flex: 1, height: 1, background: '#ECF0EE' }} /></div>
							<button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: '#10211B', background: '#fff', border: '1.5px solid #E3E9E6', borderRadius: 11, padding: 13, cursor: 'pointer' }}>
								<span style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(#EA4335 0 25%,#FBBC05 25% 50%,#34A853 50% 75%,#4285F4 75% 100%)', display: 'inline-block' }} />Continue with Google
							</button>
						</>
					)}
					{mode === 'register' && (
						<button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: '#10211B', background: '#fff', border: '1.5px solid #E3E9E6', borderRadius: 11, padding: 13, cursor: 'pointer' }}>
							<span style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(#EA4335 0 25%,#FBBC05 25% 50%,#34A853 50% 75%,#4285F4 75% 100%)', display: 'inline-block' }} />Continue with Google
						</button>
					)}
					<div style={{ borderTop: '1px solid #ECF0EE', marginTop: 26, paddingTop: 20, textAlign: 'center' }}>
						{mode === 'login' ? (
							<>
								<div style={{ fontSize: 15, color: '#46554F' }}>{"Don't have an account? "}<span onClick={() => go('register')} style={{ fontWeight: 700, color: '#1A7A52', cursor: 'pointer' }}>Sign up</span></div>
								<div onClick={() => go('browse')} style={{ fontSize: 13.5, color: '#8B988F', marginTop: 8, cursor: 'pointer' }}>Continue as guest (browse only) →</div>
							</>
						) : (
							<div style={{ fontSize: 15, color: '#46554F' }}>Already have an account? <span onClick={() => go('login')} style={{ fontWeight: 700, color: '#1A7A52', cursor: 'pointer' }}>Log in</span></div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
