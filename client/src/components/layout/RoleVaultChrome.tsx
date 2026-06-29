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
