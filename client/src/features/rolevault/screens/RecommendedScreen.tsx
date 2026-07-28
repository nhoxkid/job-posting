import { NavBar } from '../../../components/layout/RoleVaultChrome'
import { usePalette } from '../../../lib/palette'
import type { RoleVaultScreen } from '../types'

export type RecommendedScreenProps = {
	go: (s: RoleVaultScreen) => void
	recommendations: any[]
	selectJob: (id?: number) => void
	resumeName: string | null
}

export function RecommendedScreen({ go, recommendations, selectJob, resumeName }: RecommendedScreenProps) {
	const p = usePalette()
	return (
		<div style={{ animation: 'spr-up .35s ease both', background: p.pageBg, color: p.ink, minHeight: '100vh' }}>
			<NavBar screen='recommended' go={go} />
			<div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px 48px' }}>
				<div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
					<div>
						<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 4px', color: p.ink }}>Recommended for you</h1>
						<p style={{ fontSize: 14.5, color: p.muted, margin: 0 }}>{resumeName ? `Ranked by match to ${resumeName}` : 'Upload a resume to unlock recommendations.'}</p>
					</div>
					<button onClick={() => go('onboarding')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: p.accent, background: p.surface, border: `1.5px solid ${p.accentBorder}`, borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>↻ Update Resume</button>
				</div>
				{recommendations.length ? (
					<>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
							{recommendations.slice(0, 5).map((r) => {
								const typeLabel = r.job.jobType === 'new grad' ? 'New Grad' : 'Internship'
								return (
								<div key={r.job.jobId} onClick={() => selectJob(r.job.jobId)} className='rv-rec-card' style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 16, padding: '22px 24px', cursor: 'pointer', display: 'flex', gap: 20, alignItems: 'center', transition: 'box-shadow .15s,border-color .15s' }}>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
											<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 17, color: p.ink }}>{r.job.position} · {r.job.employerName}</span>
											<span style={{ fontSize: 13.5, color: p.muted }}>{r.job.jobLocation} · {r.job.postingDate || 'Recent'}</span>
										</div>
										<div style={{ fontSize: 14, color: p.body, marginBottom: 12 }}><span style={{ color: p.muted }}>Matches:</span> {r.matches.join(', ')} <span style={{ color: p.accent, fontWeight: 600 }}>— {r.matches.length} keyword matches</span></div>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
											{r.job.sponsorshipAvailable ? <span style={{ fontWeight: 600, fontSize: 12, color: p.accent, background: p.accentSoftBg, borderRadius: 999, padding: '4px 11px' }}>✓ Sponsorship</span> : <span style={{ fontWeight: 600, fontSize: 12, color: p.muted, background: p.chipBg, borderRadius: 999, padding: '4px 11px' }}>✗ No sponsorship</span>}
											<span style={{ fontWeight: 600, fontSize: 12, color: p.body, background: p.surface, border: `1px solid ${p.border}`, borderRadius: 999, padding: '4px 11px' }}>{typeLabel}</span>
										</div>
									</div>
									<div style={{ textAlign: 'center', flexShrink: 0, width: 96 }}>
										<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, color: p.accent, lineHeight: 1 }}>{r.score}%</div>
										<div style={{ fontSize: 12, fontWeight: 600, color: p.muted, marginTop: 3, letterSpacing: '0.03em' }}>MATCH</div>
									</div>
								</div>
								)
							})}
						</div>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: p.surfaceMuted, border: `1px solid ${p.borderSubtle}`, borderRadius: 14, padding: '16px 22px', marginTop: 18 }}>
							<span style={{ fontSize: 14, color: p.muted }}>Showing top <strong style={{ color: p.ink }}>{Math.min(5, recommendations.length)}</strong> of {recommendations.length} matches</span>
							<span style={{ fontSize: 14, fontWeight: 600, color: p.accent, cursor: 'pointer' }}>Load more →</span>
						</div>
					</>
				) : (
					<div style={{ border: `1px dashed ${p.accentBorder}`, borderRadius: 18, padding: 40, background: p.surfaceMuted, textAlign: 'center' }}>
						<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, marginBottom: 8, color: p.ink }}>No recommendations yet</div>
						<div style={{ color: p.muted, fontSize: 15, lineHeight: 1.6, maxWidth: 560, margin: '0 auto 18px' }}>Upload a PDF resume so RoleVault can detect your skills and surface the five best matches here.</div>
						<button onClick={() => go('onboarding')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 11, padding: '13px 22px', cursor: 'pointer' }}>Upload resume</button>
					</div>
				)}
			</div>
		</div>
	)
}
