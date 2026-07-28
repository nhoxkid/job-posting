import { useEffect, useMemo, useState } from 'react'
import { fetchJobs } from './api/clientApi'
import {
	computeRecommendations,
	pickFeaturedJobs,
	readDetectedSkills,
	readResumeName,
	type Recommendation,
} from './features/jobs/rolevault'
import {
	AuthScreen,
	BrowseScreen,
	DetailScreen,
	FaqScreen,
	LandingScreen,
	OnboardingScreen,
	ProfileScreen,
	RecommendedScreen,
} from './features/rolevault/screens'
import type { RoleVaultScreen } from './features/rolevault/types'
import type { Job } from './types/job'
import { usePalette } from './lib/palette'

type Screen = RoleVaultScreen

export default function RoleVault() {
	const [screen, setScreen] = useState<Screen>('landing')
	const [jobs, setJobs] = useState<Job[]>([])
	const [jobsError, setJobsError] = useState<string | null>(null)
	const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
	const [detectedSkills, setDetectedSkills] = useState<string[]>(() => readDetectedSkills())
	const [resumeName, setResumeName] = useState<string | null>(() => readResumeName())
	const palette = usePalette()

	// Both derive from state we already hold, so they are computed rather than
	// mirrored into more state that could drift out of sync with `jobs`.
	const featuredHomeJobs = useMemo(() => pickFeaturedJobs(jobs), [jobs])
	const recommendations: Recommendation[] = useMemo(
		() => computeRecommendations(detectedSkills, jobs),
		[detectedSkills, jobs],
	)

	const go = (nextScreen: Screen) => {
		setScreen(nextScreen)
		window.scrollTo(0, 0)
	}

	useEffect(() => {
		let active = true
		fetchJobs()
			.then((loadedJobs) => {
				if (active) setJobs(loadedJobs)
			})
			.catch(() => {
				// Surfaced in Browse rather than swallowed — an empty board and an
				// unreachable API look identical to a user otherwise.
				if (active) setJobsError('Could not load jobs. Is the API running?')
			})
		return () => {
			active = false
		}
	}, [])

	useEffect(() => {
		window.localStorage.setItem('rv-detected-skills', JSON.stringify(detectedSkills))
	}, [detectedSkills])

	const selectJob = (id?: string) => {
		if (!id) return
		setSelectedJobId(id)
		setScreen('detail')
	}

	return (
		<>
			{/* Hover states read CSS variables (defined per theme in styles/index.css)
			    because :hover can't be expressed as an inline style. */}
			<style>{`
				.rv-pill:hover { border-color: var(--rv-hover-pill-border) !important; color: var(--rv-hover-pill-ink) !important; }
				.rv-job-card:hover { box-shadow: var(--rv-hover-card-shadow) !important; border-color: var(--rv-hover-card-border) !important; transform: translateY(-2px) !important; }
				.rv-table-row:hover { background: var(--rv-hover-row) !important; }
				.rv-rec-card:hover { box-shadow: var(--rv-hover-rec-shadow) !important; border-color: var(--rv-hover-card-border) !important; }
				.rv-faq-card:hover { border-color: var(--rv-hover-card-border) !important; }

				/* Footer links inherit their colour from the column wrapper rather than
				   setting it inline, so no !important is needed here.

				   They rest at near-white, so a colour shift alone is a weak signal —
				   mint against off-white is a small perceptual step, and invisible to
				   anyone who can't separate those hues. The underline carries the state
				   instead, with colour as reinforcement. */
				.rv-footer-link { transition: color .18s ease; text-decoration: none; }
				.rv-footer-link:hover, .rv-footer-link:focus-visible {
					color: var(--rv-hover-hero-ink);
					text-decoration: underline;
					text-decoration-thickness: 2px;
					text-underline-offset: 4px;
				}

				/* Same reasoning for the light-chrome nav links on the inner screens. */
				.rv-nav-link:hover, .rv-nav-link:focus-visible {
					color: var(--rv-hover-link) !important;
					text-decoration: underline;
					text-decoration-thickness: 2px;
					text-underline-offset: 4px;
				}
				.rv-nav-link-dark:hover, .rv-nav-link-dark:focus-visible {
					color: var(--rv-hover-nav-dark) !important;
					text-decoration: underline;
					text-decoration-thickness: 2px;
					text-underline-offset: 4px;
				}

				/* Hero filter pills. These DO set colour/background/border inline, so
				   the hover state has to outrank the style attribute. */
				.rv-hero-tag, .rv-hero-tag-active { transition: color .18s ease, background-color .18s ease, border-color .18s ease, transform .18s ease; }
				.rv-hero-tag:hover { color: var(--rv-hover-hero-ink) !important; background: var(--rv-hover-hero-bg) !important; border-color: var(--rv-hover-hero-border) !important; transform: translateY(-1px); }
				.rv-hero-tag-active:hover { background: var(--rv-hover-hero-accent) !important; transform: translateY(-1px); }
			`}</style>
			<div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: palette.ink, background: palette.pageBg, minHeight: '100vh', WebkitFontSmoothing: 'antialiased', transition: 'background 0.2s, color 0.2s' }}>
				{screen === 'landing' && <LandingScreen go={go} selectJob={selectJob} featuredHomeJobs={featuredHomeJobs} />}
				{screen === 'browse' && <BrowseScreen go={go} selectJob={selectJob} jobs={jobs} error={jobsError} />}
				{screen === 'detail' && <DetailScreen go={go} jobId={selectedJobId} />}
				{screen === 'login' && <AuthScreen mode='login' go={go} />}
				{screen === 'register' && <AuthScreen mode='register' go={go} />}
				{screen === 'onboarding' && <OnboardingScreen go={go} setDetectedSkills={setDetectedSkills} setResumeName={setResumeName} />}
				{screen === 'recommended' && <RecommendedScreen go={go} recommendations={recommendations} selectJob={selectJob} resumeName={resumeName} />}
				{screen === 'profile' && <ProfileScreen go={go} detectedSkills={detectedSkills} resumeName={resumeName} setDetectedSkills={setDetectedSkills} setResumeName={setResumeName} />}
				{screen === 'faq' && <FaqScreen go={go} />}
			</div>
		</>
	)
}
