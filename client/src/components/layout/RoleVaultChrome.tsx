import { useNavigate } from 'react-router-dom'
import { PATH_BY_SCREEN } from '../../features/rolevault/routes'
import type { RoleVaultScreen } from '../../features/rolevault/types'
import { usePalette } from '../../lib/palette'
import { useAuth } from '../../providers/auth-context'
import { ThemeToggle } from '../ui/ThemeToggle'

export const Logo = ({ size = 26 }: { size?: number }) => {
	const p = usePalette()
	return (
		<div style={{ width: size, height: size, background: p.accentButtonBg, borderRadius: '4px 13px 4px 13px', flexShrink: 0 }} />
	)
}

export const NavBar = ({ screen, go, variant = 'default' }: { screen: RoleVaultScreen; go: (s: RoleVaultScreen) => void; variant?: 'default' | 'auth' }) => {
	const p = usePalette()
	const { user, loading, logout } = useAuth()
	const navigate = useNavigate()

	const signOut = async () => {
		await logout()
		navigate(PATH_BY_SCREEN.landing)
	}

	if (variant === 'auth') return null
	return (
		<div style={{ position: 'sticky', top: 0, zIndex: 40, background: p.navBg, backdropFilter: 'blur(8px)', borderBottom: `1px solid ${p.borderSubtle}` }}>
			<div style={{ maxWidth: 1180, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', gap: 30 }}>
				<div onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
					<Logo />
					<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color: p.ink }}>RoleVault</span>
				</div>
				<nav style={{ display: 'flex', gap: 26, alignItems: 'center', marginLeft: 8 }}>
					{(['browse', 'recommended', 'faq'] as const).map((item) => {
						const labels: Record<string, string> = { browse: 'Browse', recommended: 'Recommended', faq: 'FAQ' }
						return (
							<span key={item} onClick={() => go(item)} className="v1-nav-link" style={{ fontWeight: screen === item ? 700 : 600, fontSize: 15, color: screen === item ? p.ink : p.body, cursor: 'pointer' }}>
								{labels[item]}
							</span>
						)
					})}
				</nav>
				{/* Keyed on the session, not on which screen you happen to be looking at.
				    Keying it on `screen` meant the landing page always offered Log In and
				    Sign up, so clicking the logo made a signed-in user look signed out.
				    While the session check is in flight we show neither, to avoid a flash
				    of the wrong pair on refresh. */}
				<div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
					<ThemeToggle />
					{loading ? null : user ? (
						<>
							<button onClick={() => go('profile')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: screen === 'profile' ? 700 : 600, fontSize: 15, color: p.accent, background: screen === 'profile' ? p.accentSoftBg : p.surface, border: `1.5px solid ${p.accentBorder}`, borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>My Profile</button>
							<button onClick={signOut} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: p.body, background: 'transparent', border: `1.5px solid ${p.borderSubtle}`, borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Sign out</button>
						</>
					) : (
						<>
							<button onClick={() => go('login')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: p.accent, background: p.surface, border: `1.5px solid ${p.accentBorder}`, borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Log In</button>
							<button onClick={() => go('register')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>Sign up</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
