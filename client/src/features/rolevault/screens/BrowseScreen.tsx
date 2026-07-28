import { useEffect, useState } from 'react'
import { REGIONS, type Job, type JobType, type Region, type Sponsorship } from '../../../types/job'
import { SponsorshipBadge } from '../../../components/ui/SponsorshipBadge'
import { formatRelativeTime } from '../../../lib/format'
import { Logo } from '../../../components/layout/RoleVaultChrome'
import { Clickable } from '../../../components/ui/Clickable'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'
import type { RoleVaultScreen } from '../types'

type BrowseFilters = {
	query: string
	types: JobType[]
	regions: Region[]
	sponsorship: 'any' | Sponsorship
}

const DEFAULT_FILTERS: BrowseFilters = {
	query: '',
	types: ['Internship', 'New Grad'],
	regions: [...REGIONS],
	sponsorship: 'any',
}

function normalizeText(value: string) {
	return value.toLowerCase().replace(/\s+/g, ' ')
}

function formatLocationCount(count: number) {
	return `${count.toLocaleString()} result${count === 1 ? '' : 's'}`
}

export type BrowseScreenProps = {
	go: (s: RoleVaultScreen) => void
	selectJob: (id?: string) => void
	/** The board, loaded from the API by App. */
	jobs: Job[]
	/** Set when the API could not be reached, so the empty state can say why. */
	error?: string | null
}

