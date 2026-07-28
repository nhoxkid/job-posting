import type { RoleVaultScreen } from '../../features/rolevault/types'
import { usePalette } from '../../lib/palette'
import { Clickable } from '../../components/ui/Clickable'
import { ThemeToggle } from '../ui/ThemeToggle'

export const Logo = ({ size = 26 }: { size?: number }) => {
	const p = usePalette()
	return (
		<div style={{ width: size, height: size, background: p.accentButtonBg, borderRadius: '4px 13px 4px 13px', flexShrink: 0 }} />
	)
}

export const NavBar = ({ screen, go, variant = 'default' }: { screen: RoleVaultScreen; go: (s: RoleVaultScreen) => void; variant?: 'default' | 'auth' }) => {
	const p = usePalette()
	if (variant === 'auth') return null
	return (
		<div style={{ position: 'sticky', top: 0, zIndex: 40, background: p.navBg, WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${p.borderSubtle}` }}>
			<div style={{ maxWidth: 1180, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', gap: 30 }}>
				<Clickable as='div' onClick={() => go('landing')} label='RoleVault home' style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
					<Logo />
					<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color: p.ink }}>RoleVault</span>
				</Clickable>
				<nav style={{ display: 'flex', gap: 26, alignItems: 'center', marginLeft: 8 }}>
					{(['browse', 'recommended', 'faq'] as const).map((item) => {
						const labels: Record<string, string> = { browse: 'Browse', recommended: 'Recommended', faq: 'FAQ' }
						return (
							<Clickable key={item} onClick={() => go(item)} className='rv-nav-link' style={{ fontWeight: screen === item ? 700 : 600, fontSize: 15, color: screen === item ? p.ink : p.body }}>
								{labels[item]}
							</Clickable>
						)
					})}
				</nav>
				{screen === 'landing' ? (
					<div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
						<ThemeToggle />
						<button onClick={() => go('login')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: p.accent, background: p.surface, border: `1.5px solid ${p.accentBorder}`, borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Log In</button>
						<button onClick={() => go('register')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>Sign up</button>
					</div>
				) : (
					<div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
						<ThemeToggle />
						<button onClick={() => go('profile')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: screen === 'profile' ? 700 : 600, fontSize: 15, color: p.accent, background: screen === 'profile' ? p.accentSoftBg : p.surface, border: `1.5px solid ${p.accentBorder}`, borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>My Profile</button>
					</div>
				)}
			</div>
		</div>
	)
}
