import { useEffect, useState } from 'react'
import { Logo } from '../../../components/layout/RoleVaultChrome'
import { Clickable } from '../../../components/ui/Clickable'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'
import { formatRelativeTime } from '../../../lib/format'
import { SPONSORSHIP_LABELS } from '../../../components/ui/SponsorshipBadge'
import { companyInitials } from '../../jobs/rolevault'
import { fetchJobById } from '../../../api/clientApi'
import type { Job } from '../../../types/job'
import type { RoleVaultScreen } from '../types'

export type DetailScreenProps = {
	go: (s: RoleVaultScreen) => void
	jobId: string | null
}

export function DetailScreen({ go, jobId }: DetailScreenProps) {
	const p = usePalette()
	const [job, setJob] = useState<Job | null>(null)
	const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading')

	// Fetched by id rather than read out of the list, so the screen still works
	// on a direct load or a refresh, when no list request has run.
	useEffect(() => {
		if (!jobId) {
			setStatus('missing')
			return
		}
		let active = true
		setStatus('loading')
		fetchJobById(jobId).then((found) => {
			if (!active) return
			setJob(found ?? null)
			setStatus(found ? 'ready' : 'missing')
		})
		return () => {
			active = false
		}
	}, [jobId])

	const chip = {
		fontWeight: 600,
		fontSize: 12.5,
		color: p.heroInk,
		background: p.heroChipBg,
		border: `1px solid ${p.heroBorder}`,
		borderRadius: 999,
		padding: '5px 12px',
	}

	return (
		<div style={{ animation: 'spr-up .35s ease both', background: p.pageBg, color: p.ink, minHeight: '100vh' }}>
			<div style={{ position: 'sticky', top: 0, zIndex: 40, background: p.navBg, WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${p.border}` }}>
				<div style={{ maxWidth: 1080, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Clickable as='div' onClick={() => go('landing')} label='RoleVault home' style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<Logo />
						<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color: p.ink }}>RoleVault</span>
					</Clickable>
					<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
						<ThemeToggle />
						<Clickable onClick={() => go('browse')} className='rv-nav-link' style={{ fontWeight: 600, fontSize: 15, color: p.body }}>← Back to listings</Clickable>
					</div>
				</div>
			</div>

			<div style={{ maxWidth: 1080, margin: '0 auto', padding: 28 }}>
				{status === 'loading' && (
					<div style={{ padding: 60, textAlign: 'center', color: p.muted }}>Loading job…</div>
				)}

				{status === 'missing' && (
					<div style={{ padding: 60, textAlign: 'center' }}>
						<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 22, marginBottom: 8, color: p.ink }}>Job not found</div>
						<div style={{ color: p.muted, marginBottom: 18 }}>It may have been filled or removed since it was listed.</div>
						<button onClick={() => go('browse')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 10, padding: '11px 18px', cursor: 'pointer' }}>Back to listings</button>
					</div>
				)}

				{status === 'ready' && job && (
					<>
						<div style={{ position: 'relative', overflow: 'hidden', background: p.heroPanelGradient, borderRadius: 22, padding: 30, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
							<div aria-hidden='true' style={{ position: 'absolute', top: -100, right: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(95,214,160,0.3),transparent 65%)', filter: 'blur(20px)' }} />
							<div style={{ position: 'relative', width: 66, height: 66, borderRadius: 16, background: p.floatCardBg, color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 20 }}>{companyInitials(job.company)}</div>
							<div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
								<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 6px', color: p.heroInk }}>{job.title}</h1>
								<div style={{ fontSize: 15, color: p.heroInkMuted }}>{job.company} · {job.loc} · Posted {formatRelativeTime(job.postedAt)}</div>
								<div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
									{/* On the dark hero band the shared badge's light-surface
									    colours wouldn't read, so the hero styles it itself —
									    but the wording stays identical to everywhere else. */}
									<span
										style={
											job.sponsorship === 'yes'
												? { ...chip, color: p.buttonInk, background: p.heroGlow, border: 'none' }
												: job.sponsorship === 'no'
													? chip
													: { ...chip, border: `1px dashed ${p.heroBorder}`, background: 'transparent' }
										}
									>
										{SPONSORSHIP_LABELS[job.sponsorship]}
									</span>
									<span style={chip}>{job.type}</span>
									<span style={chip}>{job.workModel}</span>
									<span style={chip}>{job.applied} applicants</span>
								</div>
							</div>
							<a href={job.applyUrl} target='_blank' rel='noopener noreferrer' style={{ position: 'relative', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 16, color: p.buttonInk, background: p.buttonGradient, border: 'none', borderRadius: 13, padding: '15px 32px', cursor: 'pointer', boxShadow: p.buttonShadow, textDecoration: 'none' }}>↗ Apply</a>
						</div>

						{job.skills.length > 0 && (
							<div style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: '22px 28px', marginTop: 20, boxShadow: p.shadow }}>
								<div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: p.muted, marginBottom: 12 }}>Skills</div>
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
									{job.skills.map((skill) => (
										<span key={skill} style={{ fontWeight: 600, fontSize: 13.5, color: p.accent, background: p.accentSoftBg, border: `1px solid ${p.accentBorder}`, borderRadius: 9, padding: '7px 14px' }}>{skill}</span>
									))}
								</div>
							</div>
						)}

						<div style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: '26px 28px', marginTop: 20, boxShadow: p.shadow }}>
							<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 18px', color: p.ink }}>Job description</h2>
							{/* Rendered as pre-wrapped text, never as HTML. The body comes
							    from third-party feeds, and normalisation already stripped it
							    to plain text — injecting it as markup would hand an upstream
							    source script execution on this page. */}
							<p style={{ fontSize: 15, lineHeight: 1.7, color: p.body, margin: 0, whiteSpace: 'pre-wrap' }}>
								{job.description || 'No description was provided for this posting.'}
							</p>
						</div>

						<div style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: '26px 28px', marginTop: 20, boxShadow: p.shadow }}>
							<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 22px', color: p.ink }}>Role details</h2>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 32px' }}>
								{[
									{ l: 'Location', v: job.loc },
									{ l: 'Work model', v: job.workModel },
									{ l: 'Type', v: job.type },
									{ l: 'Region', v: job.region },
									{
										l: 'Sponsorship',
										v: { yes: 'Available', no: 'Not offered', unknown: 'Not stated by this posting' }[job.sponsorship],
									},
									{ l: 'Listed via', v: job.source },
								].map((d) => (
									<div key={d.l}>
										<div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: p.muted, marginBottom: 4 }}>{d.l}</div>
										<div style={{ fontSize: 15, color: p.ink }}>{d.v}</div>
									</div>
								))}
							</div>
							<div style={{ borderTop: `1px solid ${p.borderSubtle}`, marginTop: 24, paddingTop: 18 }}>
								<a href={job.applyUrl} target='_blank' rel='noopener noreferrer' style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: p.accent, background: p.surface, border: `1.5px solid ${p.accentBorder}`, borderRadius: 11, padding: '9px 18px', cursor: 'pointer', textDecoration: 'none' }}>↗ View original posting</a>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
