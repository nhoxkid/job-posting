import type { RoleVaultScreen } from '../types'
import type { CSSProperties } from 'react'
import type { Job } from '../../../types/job'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'

/** One pass of the hero ticker. */
const MARQUEE_COMPANIES = ['Northwind', 'Lumen', 'Vela', 'Quanta AI', 'Beacon', 'Forge', 'Acme Labs', 'Halcyon']

/**
 * How many times that list is repeated across the ticker track.
 *
 * The animation scrolls the track by exactly one copy, so the copies that stay
 * on screen must span the viewport on their own: with N copies, the widest
 * viewport the strip can fill is (N - 1) × copyWidth. One copy measures ~966px,
 * so two copies leave a blank tail on anything wider than 966px — six covers
 * past 4800px. The `-100 / N` shift below keeps the two in step.
 */
const MARQUEE_COPIES = 6

export type LandingScreenProps = {
	go: (s: RoleVaultScreen) => void
	selectJob: (id?: number) => void
	featuredHomeJobs: Job[]
}

export function LandingScreen({ go, selectJob, featuredHomeJobs }: LandingScreenProps) {
	const p = usePalette()

	return (
		<div style={{ animation: 'spr-up .35s ease both' }}>
			<section style={{ position: 'relative', overflow: 'hidden', background: p.heroGradient }}>
				<div aria-hidden='true' style={{ position: 'absolute', top: -180, left: -120, width: 620, height: 620, borderRadius: '50%', background: p.auroraA, filter: 'blur(30px)', animation: 'auroraA 20s ease-in-out infinite' }} />
				<div aria-hidden='true' style={{ position: 'absolute', top: -80, right: -160, width: 680, height: 680, borderRadius: '50%', background: p.auroraB, filter: 'blur(36px)', animation: 'auroraB 24s ease-in-out infinite' }} />
				<div aria-hidden='true' style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${p.heroDot} 1px,transparent 1.3px)`, backgroundSize: '28px 28px', WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 40% 30%,#000 30%,transparent 80%)', maskImage: 'radial-gradient(ellipse 90% 80% at 40% 30%,#000 30%,transparent 80%)' }} />

				<div style={{ position: 'relative', zIndex: 3, maxWidth: 1180, margin: '0 auto', padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 30 }}>
					<div onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
						<div style={{ width: 30, height: 30, borderRadius: '6px 16px 6px 16px', background: p.logoGradient, boxShadow: '0 4px 14px rgba(20,148,104,0.45),inset 0 1px 0 rgba(255,255,255,0.3)' }} />
						<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: p.heroInk }}>RoleVault</span>
					</div>
					<nav style={{ display: 'flex', gap: 26, alignItems: 'center', marginLeft: 6 }}>
						<span onClick={() => go('browse')} className='rv-nav-link-dark' style={{ fontWeight: 600, fontSize: 15, color: p.heroInkMuted, cursor: 'pointer' }}>Browse</span>
						<span onClick={() => go('faq')} className='rv-nav-link-dark' style={{ fontWeight: 600, fontSize: 15, color: p.heroInkMuted, cursor: 'pointer' }}>FAQ</span>
					</nav>
					<div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
						<ThemeToggle variant='onDark' />
						<button onClick={() => go('login')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: p.heroInk, background: p.heroChipBg, border: `1px solid ${p.heroBorder}`, borderRadius: 11, padding: '10px 18px', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>Log In</button>
						<button onClick={() => go('register')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: p.buttonInk, background: p.buttonGradient, border: 'none', borderRadius: 11, padding: '11px 20px', cursor: 'pointer', boxShadow: p.buttonShadow }}>Sign up</button>
					</div>
				</div>

				<div style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '46px 28px 64px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 40, alignItems: 'center' }}>
					<div>
						<div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: p.heroChipBg, border: `1px solid ${p.heroBorder}`, color: p.heroAccent, fontWeight: 600, fontSize: 13, padding: '7px 15px', borderRadius: 999, marginBottom: 26, backdropFilter: 'blur(8px)' }}>
							<span style={{ width: 7, height: 7, background: p.heroGlow, borderRadius: '50%', boxShadow: `0 0 10px ${p.heroGlow}`, display: 'inline-block' }} />
							Built for students &amp; new grads
						</div>
						<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 60, lineHeight: 1.02, letterSpacing: '-0.035em', margin: '0 0 20px', color: p.heroInk }}>
							Internships that<br />
							<span style={{ fontFamily: "'Instrument Serif'", fontWeight: 400, fontStyle: 'italic', background: p.heroTitleGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontSize: 66 }}>actually fit</span> you.
						</h1>
						<p style={{ fontSize: 18, lineHeight: 1.55, color: p.heroInkMuted, maxWidth: 480, margin: '0 0 30px' }}>RoleVault ranks every opening by how well it matches your resume — and flags visa sponsorship up front, so you never apply blind.</p>
						<div style={{ display: 'flex', gap: 10, maxWidth: 560 }}>
							<div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 11, background: p.heroChipBg, border: `1px solid ${p.heroBorder}`, borderRadius: 14, padding: '0 16px', backdropFilter: 'blur(14px)' }}>
								<span style={{ color: p.heroInkFaint, fontSize: 17 }}>⚲</span>
								<input placeholder='Search roles, companies, skills...' style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: p.heroInk, fontSize: 15, fontFamily: "'Plus Jakarta Sans'", padding: '16px 0' }} />
							</div>
							<button onClick={() => go('browse')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: p.buttonInk, background: p.buttonGradient, border: 'none', borderRadius: 14, padding: '0 26px', cursor: 'pointer', boxShadow: p.buttonShadow }}>Search</button>
						</div>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
							{['Sponsors visas', 'Remote', 'Internship', 'New Grad'].map((tag, i) => (
								<span key={tag} onClick={() => go('browse')} style={{ fontWeight: 600, fontSize: 13, color: i === 0 ? p.buttonInk : p.heroInkMuted, background: i === 0 ? p.heroGlow : p.heroChipBg, border: i === 0 ? 'none' : `1px solid ${p.heroBorder}`, borderRadius: 999, padding: '7px 14px', cursor: 'pointer' }}>{tag}</span>
							))}
						</div>
						<div style={{ display: 'flex', gap: 30, marginTop: 36 }}>
							<div><div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 24, color: p.heroInk }}>12,000+</div><div style={{ fontSize: 13, color: p.heroInkFaint, marginTop: 2 }}>open roles</div></div>
							<div style={{ width: 1, background: p.heroBorder }} />
							<div><div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 24, color: p.heroInk }}>480</div><div style={{ fontSize: 13, color: p.heroInkFaint, marginTop: 2 }}>companies hiring</div></div>
							<div style={{ width: 1, background: p.heroBorder }} />
							<div><div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 24, color: p.heroGlow }}>92%</div><div style={{ fontSize: 13, color: p.heroInkFaint, marginTop: 2 }}>visa-tagged</div></div>
						</div>
					</div>

					<div style={{ position: 'relative', height: 440 }}>
						<div aria-hidden='true' style={{ position: 'absolute', top: 60, left: 30, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(95,214,160,0.32),transparent 65%)', filter: 'blur(20px)' }} />
						{featuredHomeJobs.slice(0, 3).map((job, index) => {
							const cardLayout = [
								{ top: 10, right: 8, left: undefined, width: 318, delay: '0s', match: 94, spons: true },
								{ top: 190, left: 0, right: undefined, width: 294, delay: '0.5s', match: 88, spons: false },
								{ top: 334, right: 34, left: undefined, width: 286, delay: '0.9s', match: 71, spons: false },
							][index]
							const typeLabel = job.jobType === 'new grad' ? 'New Grad' : 'Internship'
							const initials = job.employerName ? job.employerName.slice(0, 2).toUpperCase() : 'RV'
							return (
								<div key={job.jobId} onClick={() => selectJob(job.jobId)} style={{ position: 'absolute', top: cardLayout.top, right: cardLayout.right, left: cardLayout.left, width: cardLayout.width, cursor: 'pointer', background: p.floatCardBg, color: p.ink, borderRadius: 20, padding: 18, boxShadow: cardLayout.match === 94 ? `0 36px 70px -22px rgba(0,0,0,0.6),0 0 0 2px ${p.heroGlow}` : '0 36px 70px -24px rgba(0,0,0,0.55)', animation: `floaty 6.5s ease-in-out infinite ${cardLayout.delay}` } as CSSProperties}>
									<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
										<div style={{ width: 44, height: 44, borderRadius: 12, background: p.accentSoftBg, color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 15 }}>{initials}</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 15 }}>{job.position}</div>
											<div style={{ fontSize: 12.5, color: p.muted }}>{job.employerName} · {job.jobLocation}</div>
										</div>
										<div style={{ textAlign: 'right' }}>
											<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 19, color: p.accent, lineHeight: 1 }}>{cardLayout.match}%</div>
											<div style={{ fontSize: 10, fontWeight: 700, color: p.muted, letterSpacing: '0.04em' }}>MATCH</div>
										</div>
									</div>
									<div style={{ height: 6, borderRadius: 999, background: p.chipBg, marginTop: 14, overflow: 'hidden' }}><div style={{ width: `${cardLayout.match}%`, height: '100%', background: p.matchBarFill }} /></div>
									<div style={{ display: 'flex', gap: 6, marginTop: 13 }}>
										{job.sponsorshipAvailable ? <span style={{ fontSize: 11, fontWeight: 600, color: p.accent, background: p.accentSoftBg, borderRadius: 999, padding: '3px 9px' }}>✓ Sponsors</span> : <span style={{ fontSize: 11, fontWeight: 600, color: p.body, background: p.chipBg, borderRadius: 999, padding: '3px 9px' }}>No sponsorship</span>}
										<span style={{ fontSize: 11, fontWeight: 600, color: p.body, background: p.chipBg, borderRadius: 999, padding: '3px 9px' }}>{typeLabel}</span>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				<div style={{ position: 'relative', zIndex: 2, borderTop: `1px solid ${p.heroBorder}`, padding: '18px 0', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)' }}>
					{/* The animation scrolls exactly one copy, so the seam never shows.
					    Spacing is `margin-right` per item, not a row `gap` — see the
					    `marquee` keyframes note in styles/index.css. */}
					<div className='rv-marquee' style={{ display: 'flex', width: 'max-content', animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap', willChange: 'transform', '--rv-marquee-shift': `${-100 / MARQUEE_COPIES}%` } as CSSProperties}>
						{Array.from({ length: MARQUEE_COPIES }).flatMap((_, copy) =>
							MARQUEE_COMPANIES.map((m, i) => (
								<span key={`${copy}-${i}`} aria-hidden={copy > 0} style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 17, color: p.heroInkFaint, marginRight: 54 }}>{m}</span>
							)),
						)}
					</div>
				</div>
			</section>

			<section style={{ background: p.pageBg, padding: '64px 28px' }}>
				<div style={{ maxWidth: 1180, margin: '0 auto' }}>
					<div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 26 }}>
						<div>
							<div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: p.accent, marginBottom: 8 }}>Fresh this week</div>
							<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0, color: p.ink }}>Recent job postings</h2>
						</div>
						<button onClick={() => go('browse')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: p.accent, background: p.surface, border: `1px solid ${p.accentBorder}`, borderRadius: 11, padding: '11px 18px', cursor: 'pointer' }}>Browse all 250 →</button>
					</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
						{featuredHomeJobs.map((j) => {
							const initials = j.employerName ? j.employerName.slice(0, 2).toUpperCase() : 'RV'
							return (
								<div key={j.jobId} onClick={() => selectJob(j.jobId)} className='rv-job-card' style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: 20, cursor: 'pointer', transition: 'box-shadow .18s,border-color .18s,transform .18s' }}>
									<div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
										<div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 13, background: p.accentSoftBg, color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 15 }}>{initials}</div>
										<div style={{ minWidth: 0 }}>
											<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 16.5, lineHeight: 1.25, color: p.ink }}>{j.position}</div>
											<div style={{ fontSize: 13, color: p.muted, marginTop: 3 }}>{j.employerName} · {j.jobLocation}</div>
										</div>
									</div>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
										{j.sponsorshipAvailable ? <span style={{ fontWeight: 600, fontSize: 12, color: p.accent, background: p.accentSoftBg, borderRadius: 999, padding: '5px 11px' }}>✓ Sponsors visa</span> : <span style={{ fontWeight: 600, fontSize: 12, color: p.muted, background: p.chipBg, borderRadius: 999, padding: '5px 11px' }}>No sponsorship</span>}
										<span style={{ fontSize: 12.5, color: p.muted }}>{j.postingDate || 'Recent'}</span>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</section>

			<section style={{ background: p.surface, padding: '72px 28px', borderTop: `1px solid ${p.borderSubtle}` }}>
				<div style={{ maxWidth: 1180, margin: '0 auto' }}>
					<div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 44px' }}>
						<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 34, letterSpacing: '-0.025em', margin: '0 0 12px', color: p.ink }}>Built around your resume</h2>
						<p style={{ fontSize: 17, color: p.body, lineHeight: 1.55, margin: 0 }}>Upload once. We read your skills and experience, then rank the whole board for you.</p>
					</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
						{[
							{ num: '01', title: 'Resume-ranked results', body: 'Upload once and every listing reorders to your skills and experience — no endless scrolling.' },
							{ num: '02', title: 'Sponsorship, up front', body: 'Each role is tagged for visa sponsorship so international students never apply blind.' },
							{ num: '03', title: 'Built for early careers', body: 'Only internships, co-ops, and new-grad roles. No senior listings cluttering your search.' },
						].map((f) => (
							<div key={f.num} style={{ position: 'relative', background: p.surfaceMuted, border: `1px solid ${p.border}`, borderRadius: 20, padding: '28px 24px', overflow: 'hidden' }}>
								<div aria-hidden='true' style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: p.featureGlow }} />
								<div style={{ fontFamily: "'Instrument Serif'", fontStyle: 'italic', fontSize: 30, color: p.accent, marginBottom: 14 }}>{f.num}</div>
								<h3 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em', margin: '0 0 8px', color: p.ink }}>{f.title}</h3>
								<p style={{ fontSize: 14.5, color: p.body, lineHeight: 1.55, margin: 0 }}>{f.body}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<footer style={{ background: p.footerGradient, color: p.heroInk, padding: '56px 28px 36px' }}>
				<div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 32 }}>
					<div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
							<div style={{ width: 28, height: 28, borderRadius: '6px 15px 6px 15px', background: p.logoGradient }} />
							<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 20 }}>RoleVault</span>
						</div>
						<p style={{ fontSize: 14, color: p.heroInkFaint, maxWidth: 280, lineHeight: 1.6, margin: 0 }}>The job board that ranks roles by your resume and never hides visa sponsorship.</p>
					</div>
					<div>
						<div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: p.heroInkFaint, marginBottom: 14 }}>Product</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: p.heroInkMuted }}>
							<span onClick={() => go('browse')} className='rv-footer-link' style={{ cursor: 'pointer' }}>Browse jobs</span>
							<span onClick={() => go('recommended')} className='rv-footer-link' style={{ cursor: 'pointer' }}>Recommended</span>
							<span onClick={() => go('onboarding')} className='rv-footer-link' style={{ cursor: 'pointer' }}>Resume matching</span>
						</div>
					</div>
					<div>
						<div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: p.heroInkFaint, marginBottom: 14 }}>Company</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: p.heroInkMuted }}>
							<span className='rv-footer-link' style={{ cursor: 'pointer' }}>About</span>
							<span className='rv-footer-link' style={{ cursor: 'pointer' }}>Careers</span>
							<span onClick={() => go('faq')} className='rv-footer-link' style={{ cursor: 'pointer' }}>FAQ</span>
						</div>
					</div>
					<div>
						<div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: p.heroInkFaint, marginBottom: 14 }}>Get started</div>
						<button onClick={() => go('register')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: p.buttonInk, background: p.buttonGradient, border: 'none', borderRadius: 11, padding: '11px 18px', cursor: 'pointer', width: '100%' }}>Create free account</button>
					</div>
				</div>
				<div style={{ maxWidth: 1180, margin: '36px auto 0', paddingTop: 22, borderTop: `1px solid ${p.heroBorder}`, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: p.heroInkFaint }}>
					<span>© 2026 RoleVault</span><span>Privacy · Terms</span>
				</div>
			</footer>
		</div>
	)
}
