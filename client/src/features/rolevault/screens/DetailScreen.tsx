import { Logo } from '../../../components/layout/RoleVaultChrome'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'
import jobsData from '../../../api/mockDb'
import type { RoleVaultScreen } from '../types'

export type DetailScreenProps = {
	go: (s: RoleVaultScreen) => void
	jobId: number | null
}

export function DetailScreen({ go, jobId }: DetailScreenProps) {
	const job = jobId ? jobsData.find((j) => j.id === jobId) : jobsData[0]
	const p = usePalette()
	return (
		<div style={{ animation: 'spr-up .35s ease both', background: p.pageBg, color: p.ink, minHeight: '100vh' }}>
			<div style={{ position: 'sticky', top: 0, zIndex: 40, background: p.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${p.border}` }}>
				<div style={{ maxWidth: 1080, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
						<Logo />
						<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color: p.ink }}>RoleVault</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
						<ThemeToggle />
						<span onClick={() => go('browse')} className='v1-nav-link' style={{ fontWeight: 600, fontSize: 15, color: p.body, cursor: 'pointer' }}>← Back to listings</span>
					</div>
				</div>
			</div>

			<div style={{ maxWidth: 1080, margin: '0 auto', padding: 28 }}>
				<div style={{ position: 'relative', overflow: 'hidden', background: p.heroPanelGradient, borderRadius: 22, padding: 30, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
					<div aria-hidden='true' style={{ position: 'absolute', top: -100, right: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(95,214,160,0.3),transparent 65%)', filter: 'blur(20px)' }} />
					<div style={{ position: 'relative', width: 66, height: 66, borderRadius: 16, background: p.floatCardBg, color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 20 }}>AL</div>
					<div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
						<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 6px', color: p.heroInk }}>{job?.title}</h1>
						<div style={{ fontSize: 15, color: p.heroInkMuted }}>{job?.company} · {job?.loc} · Posted {job?.posted}</div>
						<div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
							<span style={{ fontWeight: 600, fontSize: 12.5, color: p.buttonInk, background: p.heroGlow, borderRadius: 999, padding: '5px 12px' }}>✓ Sponsorship</span>
							<span style={{ fontWeight: 600, fontSize: 12.5, color: p.heroInk, background: p.heroChipBg, border: `1px solid ${p.heroBorder}`, borderRadius: 999, padding: '5px 12px' }}>Internship</span>
							<span style={{ fontWeight: 600, fontSize: 12.5, color: p.heroInk, background: p.heroChipBg, border: `1px solid ${p.heroBorder}`, borderRadius: 999, padding: '5px 12px' }}>102 applicants</span>
						</div>
					</div>
					<button style={{ position: 'relative', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16, color: p.buttonInk, background: p.buttonGradient, border: 'none', borderRadius: 13, padding: '15px 32px', cursor: 'pointer', boxShadow: p.buttonShadow }}>↗ Apply</button>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 20 }}>
					{[
						{ label: 'AI Role Summary', text: 'This SWE Intern role centres on building internal tooling and APIs in Python and Node.js. Expect to ship production code within your first weeks, pair with senior engineers, and own a small project by end of term. A strong fit for students with backend coursework or a prior internship.' },
						{ label: 'AI Company Summary', text: 'ACME Labs is a 400-person infrastructure company building developer tooling used by 12,000+ teams. Interns are treated as full engineers, with a structured mentorship program and a strong return-offer track record. Visa sponsorship is available for full-time conversions.' },
					].map((card) => (
						<div key={card.label} style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: 24, boxShadow: p.shadow }}>
							<div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: p.accentSoftBg, color: p.accent, fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 999, marginBottom: 14 }}><span style={{ width: 6, height: 6, background: p.accent, borderRadius: '50%' }} />{card.label}</div>
							<p style={{ fontSize: 14.5, lineHeight: 1.65, color: p.body, margin: 0 }}>{card.text}</p>
						</div>
					))}
				</div>

				<div style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: '26px 28px', marginTop: 20, boxShadow: p.shadow }}>
					<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 22px', color: p.ink }}>Role Details</h2>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 32px' }}>
						{[{ l: 'Location', v: 'San Francisco, CA (Hybrid)' }, { l: 'Duration', v: '16 weeks' }, { l: 'Term', v: 'Summer 2026' }, { l: 'Compensation', v: '$45 / hour' }].map((d) => (
							<div key={d.l}><div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: p.muted, marginBottom: 4 }}>{d.l}</div><div style={{ fontSize: 15, color: p.ink }}>{d.v}</div></div>
						))}
					</div>
					<div style={{ borderTop: `1px solid ${p.borderSubtle}`, marginTop: 24, paddingTop: 18 }}>
						<button style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: p.body, background: p.surface, border: `1.5px solid ${p.border}`, borderRadius: 11, padding: '9px 18px', cursor: 'pointer' }}>↗ Share</button>
					</div>
				</div>
			</div>
		</div>
	)
}
