import { useEffect, useState } from 'react'
import { Logo } from '../../../components/layout/RoleVaultChrome'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'
import { fetchJobById } from '../../../api/clientApi'
import type { Job } from '../../../types/job'
import type { RoleVaultScreen } from '../types'

export type DetailScreenProps = {
	go: (s: RoleVaultScreen) => void
	jobId: number | null
}

export function DetailScreen({ go, jobId }: DetailScreenProps) {
	const [job, setJob] = useState<Job | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const p = usePalette()

	useEffect(() => {
		if (!jobId) return
		setLoading(true)
		fetchJobById(jobId).then((data) => {
			setJob(data || null)
			setLoading(false)
		})
	}, [jobId])

	const typeLabel = job?.jobType === 'new grad' ? 'New Grad' : 'Internship'

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
				{loading ? (
					<div style={{ padding: 60, textAlign: 'center', color: p.muted, fontSize: 16 }}>Loading role details and AI summaries...</div>
				) : (
					<>
						<div style={{ position: 'relative', overflow: 'hidden', background: p.heroPanelGradient, borderRadius: 22, padding: 30, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
							<div aria-hidden='true' style={{ position: 'absolute', top: -100, right: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(95,214,160,0.3),transparent 65%)', filter: 'blur(20px)' }} />
							<div style={{ position: 'relative', width: 66, height: 66, borderRadius: 16, background: p.floatCardBg, color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 20 }}>
								{job?.employerName ? job.employerName.slice(0, 2).toUpperCase() : 'RV'}
							</div>
							<div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
								<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 6px', color: p.heroInk }}>{job?.position}</h1>
								<div style={{ fontSize: 15, color: p.heroInkMuted }}>{job?.employerName} · {job?.jobLocation} · Posted {job?.postingDate}</div>
								<div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
									<span style={{ fontWeight: 600, fontSize: 12.5, color: p.buttonInk, background: p.heroGlow, borderRadius: 999, padding: '5px 12px' }}>
										{job?.sponsorshipAvailable ? '✓ Sponsorship Available' : '✕ No Sponsorship'}
									</span>
									<span style={{ fontWeight: 600, fontSize: 12.5, color: p.heroInk, background: p.heroChipBg, border: `1px solid ${p.heroBorder}`, borderRadius: 999, padding: '5px 12px' }}>{typeLabel}</span>
									<span style={{ fontWeight: 600, fontSize: 12.5, color: p.heroInk, background: p.heroChipBg, border: `1px solid ${p.heroBorder}`, borderRadius: 999, padding: '5px 12px' }}>{job?.workModel || 'In-person'}</span>
								</div>
							</div>
							<button
								onClick={() => job?.applicationLink && window.open(job.applicationLink, '_blank')}
								style={{ position: 'relative', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16, color: p.buttonInk, background: p.buttonGradient, border: 'none', borderRadius: 13, padding: '15px 32px', cursor: 'pointer', boxShadow: p.buttonShadow }}
							>
								↗ Apply
							</button>
						</div>

						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 20 }}>
							{[
								{ label: 'AI Role Summary', text: job?.jobSummary || 'AI role summary is not available for this posting yet. Please visit the link by clicking Apply to see the role and company description.' },
								{ label: 'AI Company Summary', text: job?.companySummary || 'AI company summary is not available for this posting yet. Please visit the link by clicking Apply to see the role and company description.' },
							].map((card) => (
								<div key={card.label} style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: 24, boxShadow: p.shadow, height: 240, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
									<div style={{ display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', flexShrink: 0, gap: 7, background: p.accentSoftBg, color: p.accent, fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 999, marginBottom: 14 }}><span style={{ width: 6, height: 6, background: p.accent, borderRadius: '50%' }} />{card.label}</div>
									<p
										className='rv-summary-scroll'
										role='region'
										aria-label={`${card.label} content`}
										tabIndex={0}
										style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 9, fontSize: 14.5, lineHeight: 1.65, color: p.body, margin: 0, whiteSpace: 'pre-wrap' }}
									>
										{card.text}
									</p>
								</div>
							))}
						</div>

						<div style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: '26px 28px', marginTop: 20, boxShadow: p.shadow }}>
							<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 22px', color: p.ink }}>Role Details</h2>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 32px' }}>
								{[
									{ l: 'Location', v: job?.jobLocation || 'San Francisco, CA' },
									{ l: 'Work Model', v: job?.workModel || 'In-person' },
									{ l: 'Season', v: job?.season || 'Summer 2027' },
									{ l: 'Source', v: job?.sourceRepo || 'GitHub' },
								].map((d) => (
									<div key={d.l}><div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: p.muted, marginBottom: 4 }}>{d.l}</div><div style={{ fontSize: 15, color: p.ink }}>{d.v}</div></div>
								))}
							</div>
							<div style={{ borderTop: `1px solid ${p.borderSubtle}`, marginTop: 24, paddingTop: 18 }}>
								<button onClick={() => job?.applicationLink && window.open(job.applicationLink, '_blank')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: p.body, background: p.surface, border: `1.5px solid ${p.border}`, borderRadius: 11, padding: '9px 18px', cursor: 'pointer' }}>↗ Open Application Page</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
