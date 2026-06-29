import { NavBar } from '../../../components/layout/RoleVaultChrome'
import type { RoleVaultScreen } from '../types'

export type RecommendedScreenProps = {
	go: (s: RoleVaultScreen) => void
	recommendations: any[]
	selectJob: (id?: number) => void
	resumeName: string | null
}

export function RecommendedScreen({ go, recommendations, selectJob, resumeName }: RecommendedScreenProps) {
	return (
		<div style={{ animation: 'spr-up .35s ease both' }}>
			<NavBar screen='recommended' go={go} />
			<div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px 48px' }}>
				<div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
					<div>
						<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Recommended for you</h1>
						<p style={{ fontSize: 14.5, color: '#7A8780', margin: 0 }}>{resumeName ? `Ranked by match to ${resumeName}` : 'Upload a resume to unlock recommendations.'}</p>
					</div>
					<button onClick={() => go('onboarding')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: '#15603F', background: '#fff', border: '1.5px solid #CFE0D7', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>↻ Update Resume</button>
				</div>
				{recommendations.length ? (
					<>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
							{recommendations.slice(0, 5).map((r) => (
								<div key={r.job.id} onClick={() => selectJob(r.job.id)} className='v1-rec-card' style={{ background: '#fff', border: '1px solid #E8EDEB', borderRadius: 16, padding: '22px 24px', cursor: 'pointer', display: 'flex', gap: 20, alignItems: 'center', transition: 'box-shadow .15s,border-color .15s' }}>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
											<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 17 }}>{r.job.title} · {r.job.company}</span>
											<span style={{ fontSize: 13.5, color: '#7A8780' }}>{r.job.loc} · {r.job.posted}</span>
										</div>
										<div style={{ fontSize: 14, color: '#46554F', marginBottom: 12 }}><span style={{ color: '#8B988F' }}>Matches:</span> {r.matches.join(', ')} <span style={{ color: '#15603F', fontWeight: 600 }}>— {r.matches.length} of {r.job.skills.length} skills detected</span></div>
										<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
											{r.job.spons ? <span style={{ fontWeight: 600, fontSize: 12, color: '#15603F', background: '#EAF4EE', borderRadius: 999, padding: '4px 11px' }}>✓ Sponsorship</span> : <span style={{ fontWeight: 600, fontSize: 12, color: '#7A8780', background: '#F1F4F2', borderRadius: 999, padding: '4px 11px' }}>✗ No sponsorship</span>}
											<span style={{ fontWeight: 600, fontSize: 12, color: '#3A4A44', background: '#fff', border: '1px solid #E3E9E6', borderRadius: 999, padding: '4px 11px' }}>{r.job.type}</span>
											<span style={{ fontSize: 12.5, color: '#9AA8A2' }}>{r.job.applied} applications</span>
										</div>
									</div>
									<div style={{ textAlign: 'center', flexShrink: 0, width: 96 }}>
										<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, color: '#1A7A52', lineHeight: 1 }}>{r.score}%</div>
										<div style={{ fontSize: 12, fontWeight: 600, color: '#8B988F', marginTop: 3, letterSpacing: '0.03em' }}>MATCH</div>
									</div>
								</div>
							))}
						</div>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7F9F8', border: '1px solid #ECF0EE', borderRadius: 14, padding: '16px 22px', marginTop: 18 }}>
							<span style={{ fontSize: 14, color: '#7A8780' }}>Showing top <strong style={{ color: '#10211B' }}>{Math.min(5, recommendations.length)}</strong> of {recommendations.length} matches</span>
							<span style={{ fontSize: 14, fontWeight: 600, color: '#1A7A52', cursor: 'pointer' }}>Load more →</span>
						</div>
					</>
				) : (
					<div style={{ border: '1px dashed #C5DBCD', borderRadius: 18, padding: 40, background: '#F7FBF8', textAlign: 'center' }}>
						<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, marginBottom: 8 }}>No recommendations yet</div>
						<div style={{ color: '#7A8780', fontSize: 15, lineHeight: 1.6, maxWidth: 560, margin: '0 auto 18px' }}>Upload a PDF resume so RoleVault can detect your skills and surface the five best matches here.</div>
						<button onClick={() => go('onboarding')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: '#fff', background: '#1A7A52', border: 'none', borderRadius: 11, padding: '13px 22px', cursor: 'pointer' }}>Upload resume</button>
					</div>
				)}
			</div>
		</div>
	)
}
