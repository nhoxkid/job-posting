import { useCallback, useState, type CSSProperties, type FormEvent } from 'react'
import { GoogleIcon } from '../../../components/brand/GoogleIcon'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'
import { useAuth } from '../../../providers/auth-context'
import { useGoogleSignIn } from '../hooks/useGoogleSignIn'
import type { RoleVaultScreen } from '../types'

export type AuthScreenProps = {
	mode: 'login' | 'register'
	go: (s: RoleVaultScreen) => void
}

/** Mirrors the server's minimum; checked here only to avoid a pointless round trip. */
const MIN_PASSWORD_LENGTH = 8

export function AuthScreen({ mode, go }: AuthScreenProps) {
	const back = mode === 'login' ? 'Login' : 'Create Account'
	const p = usePalette()
	const { login, register, loginWithGoogle, googleEnabled } = useAuth()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	/** Where a successful sign-in lands. */
	const destination: RoleVaultScreen = mode === 'login' ? 'recommended' : 'onboarding'

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setError(null)

		const trimmedEmail = email.trim()
		if (!trimmedEmail || !password) {
			setError('Enter your email and password.')
			return
		}
		if (mode === 'register' && password.length < MIN_PASSWORD_LENGTH) {
			setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
			return
		}

		setSubmitting(true)
		try {
			if (mode === 'login') {
				await login(trimmedEmail, password)
			} else {
				await register(trimmedEmail, password)
			}
			go(destination)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	const handleGoogleCredential = useCallback(
		async (idToken: string) => {
			setError(null)
			setSubmitting(true)
			try {
				await loginWithGoogle(idToken)
				go(destination)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Google sign-in failed.')
			} finally {
				setSubmitting(false)
			}
		},
		[loginWithGoogle, go, destination],
	)

	const {
		containerRef: googleRef,
		ready: googleReady,
		error: googleError,
	} = useGoogleSignIn({ enabled: googleEnabled, onCredential: handleGoogleCredential })

	const fieldStyle: CSSProperties = {
		width: '100%',
		border: `1.5px solid ${p.border}`,
		borderRadius: 11,
		padding: '13px 15px',
		fontSize: 15,
		fontFamily: "'Plus Jakarta Sans'",
		color: p.ink,
		background: p.surface,
		outline: 'none',
		boxSizing: 'border-box',
	}
	const googleButtonStyle: CSSProperties = {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		fontFamily: "'Plus Jakarta Sans'",
		fontWeight: 600,
		fontSize: 15,
		color: p.muted,
		background: p.surface,
		border: `1.5px solid ${p.border}`,
		borderRadius: 11,
		padding: 13,
		cursor: 'not-allowed',
	}

	/**
	 * Google's own button when configured; otherwise the styled fallback,
	 * disabled and explaining why rather than failing on click.
	 */
	const googleSection = googleEnabled ? (
		<>
			<div ref={googleRef} style={{ display: 'flex', justifyContent: 'center' }} />
			{!googleReady && !googleError && (
				<div style={{ fontSize: 13, color: p.muted, textAlign: 'center' }}>Loading Google sign-in…</div>
			)}
			{googleError && (
				<div role='alert' style={{ fontSize: 13, color: '#B4232A', textAlign: 'center' }}>{googleError}</div>
			)}
		</>
	) : (
		<button
			type='button'
			disabled
			title='Set GOOGLE_CLIENT_ID on the server and VITE_GOOGLE_CLIENT_ID in the client to enable Google sign-in.'
			style={googleButtonStyle}
		>
			<GoogleIcon />
			Google sign-in not configured
		</button>
	)

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

					<form onSubmit={handleSubmit} noValidate>
						<label htmlFor='auth-email' style={{ display: 'block', fontSize: 13, fontWeight: 600, color: p.body, marginBottom: 7 }}>Email</label>
						<input
							id='auth-email'
							type='email'
							name='email'
							autoComplete='email'
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='you@university.edu'
							style={{ ...fieldStyle, marginBottom: 16 }}
						/>
						<label htmlFor='auth-password' style={{ display: 'block', fontSize: 13, fontWeight: 600, color: p.body, marginBottom: 7 }}>Password</label>
						<input
							id='auth-password'
							type='password'
							name='password'
							autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={mode === 'login' ? '••••••••' : `At least ${MIN_PASSWORD_LENGTH} characters`}
							style={{ ...fieldStyle, marginBottom: mode === 'login' ? 8 : 24 }}
						/>
						{mode === 'login' && <div style={{ textAlign: 'right', marginBottom: 20 }}><span style={{ fontSize: 13, fontWeight: 600, color: p.accent, cursor: 'pointer' }}>Forgot password?</span></div>}

						{error && (
							<div role='alert' style={{ background: p.isDark ? 'rgba(180,35,42,0.16)' : '#FDECEC', border: '1px solid rgba(180,35,42,0.35)', color: p.isDark ? '#FF9A9F' : '#B4232A', borderRadius: 10, padding: '10px 13px', fontSize: 13.5, marginBottom: 16 }}>
								{error}
							</div>
						)}

						<button
							type='submit'
							disabled={submitting}
							style={{ width: '100%', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 11, padding: 14, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1, marginBottom: 18 }}
						>
							{submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
						</button>
					</form>

					<div style={{ display: 'flex', alignItems: 'center', gap: 12, color: p.muted, fontSize: 13, marginBottom: 18 }}><span style={{ flex: 1, height: 1, background: p.borderSubtle }} />or<span style={{ flex: 1, height: 1, background: p.borderSubtle }} /></div>
					{googleSection}

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
