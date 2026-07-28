import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { PATH_BY_SCREEN, jobPath, type StaticScreen } from './features/rolevault/routes'
import type { RoleVaultScreen } from './features/rolevault/types'
import { usePalette } from './lib/palette'
import { useAuth } from './providers/auth-context'

type Screen = RoleVaultScreen

/**
 * Gate for screens that need a session.
 *
 * Renders nothing until the session check settles, so a signed-in user is not
 * bounced to login on a page refresh. On a genuine miss it redirects rather than
 * swapping the rendered screen, so the URL always matches what is on screen, and
 * the original destination is kept in history state for the redirect back.
 */
function RequireAuth({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth()
	const location = useLocation()

	if (loading) return null
	if (!user) return <Navigate to={PATH_BY_SCREEN.login} state={{ from: location.pathname }} replace />
	return <>{children}</>
}

/**
 * Keeps a signed-in user off the login and register screens.
 *
 * It has to honour `from` for the same reason `AuthScreen` does: signing in sets
 * the user, which re-renders this guard, and it would otherwise race the screen's
 * own redirect and win — sending you to the default destination instead of the
 * page the guard turned you away from.
 */
function RedirectIfSignedIn({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth()
	const location = useLocation()

	if (loading) return null
	if (user) {
		const from = (location.state as { from?: string } | null)?.from
		return <Navigate to={from ?? PATH_BY_SCREEN.recommended} replace />
	}
	return <>{children}</>
}

/** Reads the job id from the URL, so a detail page can be linked and refreshed. */
function JobDetailRoute({ go }: { go: (screen: Screen) => void }) {
	const { id } = useParams<{ id: string }>()
	const jobId = Number(id)

	if (!Number.isInteger(jobId)) return <Navigate to={PATH_BY_SCREEN.browse} replace />
	return <DetailScreen go={go} jobId={jobId} />
}

export default function RoleVault() {
	const navigate = useNavigate()
	const { pathname } = useLocation()
	const [jobs, setJobs] = useState<any[]>([])
	const [detectedSkills, setDetectedSkills] = useState<string[]>(() => readDetectedSkills())
	const [resumeName, setResumeName] = useState<string | null>(() => readResumeName())
	const [recommendations, setRecommendations] = useState<any[]>([])
	const palette = usePalette()

	// The screens navigate through this callback rather than links, so it maps a
	// screen onto its URL. `detail` is unreachable here because it needs a job id
	// — `selectJob` covers that case.
	const go = useCallback(
		(nextScreen: Screen) => {
			if (nextScreen === 'detail') return
			navigate(PATH_BY_SCREEN[nextScreen as StaticScreen])
		},
		[navigate],
	)

	const selectJob = useCallback(
		(id?: number) => {
			if (!id) return
			navigate(jobPath(id))
		},
		[navigate],
	)

	// Previously done inside `go`; keyed on the URL instead so it also covers job
	// links and the browser back/forward buttons.
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [pathname])

	useEffect(() => {
		fetchJobs().then((loadedJobs) => setJobs(loadedJobs))
	}, [])

	useEffect(() => {
		const nextRecommendations = computeRecommendations(detectedSkills, jobs)
		setRecommendations(nextRecommendations)
		window.localStorage.setItem('rv-detected-skills', JSON.stringify(detectedSkills))
	}, [detectedSkills, jobs])

	return (
		<>
			<div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: palette.ink, background: palette.pageBg, minHeight: '100vh', WebkitFontSmoothing: 'antialiased', transition: 'background 0.2s, color 0.2s' }}>
				<Routes>
					<Route path={PATH_BY_SCREEN.landing} element={<LandingScreen go={go} selectJob={selectJob} featuredHomeJobs={jobs.slice(0, 6)} />} />
					<Route path={PATH_BY_SCREEN.browse} element={<BrowseScreen go={go} selectJob={selectJob} jobs={jobs} />} />
					<Route path='/jobs/:id' element={<JobDetailRoute go={go} />} />
					<Route path={PATH_BY_SCREEN.login} element={<RedirectIfSignedIn><AuthScreen mode='login' go={go} /></RedirectIfSignedIn>} />
					<Route path={PATH_BY_SCREEN.register} element={<RedirectIfSignedIn><AuthScreen mode='register' go={go} /></RedirectIfSignedIn>} />
					<Route path={PATH_BY_SCREEN.onboarding} element={<OnboardingScreen go={go} setDetectedSkills={setDetectedSkills} setResumeName={setResumeName} />} />
					<Route
						path={PATH_BY_SCREEN.recommended}
						element={
							<RequireAuth>
								<RecommendedScreen go={go} recommendations={recommendations} selectJob={selectJob} resumeName={resumeName} />
							</RequireAuth>
						}
					/>
					<Route
						path={PATH_BY_SCREEN.profile}
						element={
							<RequireAuth>
								<ProfileScreen go={go} detectedSkills={detectedSkills} resumeName={resumeName} setDetectedSkills={setDetectedSkills} setResumeName={setResumeName} />
							</RequireAuth>
						}
					/>
					<Route path={PATH_BY_SCREEN.faq} element={<FaqScreen go={go} />} />
					<Route path='*' element={<Navigate to={PATH_BY_SCREEN.landing} replace />} />
				</Routes>
			</div>
		</>
	)
}
