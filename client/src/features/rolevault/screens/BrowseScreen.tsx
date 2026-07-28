import { useEffect, useState } from 'react'
import type { Job } from '../../../types/job'
import { Logo } from '../../../components/layout/RoleVaultChrome'
import { ThemeToggle } from '../../../components/ui/ThemeToggle'
import { usePalette } from '../../../lib/palette'
import type { RoleVaultScreen } from '../types'

type BrowseFilters = {
	query: string
	types: string[]
	sponsorship: 'any' | 'yes' | 'no'
}

function normalizeText(value: string) {
	return value.toLowerCase().replace(/\s+/g, ' ')
}

function formatLocationCount(count: number) {
	return `${count.toLocaleString()} result${count === 1 ? '' : 's'}`
}

export type BrowseScreenProps = {
	go: (s: RoleVaultScreen) => void
	selectJob: (id?: number) => void
	jobs: Job[]
}

export function BrowseScreen({ go, selectJob, jobs }: BrowseScreenProps) {
	const sourceJobs: Job[] = jobs || []
	const [filters, setFilters] = useState<BrowseFilters>({
		query: '',
		types: ['Internship', 'New Grad'],
		sponsorship: 'any',
	})
	const [page, setPage] = useState(1)
	const pageSize = 8
	const p = usePalette()

	useEffect(() => {
		setPage(1)
	}, [filters.query, filters.types, filters.sponsorship])

	const filteredJobs = sourceJobs.filter((job) => {
		const query = filters.query.trim().toLowerCase()
		if (query) {
			const searchable = normalizeText([job.position, job.employerName, job.jobLocation, job.jobType].join(' '))
			if (!searchable.includes(query)) return false
		}
		const typeLabel = job.jobType === 'new grad' ? 'New Grad' : 'Internship'
		if (!filters.types.includes(typeLabel)) return false
		if (filters.sponsorship === 'yes' && !job.sponsorshipAvailable) return false
		if (filters.sponsorship === 'no' && job.sponsorshipAvailable) return false
		return true
	})

	const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize))
	const currentPage = Math.min(page, totalPages)
	const startIndex = (currentPage - 1) * pageSize
	const pageJobs = filteredJobs.slice(startIndex, startIndex + pageSize)
	const activeFilterCount = Number(Boolean(filters.query.trim())) + Number(filters.types.length !== 2) + Number(filters.sponsorship !== 'any')

	const toggleValue = <T,>(current: T[], value: T) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]

	return (
		<div style={{ animation: 'spr-up .35s ease both', background: p.pageBg, color: p.ink, minHeight: '100vh' }}>
			<div style={{ position: 'sticky', top: 0, zIndex: 40, background: p.navBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${p.border}` }}>
				<div style={{ maxWidth: 1220, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
						<Logo />
						<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color: p.ink }}>RoleVault</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
						<ThemeToggle />
						<button onClick={() => go('profile')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 13.5, color: p.body, background: p.surface, border: `1.5px solid ${p.border}`, borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}>Your profile</button>
					</div>
				</div>
			</div>

			<div style={{ maxWidth: 1220, margin: '0 auto', padding: '32px 28px', display: 'grid', gridTemplateColumns: '270px 1fr', gap: 28 }}>
				<aside style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, padding: 24, height: 'fit-content', position: 'sticky', top: 90, boxShadow: p.shadow }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
						<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', margin: 0, color: p.ink }}>Filters</h2>
					</div>

					<div style={{ marginBottom: 22 }}>
						<input
							type='text'
							value={filters.query}
							onChange={(e) => setFilters((current) => ({ ...current, query: e.target.value }))}
							placeholder='Search title, company...'
							style={{ width: '100%', boxSizing: 'border-box', background: p.inputBg, border: `1.5px solid ${p.border}`, borderRadius: 11, padding: '10px 14px', fontSize: 13.5, color: p.ink, outline: 'none' }}
						/>
					</div>

					<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.muted, marginBottom: 10 }}>Role Type</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
						{['Internship', 'New Grad'].map((type) => {
							const checked = filters.types.includes(type)
							return (
								<label key={type} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: checked ? p.ink : p.body, fontWeight: checked ? 600 : 400, cursor: 'pointer' }}>
									<input type='checkbox' checked={checked} onChange={() => setFilters((current) => ({ ...current, types: toggleValue(current.types, type) }))} style={{ width: 16, height: 16, accentColor: p.accent }} />
									{type}
								</label>
							)
						})}
					</div>

					<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: p.muted, marginBottom: 10 }}>Sponsorship</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
						{([
							{ value: 'any', label: 'Any' },
							{ value: 'yes', label: 'Sponsors visas only' },
							{ value: 'no', label: 'No sponsorship' },
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
						<span onClick={() => setFilters({ query: '', types: ['Internship', 'New Grad'], sponsorship: 'any' })} style={{ fontSize: 13, fontWeight: 600, color: p.accent, cursor: 'pointer' }}>Clear all</span>
					</div>
				</aside>

				<section style={{ background: p.surface, border: `1px solid ${p.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: p.shadow }}>
					<div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.6fr 1.2fr 1.1fr 1fr', gap: 12, padding: '15px 22px', background: p.surfaceMuted, borderBottom: `1px solid ${p.borderSubtle}`, fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: p.muted }}>
						<div>Role / Company</div><div>Location</div><div>Type</div><div>Sponsorship</div><div>Posted</div>
					</div>
					{pageJobs.length ? pageJobs.map((job) => {
						const typeLabel = job.jobType === 'new grad' ? 'New Grad' : 'Internship'
						return (
							<div key={job.jobId} onClick={() => selectJob(job.jobId)} className='rv-table-row' style={{ display: 'grid', gridTemplateColumns: '2.4fr 1.6fr 1.2fr 1.1fr 1fr', gap: 12, padding: '16px 22px', borderBottom: `1px solid ${p.borderSubtle}`, alignItems: 'center', cursor: 'pointer', transition: 'background .12s' }}>
								<div><div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 15, color: p.ink }}>{job.position}</div><div style={{ fontSize: 13, color: p.muted, marginTop: 2 }}>{job.employerName}</div></div>
								<div style={{ fontSize: 13.5, color: p.body }}>{job.jobLocation}</div>
								<div><span style={{ fontWeight: 600, fontSize: 12, color: p.body, background: p.chipBg, borderRadius: 999, padding: '4px 10px' }}>{typeLabel}</span></div>
								<div>{job.sponsorshipAvailable ? <span style={{ fontWeight: 600, fontSize: 12, color: p.accent, background: p.accentSoftBg, borderRadius: 999, padding: '4px 10px' }}>✓ Yes</span> : <span style={{ fontWeight: 600, fontSize: 12, color: p.muted, background: p.chipBg, borderRadius: 999, padding: '4px 10px' }}>No</span>}</div>
								<div style={{ fontSize: 13.5, color: p.muted }}>{job.postingDate}</div>
							</div>
						)
					}) : (
						<div style={{ padding: 36, textAlign: 'center' }}>
							<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 20, marginBottom: 8, color: p.ink }}>No jobs match these filters</div>
							<div style={{ color: p.muted, marginBottom: 18 }}>Try widening your search, switching sponsorship mode, or clearing filters.</div>
							<button onClick={() => setFilters({ query: '', types: ['Internship', 'New Grad'], sponsorship: 'any' })} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: p.accentButtonInk, background: p.accentButtonBg, border: 'none', borderRadius: 10, padding: '11px 18px', cursor: 'pointer' }}>Reset filters</button>
						</div>
					)}
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: p.surfaceMuted, gap: 16, flexWrap: 'wrap' }}>
						<span style={{ fontSize: 13.5, color: p.muted }}>Showing <strong style={{ color: p.ink }}>{Math.min(startIndex + 1, filteredJobs.length)}-{Math.min(startIndex + pageSize, filteredJobs.length)}</strong> of {formatLocationCount(filteredJobs.length)}</span>
						<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
							<button disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: currentPage === 1 ? p.muted : p.accent, background: p.surface, border: `1.5px solid ${p.border}`, borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}>Prev</button>
							{Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
								const pageNumber = index + 1
								const active = pageNumber === currentPage
								return (
									<button key={pageNumber} onClick={() => setPage(pageNumber)} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, width: 36, height: 36, borderRadius: 10, border: active ? 'none' : `1.5px solid ${p.border}`, background: active ? p.accentButtonBg : p.surface, color: active ? p.accentButtonInk : p.body, cursor: 'pointer' }}>{pageNumber}</button>
								)
							})}
							<button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: currentPage === totalPages || totalPages === 0 ? p.muted : p.accent, background: p.surface, border: `1.5px solid ${p.border}`, borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}>Next</button>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}