export function BrowseScreen({ go, selectJob, jobs, error = null }: BrowseScreenProps) {
	const sourceJobs = jobs
	const [filters, setFilters] = useState<BrowseFilters>(DEFAULT_FILTERS)
	const [page, setPage] = useState(1)
	const pageSize = 8
	const p = usePalette()

	useEffect(() => {
		setPage(1)
	}, [filters.query, filters.types, filters.regions, filters.sponsorship])

	const filteredJobs = sourceJobs.filter((job) => {
		const query = filters.query.trim().toLowerCase()
		if (query) {
			const searchable = normalizeText([job.title, job.company, job.loc, job.type, ...job.skills].join(' '))
			if (!searchable.includes(query)) return false
		}
		if (!filters.types.includes(job.type)) return false
		if (!filters.regions.includes(job.region)) return false
		if (filters.sponsorship !== 'any' && job.sponsorship !== filters.sponsorship) return false
		return true
	})

	const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize))
	const currentPage = Math.min(page, totalPages)
	const startIndex = (currentPage - 1) * pageSize
	const pageJobs = filteredJobs.slice(startIndex, startIndex + pageSize)
	const activeFilterCount =
		Number(Boolean(filters.query.trim())) +
		Number(filters.types.length !== DEFAULT_FILTERS.types.length) +
		Number(filters.regions.length !== DEFAULT_FILTERS.regions.length) +
		Number(filters.sponsorship !== 'any')

	const toggleValue = <T,>(current: T[], value: T) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]

	return (
		<div style={{ animation: 'spr-up .35s ease both', background: p.pageBg, color: p.ink, minHeight: '100vh' }}>
			<div style={{ position: 'sticky', top: 0, zIndex: 40, background: p.navBg, WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${p.border}` }}>
				<div style={{ maxWidth: 1180, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', gap: 30 }}>
					<Clickable as='div' onClick={() => go('landing')} label='RoleVault home' style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<Logo />
						<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color: p.ink }}>RoleVault</span>
					</Clickable>
					<nav style={{ display: 'flex', gap: 26, alignItems: 'center', marginLeft: 6 }}>
						<span style={{ fontWeight: 700, fontSize: 15, color: p.ink, cursor: 'pointer' }}>Browse</span>
						<Clickable onClick={() => go('recommended')} className='rv-nav-link' style={{ fontWeight: 600, fontSize: 15, color: p.body }}>Recommended</Clickable>
						<Clickable onClick={() => go('faq')} className='rv-nav-link' style={{ fontWeight: 600, fontSize: 15, color: p.body }}>FAQ</Clickable>
					</nav>
					<div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
						<ThemeToggle />
						<button onClick={() => go('profile')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: p.accent, background: p.surface, border: `1.5px solid ${p.accentBorder}`, borderRadius: 11, padding: '9px 18px', cursor: 'pointer' }}>My Profile</button>
					</div>
				</div>
			</div>

			<div style={{ maxWidth: 1180, margin: '0 auto', padding: 28, display: 'grid', gridTemplateColumns: '264px 1fr', gap: 28, alignItems: 'start' }}>
				<aside style={{ position: 'sticky', top: 90, background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: 20, boxShadow: p.shadow }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 9, background: p.surfaceMuted, border: `1.5px solid ${p.border}`, borderRadius: 11, padding: '10px 12px', marginBottom: 20 }}>
						<span style={{ color: p.muted }}>⚲</span>
						<input value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder='Search...' style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: "'Plus Jakarta Sans'", fontSize: 14, color: p.ink }} />
					</div>
					{[
						{ label: 'Job type', items: ['Internship', 'New Grad', 'Co-op'] as JobType[] },
						{ label: 'Region', items: [...REGIONS] as Region[] },
					].map((group) => (
						<div key={group.label}>
							<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.muted, marginBottom: 10 }}>{group.label}</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
								{group.label === 'Job type'
									? group.items.map((item) => {
										const checked = filters.types.includes(item as JobType)
										return (
											<label key={item} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: p.body, cursor: 'pointer' }}>
												<span style={{ width: 17, height: 17, borderRadius: 5, background: checked ? p.accentButtonBg : 'transparent', border: checked ? 'none' : `1.5px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.accentButtonInk, fontSize: 11, flexShrink: 0 }}>{checked ? '✓' : ''}</span>
												<input type='checkbox' checked={checked} onChange={() => setFilters((current) => ({ ...current, types: toggleValue(current.types, item as JobType) }))} style={{ display: 'none' }} />
												{item}
											</label>
										)
									})
									: group.items.map((item) => {
										const checked = filters.regions.includes(item as Region)
										return (
											<label key={item} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: p.body, cursor: 'pointer' }}>
												<span style={{ width: 17, height: 17, borderRadius: 5, background: checked ? p.accentButtonBg : 'transparent', border: checked ? 'none' : `1.5px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.accentButtonInk, fontSize: 11, flexShrink: 0 }}>{checked ? '✓' : ''}</span>
												<input type='checkbox' checked={checked} onChange={() => setFilters((current) => ({ ...current, regions: toggleValue(current.regions, item as Region) }))} style={{ display: 'none' }} />
												{item}
											</label>
										)
									})}
							</div>
						</div>
					))}
					<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.muted, marginBottom: 10 }}>Sponsorship</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
						{([
							{ value: 'any', label: 'Any' },
							{ value: 'yes', label: 'Sponsors visas' },
							{ value: 'no', label: 'No sponsorship' },
							// Most postings land here, so it needs to be filterable
							// rather than silently lumped in with "No".
							{ value: 'unknown', label: 'Not stated' },
						] as const).map((item) => {
							const checked = filters.sponsorship === item.value
							return (
								<label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: checked ? p.accent : p.body, fontWeight: checked ? 600 : 400, cursor: 'pointer' }}>
									<span style={{ width: 16, height: 16, borderRadius: '50%', border: checked ? `5px solid ${p.accent}` : `1.5px solid ${p.border}`, flexShrink: 0 }} />
									<input type='radio' checked={checked} onChange={() => setFilters((current) => ({ ...current, sponsorship: item.value }))} style={{ display: 'none' }} />
									{item.label}
								</label>
							)
						})}
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${p.borderSubtle}`, paddingTop: 14 }}>
						<span style={{ fontSize: 13, color: p.muted }}>{activeFilterCount} filters active</span>
						<Clickable onClick={() => setFilters(DEFAULT_FILTERS)} style={{ fontSize: 13, fontWeight: 600, color: p.accent }}>Clear all</Clickable>
					</div>
				</aside>

				<section style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: p.shadow }}>
					<div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.4fr 1fr 1.1fr 1fr 0.8fr', gap: 12, padding: '15px 22px', background: p.surfaceMuted, borderBottom: `1px solid ${p.borderSubtle}`, fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: p.muted }}>
						<div>Role / Company</div><div>Location</div><div>Type</div><div>Sponsorship</div><div>Posted</div><div style={{ textAlign: 'right' }}>Applied</div>
					</div>
					{pageJobs.length ? pageJobs.map((job) => (
						<Clickable as='div' key={job.id} onClick={() => selectJob(job.id)} label={`View ${job.title} at ${job.company}`} className='rv-table-row' style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.4fr 1fr 1.1fr 1fr 0.8fr', gap: 12, padding: '16px 22px', borderBottom: `1px solid ${p.borderSubtle}`, alignItems: 'center', cursor: 'pointer', transition: 'background .12s' }}>
							<div><div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 15, color: p.ink }}>{job.title}</div><div style={{ fontSize: 13, color: p.muted, marginTop: 2 }}>{job.company}</div></div>
							<div style={{ fontSize: 13.5, color: p.body }}>{job.loc}</div>
							<div><span style={{ fontWeight: 600, fontSize: 12, color: p.body, background: p.chipBg, borderRadius: 999, padding: '4px 10px' }}>{job.type}</span></div>
							<div><SponsorshipBadge sponsorship={job.sponsorship} short /></div>
							<div style={{ fontSize: 13.5, color: p.muted }}>{formatRelativeTime(job.postedAt)}</div>
							<div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: p.body }}>{job.applied}</div>
						</Clickable>
					)) : (
					<div style={{ padding: 36, textAlign: 'center' }}>
							{/* An unreachable API and a board with no matches are different
							    problems; telling the user to widen their filters when the
							    server is down sends them chasing the wrong thing. */}
							<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 20, marginBottom: 8, color: p.ink }}>
								{error ? 'Could not load jobs' : sourceJobs.length === 0 ? 'No jobs on the board yet' : 'No jobs match these filters'}
							</div>
							<div style={{ color: p.muted, marginBottom: 18 }}>
								{error
									? error
									: sourceJobs.length === 0
										? 'Run the ingestion job to pull in postings: npm run ingest -w @job-posting/server'
										: 'Try widening your search, switching sponsorship mode, or clearing filters.'}
							</div>
							{!error && sourceJobs.length > 0 && (
								<button onClick={() => setFilters(DEFAULT_FILTERS)} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 10, padding: '11px 18px', cursor: 'pointer' }}>Reset filters</button>
							)}
						</div>
					)}
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: p.surfaceMuted, gap: 16, flexWrap: 'wrap' }}>
						<span style={{ fontSize: 13.5, color: p.muted }}>Showing <strong style={{ color: p.ink }}>{Math.min(startIndex + 1, filteredJobs.length)}-{Math.min(startIndex + pageSize, filteredJobs.length)}</strong> of {formatLocationCount(filteredJobs.length)}</span>
						<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
							<button disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: currentPage === 1 ? p.muted : p.accent, background: p.surface, border: `1.5px solid ${p.border}`, borderRadius: 10, padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
							{Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
								const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index
								if (pageNumber > totalPages) return null
								const isActive = currentPage === pageNumber
								return (
									<button key={pageNumber} onClick={() => setPage(pageNumber)} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: isActive ? p.accentButtonInk : p.accent, background: isActive ? p.accentButtonBg : p.surface, border: `1.5px solid ${isActive ? p.accentButtonBg : p.border}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', minWidth: 40 }}>{pageNumber}</button>
								)
							})}
							<button disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: currentPage === totalPages ? p.muted : p.accent, background: p.surface, border: `1.5px solid ${p.border}`, borderRadius: 10, padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}
