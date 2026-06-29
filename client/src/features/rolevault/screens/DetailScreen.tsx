import { Logo } from '../../../components/layout/RoleVaultChrome'
import jobsData from '../../../api/mockDb'
import type { RoleVaultScreen } from '../types'

export type DetailScreenProps = {
	go: (s: RoleVaultScreen) => void
	jobId: number | null
}

export function DetailScreen({ go, jobId }: DetailScreenProps) {
	const job = jobId ? jobsData.find((j) => j.id === jobId) : jobsData[0]
	return (
		<div style={{ animation: 'spr-up .35s ease both', background: '#F6F8F5', minHeight: '100vh' }}>
			<div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E6ECE7' }}>
				<div style={{ maxWidth: 1080, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
						<Logo />
						<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em' }}>RoleVault</span>
					</div>
					<span onClick={() => go('browse')} className='v1-nav-link' style={{ fontWeight: 600, fontSize: 15, color: '#46554F', cursor: 'pointer' }}>← Back to listings</span>
				</div>
			</div>

			<div style={{ maxWidth: 1080, margin: '0 auto', padding: 28 }}>
				<div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#0C4030,#08231A)', borderRadius: 22, padding: 30, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
					<div aria-hidden='true' style={{ position: 'absolute', top: -100, right: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(95,214,160,0.3),transparent 65%)', filter: 'blur(20px)' }} />
					<div style={{ position: 'relative', width: 66, height: 66, borderRadius: 16, background: 'rgba(255,255,255,0.95)', color: '#12805A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 20 }}>AL</div>
					<div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
						<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#fff' }}>{job?.title}</h1>
						<div style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)' }}>{job?.company} · {job?.loc} · Posted {job?.posted}</div>
						<div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
							<span style={{ fontWeight: 600, fontSize: 12.5, color: '#06281D', background: '#5FD6A0', borderRadius: 999, padding: '5px 12px' }}>✓ Sponsorship</span>
							<span style={{ fontWeight: 600, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '5px 12px' }}>Internship</span>
							<span style={{ fontWeight: 600, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '5px 12px' }}>102 applicants</span>
						</div>
					</div>
					<button style={{ position: 'relative', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16, color: '#06281D', background: 'linear-gradient(180deg,#7CE7B0,#46C98A)', border: 'none', borderRadius: 13, padding: '15px 32px', cursor: 'pointer', boxShadow: '0 12px 26px -8px rgba(70,201,138,0.6)' }}>↗ Apply</button>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 20 }}>
					{[
						{ label: 'AI Role Summary', text: 'This SWE Intern role centres on building internal tooling and APIs in Python and Node.js. Expect to ship production code within your first weeks, pair with senior engineers, and own a small project by end of term. A strong fit for students with backend coursework or a prior internship.' },
						{ label: 'AI Company Summary', text: 'ACME Labs is a 400-person infrastructure company building developer tooling used by 12,000+ teams. Interns are treated as full engineers, with a structured mentorship program and a strong return-offer track record. Visa sponsorship is available for full-time conversions.' },
					].map((card) => (
						<div key={card.label} style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: 24, boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
							<div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#E7F3EC', color: '#12805A', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 999, marginBottom: 14 }}><span style={{ width: 6, height: 6, background: '#12805A', borderRadius: '50%' }} />{card.label}</div>
							<p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#46554F', margin: 0 }}>{card.text}</p>
						</div>
					))}
				</div>

				<div style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: '26px 28px', marginTop: 20, boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
					<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 22px' }}>Role Details</h2>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 32px' }}>
						{[{ l: 'Location', v: 'San Francisco, CA (Hybrid)' }, { l: 'Duration', v: '16 weeks' }, { l: 'Term', v: 'Summer 2026' }, { l: 'Compensation', v: '$45 / hour' }].map((d) => (
							<div key={d.l}><div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8B988F', marginBottom: 4 }}>{d.l}</div><div style={{ fontSize: 15, color: '#10211B' }}>{d.v}</div></div>
						))}
					</div>
					<div style={{ borderTop: '1px solid #EEF2EF', marginTop: 24, paddingTop: 18 }}>
						<button style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: '#46554F', background: '#fff', border: '1.5px solid #E6ECE7', borderRadius: 11, padding: '9px 18px', cursor: 'pointer' }}>↗ Share</button>
					</div>
				</div>
			</div>
		</div>
	)
}
