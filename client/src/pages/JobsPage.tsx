import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle, Skeleton } from '../components/ui'
import { useJobs } from '../features/jobs'
import { formatEmploymentType, formatRelativeTime, formatSalary } from '../lib/format'
import { sponsorsVisa } from '../lib/jobDisplay'
import type { EmploymentType, Job } from '../types/job'

const PAGE_SIZE = 8

const TYPE_FILTERS: { label: string; value: EmploymentType }[] = [
  { label: 'Internship', value: 'internship' },
  { label: 'New Grad', value: 'full-time' },
  { label: 'Co-op', value: 'contract' },
]

const REGION_FILTERS: { label: string; match: (job: Job) => boolean }[] = [
  { label: 'United States', match: (j) => /,\s*US$/i.test(j.location) },
  { label: 'Canada', match: (j) => /,\s*CA$/i.test(j.location) },
  { label: 'United Kingdom', match: (j) => /,\s*UK$/i.test(j.location) },
  { label: 'Remote', match: (j) => j.remote || /remote/i.test(j.location) },
]

const labelStyle = { fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8B988F', marginBottom: 10 } as const
const gridCols = '2.4fr 1.4fr 1fr 1.1fr 1fr 1fr'

export function JobsPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [types, setTypes] = useState<Set<EmploymentType>>(new Set())
  const [regions, setRegions] = useState<Set<string>>(new Set())
  const [sponsorOnly, setSponsorOnly] = useState(false)
  const [page, setPage] = useState(1)

  const { data, isPending, isError, error } = useJobs({ status: 'open', pageSize: 100 })

  const filtered = useMemo(() => {
    const jobs = data?.data ?? []
    const q = search.trim().toLowerCase()
    return jobs.filter((job) => {
      if (q) {
        const haystack = [job.title, job.company, job.location, ...job.tags].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (types.size > 0 && !types.has(job.employmentType)) return false
      if (sponsorOnly && !sponsorsVisa(job)) return false
      if (regions.size > 0) {
        const matchesRegion = REGION_FILTERS.some((r) => regions.has(r.label) && r.match(job))
        if (!matchesRegion) return false
      }
      return true
    })
  }, [data, search, types, regions, sponsorOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const activeFilters = types.size + regions.size + (sponsorOnly ? 1 : 0)

  const toggle = <T,>(setter: Dispatch<SetStateAction<Set<T>>>, value: T) => {
    setPage(1)
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const clearAll = () => {
    setTypes(new Set())
    setRegions(new Set())
    setSponsorOnly(false)
    setSearch('')
    setPage(1)
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: 28, display: 'grid', gridTemplateColumns: '264px 1fr', gap: 28, alignItems: 'start' }}>
      <aside style={{ position: 'sticky', top: 90, background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: 20, boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#F6F8F5', border: '1.5px solid #E6ECE7', borderRadius: 11, padding: '10px 12px', marginBottom: 20 }}>
          <span style={{ color: '#9AA8A2' }}>⌕</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#0A1410' }}
          />
        </div>

        <div className="rv-display" style={labelStyle}>Job type</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {TYPE_FILTERS.map((t) => (
            <CheckRow key={t.label} label={t.label} checked={types.has(t.value)} onClick={() => toggle(setTypes, t.value)} />
          ))}
        </div>

        <div className="rv-display" style={labelStyle}>Region</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {REGION_FILTERS.map((r) => (
            <CheckRow key={r.label} label={r.label} checked={regions.has(r.label)} onClick={() => toggle(setRegions, r.label)} />
          ))}
        </div>

        <div className="rv-display" style={labelStyle}>Sponsorship</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          <RadioRow label="Any" checked={!sponsorOnly} onClick={() => { setSponsorOnly(false); setPage(1) }} />
          <RadioRow label="Sponsors visas only" checked={sponsorOnly} onClick={() => { setSponsorOnly(true); setPage(1) }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EEF2EF', paddingTop: 14 }}>
          <span style={{ fontSize: 13, color: '#8B988F' }}>{activeFilters} filter{activeFilters === 1 ? '' : 's'} active</span>
          <span onClick={clearAll} style={{ fontSize: 13, fontWeight: 600, color: '#12805A', cursor: 'pointer' }}>Clear all</span>
        </div>
      </aside>

      <section style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
        <div className="rv-display" style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12, padding: '15px 22px', background: '#F6F8F5', borderBottom: '1px solid #EEF2EF', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8B988F' }}>
          <div>Role / Company</div><div>Location</div><div>Type</div><div>Sponsorship</div><div>Posted</div><div style={{ textAlign: 'right' }}>Salary</div>
        </div>

        {isPending && (
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        )}

        {isError && (
          <div style={{ padding: 22 }}>
            <Alert variant="destructive">
              <AlertTitle>Couldn’t load jobs</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          </div>
        )}

        {!isPending && !isError && visible.length === 0 && (
          <p style={{ padding: '48px 22px', textAlign: 'center', color: '#7A8780' }}>No roles match your filters.</p>
        )}

        {!isPending && !isError && visible.map((job) => (
          <Link key={job.id} to={`/jobs/${job.id}`} className="rv-table-row" style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 12, padding: '16px 22px', borderBottom: '1px solid #F2F5F3', alignItems: 'center', cursor: 'pointer', transition: 'background .12s', textDecoration: 'none', color: 'inherit' }}>
            <div>
              <div className="rv-display" style={{ fontWeight: 700, fontSize: 15 }}>{job.title}</div>
              <div style={{ fontSize: 13, color: '#7A8780', marginTop: 2 }}>{job.company}</div>
            </div>
            <div style={{ fontSize: 13.5, color: '#46554F' }}>{job.remote ? 'Remote' : job.location}</div>
            <div><span style={{ fontWeight: 600, fontSize: 12, color: '#46554F', background: '#F1F4F2', borderRadius: 999, padding: '4px 10px' }}>{formatEmploymentType(job.employmentType)}</span></div>
            <div>
              {sponsorsVisa(job)
                ? <span style={{ fontWeight: 600, fontSize: 12, color: '#12805A', background: '#E7F3EC', borderRadius: 999, padding: '4px 10px' }}>✓ Yes</span>
                : <span style={{ fontWeight: 600, fontSize: 12, color: '#7A8780', background: '#F1F4F2', borderRadius: 999, padding: '4px 10px' }}>No</span>}
            </div>
            <div style={{ fontSize: 13.5, color: '#7A8780' }}>{formatRelativeTime(job.createdAt)}</div>
            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, color: '#46554F' }}>{formatSalary(job)}</div>
          </Link>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: '#F6F8F5' }}>
          <span style={{ fontSize: 13.5, color: '#7A8780' }}>
            Showing <strong style={{ color: '#0A1410' }}>{visible.length}</strong> of {filtered.length} results
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <PagerButton disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</PagerButton>
            <PagerButton disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</PagerButton>
          </div>
        </div>
      </section>
    </div>
  )
}

function CheckRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <label onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: '#46554F', cursor: 'pointer' }}>
      <span style={{ width: 17, height: 17, borderRadius: 5, background: checked ? '#12805A' : 'transparent', border: checked ? 'none' : '1.5px solid #CFD8D3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, flexShrink: 0 }}>{checked ? '✓' : ''}</span>
      {label}
    </label>
  )
}

function RadioRow({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <label onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: checked ? '#12805A' : '#46554F', fontWeight: checked ? 600 : 400, cursor: 'pointer' }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', border: checked ? '5px solid #12805A' : '1.5px solid #CFD8D3', flexShrink: 0 }} />
      {label}
    </label>
  )
}

function PagerButton({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ fontWeight: 600, fontSize: 14, color: disabled ? '#9AA8A2' : '#12805A', background: '#fff', border: `1.5px solid ${disabled ? '#E6ECE7' : '#CFE6D9'}`, borderRadius: 10, padding: '8px 16px', cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {children}
    </button>
  )
}
