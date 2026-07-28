import { useEffect, useState } from 'react'
import { fetchJobs } from './api/clientApi'
import { computeRecommendations, readDetectedSkills, readResumeName } from './features/jobs/rolevault'
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
import { featuredHomeJobs } from './features/jobs/rolevault'
import type { RoleVaultScreen } from './features/rolevault/types'
import { usePalette } from './lib/palette'

type Screen = RoleVaultScreen

export default function RoleVault() {
	const [screen, setScreen] = useState<Screen>('landing')
	const [jobs, setJobs] = useState<any[]>([])
	const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
	const [detectedSkills, setDetectedSkills] = useState<string[]>(() => readDetectedSkills())
	const [resumeName, setResumeName] = useState<string | null>(() => readResumeName())
	const [recommendations, setRecommendations] = useState<any[]>([])
	const palette = usePalette()

	const go = (nextScreen: Screen) => {
		setScreen(nextScreen)
		window.scrollTo(0, 0)
	}

	useEffect(() => {
		fetchJobs().then((loadedJobs) => setJobs(loadedJobs))
	}, [])

	useEffect(() => {
		const nextRecommendations = computeRecommendations(detectedSkills, jobs)
		setRecommendations(nextRecommendations)
		window.localStorage.setItem('rv-detected-skills', JSON.stringify(detectedSkills))
	}, [detectedSkills, jobs])

	const selectJob = (id?: number) => {
		if (!id) return
		setSelectedJobId(id)
		setScreen('detail')
	}

	return (
		<>
			{/* Hover states read CSS variables (defined per theme in styles/index.css)
			    because :hover can't be expressed as an inline style. */}
			<style>{`
				.rv-nav-link:hover { color: var(--rv-hover-link) !important; }
				.rv-nav-link-dark:hover { color: var(--rv-hover-nav-dark) !important; }
				.rv-pill:hover { border-color: var(--rv-hover-pill-border) !important; color: var(--rv-hover-pill-ink) !important; }
				.rv-job-card:hover { box-shadow: var(--rv-hover-card-shadow) !important; border-color: var(--rv-hover-card-border) !important; transform: translateY(-2px) !important; }
				.rv-table-row:hover { background: var(--rv-hover-row) !important; }
				.rv-rec-card:hover { box-shadow: var(--rv-hover-rec-shadow) !important; border-color: var(--rv-hover-card-border) !important; }
				.rv-faq-card:hover { border-color: var(--rv-hover-card-border) !important; }
			`}</style>
			<div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: palette.ink, background: palette.pageBg, minHeight: '100vh', WebkitFontSmoothing: 'antialiased', transition: 'background 0.2s, color 0.2s' }}>
				{screen === 'landing' && <LandingScreen go={go} selectJob={selectJob} featuredHomeJobs={jobs.slice(0, 6)} />}
				{screen === 'browse' && <BrowseScreen go={go} selectJob={selectJob} jobs={jobs} />}
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
