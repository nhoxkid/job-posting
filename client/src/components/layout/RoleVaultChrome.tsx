import type { RoleVaultScreen } from '../../features/rolevault/types'

export const Logo = ({ size = 26 }: { size?: number }) => (
	<div style={{ width: size, height: size, background: '#1A7A52', borderRadius: '4px 13px 4px 13px', flexShrink: 0 }} />
)

export const NavBar = ({ screen, go, variant = 'default' }: { screen: RoleVaultScreen; go: (s: RoleVaultScreen) => void; variant?: 'default' | 'auth' }) => {
	if (variant === 'auth') return null
	return (
		<div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #ECF0EE' }}>
			<div style={{ maxWidth: 1180, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', gap: 30 }}>
				<div onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
					<Logo />
					<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em' }}>RoleVault</span>
				</div>
				<nav style={{ display: 'flex', gap: 26, alignItems: 'center', marginLeft: 8 }}>
					{(['browse', 'recommended', 'faq'] as const).map((item) => {
						const labels: Record<string, string> = { browse: 'Browse', recommended: 'Recommended', faq: 'FAQ' }
						return (
							<span key={item} onClick={() => go(item)} className="v1-nav-link" style={{ fontWeight: screen === item ? 700 : 600, fontSize: 15, color: screen === item ? '#10211B' : '#3A4A44', cursor: 'pointer' }}>
								{labels[item]}
							</span>
						)
					})}
				</nav>
				{screen === 'landing' ? (
					<div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
						<button onClick={() => go('login')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: '#15603F', background: '#fff', border: '1.5px solid #CFE0D7', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Log In</button>
						<button onClick={() => go('register')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: '#fff', background: '#10211B', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>Sign up</button>
					</div>
				) : (
					<button onClick={() => go('profile')} style={{ marginLeft: 'auto', fontFamily: "'Plus Jakarta Sans'", fontWeight: screen === 'profile' ? 700 : 600, fontSize: 15, color: '#15603F', background: screen === 'profile' ? '#EAF4EE' : '#fff', border: '1.5px solid #CFE0D7', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>My Profile</button>
				)}
			</div>
		</div>
	)
}

export const Switcher = ({ screen, go }: { screen: RoleVaultScreen; go: (s: RoleVaultScreen) => void }) => {
	const screens: { key: RoleVaultScreen; label: string }[] = [
		{ key: 'landing', label: 'Home' }, { key: 'browse', label: 'Browse' }, { key: 'detail', label: 'Job Detail' },
		{ key: 'login', label: 'Login' }, { key: 'register', label: 'Register' }, { key: 'onboarding', label: 'Onboarding' },
		{ key: 'recommended', label: 'Recommended' }, { key: 'profile', label: 'Profile' }, { key: 'faq', label: 'FAQ' },
	]
	return (
		<div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 200, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderTop: '1px solid #E3E9E6', boxShadow: '0 -2px 16px rgba(16,33,27,0.05)' }}>
			<div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 20, height: 52 }}>
				<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9AA8A2', whiteSpace: 'nowrap' }}>Screens</span>
				<div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'stretch', overflowX: 'auto', height: '100%' }}>
					{screens.map((item) => (
						<button key={item.key} onClick={() => go(item.key)} style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: 13, fontWeight: screen === item.key ? 700 : 600, padding: '0 14px', border: 'none', borderBottom: `2px solid ${screen === item.key ? '#12805A' : 'transparent'}`, background: 'transparent', color: screen === item.key ? '#12805A' : '#6A7872', cursor: 'pointer', whiteSpace: 'nowrap', height: '100%', transition: 'color .12s' }}>
							{item.label}
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
