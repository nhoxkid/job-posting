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

type Screen = RoleVaultScreen

export default function RoleVault() {
	const [screen, setScreen] = useState<Screen>('landing')
	const [jobs, setJobs] = useState<any[]>([])
	const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
	const [detectedSkills, setDetectedSkills] = useState<string[]>(() => readDetectedSkills())
	const [resumeName, setResumeName] = useState<string | null>(() => readResumeName())
	const [recommendations, setRecommendations] = useState<any[]>([])

	const go = (nextScreen: Screen) => {
		setScreen(nextScreen)
		window.scrollTo(0, 0)
	}

	useEffect(() => {
		fetchJobs().then((loadedJobs) => setJobs(loadedJobs))
	}, [])

	useEffect(() => {
		const nextRecommendations = computeRecommendations(detectedSkills)
		setRecommendations(nextRecommendations)
		window.localStorage.setItem('rv-detected-skills', JSON.stringify(detectedSkills))
	}, [detectedSkills])

	const selectJob = (id?: number) => {
		if (!id) return
		setSelectedJobId(id)
		setScreen('detail')
	}

	return (
		<>
			<style>{`
				.rv-nav-link:hover { color: #1A7A52 !important; }
				.rv-pill:hover { border-color: #1A7A52 !important; color: #15603F !important; }
				.rv-job-card:hover { box-shadow: 0 10px 26px rgba(16,33,27,0.08) !important; border-color: #CDE3D6 !important; transform: translateY(-2px) !important; }
				.rv-table-row:hover { background: #F7FBF8 !important; }
				.rv-rec-card:hover { box-shadow: 0 10px 26px rgba(16,33,27,0.07) !important; border-color: #CDE3D6 !important; }
				.rv-faq-card:hover { border-color: #CDE3D6 !important; }
			`}</style>
			<div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#10211B', background: '#faf9f5', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
				{screen === 'landing' && <LandingScreen go={go} selectJob={selectJob} featuredHomeJobs={featuredHomeJobs} />}
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
