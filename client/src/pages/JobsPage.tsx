import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle, Skeleton } from '../components/ui'
import { useJobs } from '../features/jobs'
import { formatApplicants, formatJobType, formatRelativeTime } from '../lib/format'
import { sponsorsVisa } from '../lib/jobDisplay'
import { usePalette, type Palette } from '../lib/palette'
import type { Job, JobType } from '../types/job'

const PAGE_SIZE = 8

const TYPE_FILTERS: { label: string; value: JobType }[] = [
  { label: 'Internship', value: 'internship' },
  { label: 'New Grad', value: 'new grad' },
]

const REGION_FILTERS: { label: string; match: (job: Job) => boolean }[] = [
  { label: 'United States', match: (j) => /,\s*(US|NY|CA|IL|OR|WA|TX|MA|VA|FL|ID|PA|DC|CT|WI|NC|UT|OH|MD|NJ|GA|CO)$/i.test(j.jobLocation) },
  { label: 'Canada', match: (j) => /,\s*(Canada|Toronto|Vancouver|Waterloo|Montreal|Ottawa|Calgary|Edmonton|BC|ON|AB|QC)$/i.test(j.jobLocation) },
  { label: 'United Kingdom', match: (j) => /,\s*(UK|London|Manchester|Cambridge|Oxford|Edinburgh)$/i.test(j.jobLocation) },
  { label: 'Remote', match: (j) => j.workModel === 'remote' || /remote/i.test(j.jobLocation) },
]

const gridCols = '2.4fr 1.4fr 1fr 1.1fr 1fr 1fr'

export function JobsPage() {
  const p = usePalette()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [types, setTypes] = useState<Set<JobType>>(new Set())
  const [regions, setRegions] = useState<Set<string>>(new Set())
  const [sponsorOnly, setSponsorOnly] = useState(false)
  const [page, setPage] = useState(1)

  const labelStyle = {
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: p.muted,
    marginBottom: 10,
  } as const

  const { data, isPending, isError, error } = useJobs({ active: true, pageSize: 100 })

  const filtered = useMemo(() => {
    const jobs = data?.data ?? []
    const q = search.trim().toLowerCase()
    return jobs.filter((job) => {
      if (q) {
        const haystack = [job.position, job.employerName, job.jobLocation].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (types.size > 0 && !types.has(job.jobType)) return false
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
    <div
      style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: 28,
        display: 'grid',
        gridTemplateColumns: '264px 1fr',
        gap: 28,
        alignItems: 'start',
      }}
    >
      <aside
        style={{
          position: 'sticky',
          top: 90,
          background: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: 18,
          padding: 20,
          boxShadow: p.shadow,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            background: p.surfaceMuted,
            border: `1.5px solid ${p.border}`,
            borderRadius: 11,
            padding: '10px 12px',
            marginBottom: 20,
          }}
        >
          <span style={{ color: p.muted }}>⌕</span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              color: p.ink,
            }}
          />
        </div>

        <div className="rv-display" style={labelStyle}>
          Job type
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {TYPE_FILTERS.map((t) => (
            <CheckRow
              key={t.label}
              label={t.label}
              checked={types.has(t.value)}
              onClick={() => toggle(setTypes, t.value)}
              p={p}
            />
          ))}
        </div>

        <div className="rv-display" style={labelStyle}>
          Region
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {REGION_FILTERS.map((r) => (
            <CheckRow
              key={r.label}
              label={r.label}
              checked={regions.has(r.label)}
              onClick={() => toggle(setRegions, r.label)}
              p={p}
            />
          ))}
        </div>

        <div className="rv-display" style={labelStyle}>
          Sponsorship
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          <RadioRow
            label="Any"
            checked={!sponsorOnly}
            onClick={() => {
              setSponsorOnly(false)
              setPage(1)
            }}
            p={p}
          />
          <RadioRow
            label="Sponsors visas only"
            checked={sponsorOnly}
            onClick={() => {
              setSponsorOnly(true)
              setPage(1)
            }}
            p={p}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${p.borderSubtle}`,
            paddingTop: 14,
          }}
        >
          <span style={{ fontSize: 13, color: p.muted }}>
            {activeFilters} filter{activeFilters === 1 ? '' : 's'} active
          </span>
          <span
            onClick={clearAll}
            style={{ fontSize: 13, fontWeight: 600, color: p.accent, cursor: 'pointer' }}
          >
            Clear all
          </span>
        </div>
      </aside>

      <section
        style={{
          background: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: p.shadow,
        }}
      >
        <div
          className="rv-display"
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: 12,
            padding: '15px 22px',
            background: p.surfaceMuted,
            borderBottom: `1px solid ${p.borderSubtle}`,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: p.muted,
          }}
        >
          <div>Role / Company</div>
          <div>Location</div>
          <div>Type</div>
          <div>Sponsorship</div>
          <div>Posted</div>
          <div style={{ textAlign: 'right' }}>Applicants</div>
        </div>

        {isPending && (
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
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
          <p style={{ padding: '48px 22px', textAlign: 'center', color: p.muted }}>
            No roles match your filters.
          </p>
        )}

        {!isPending &&
          !isError &&
          visible.map((job) => (
            <Link
              key={job.jobId}
              to={`/jobs/${job.jobId}`}
              className="rv-table-row"
              style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: 12,
                padding: '16px 22px',
                borderBottom: `1px solid ${p.borderSubtle}`,
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background .12s',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div>
                <div className="rv-display" style={{ fontWeight: 700, fontSize: 15, color: p.ink }}>
                  {job.position}
                </div>
                <div style={{ fontSize: 13, color: p.muted, marginTop: 2 }}>{job.employerName}</div>
              </div>
              <div style={{ fontSize: 13.5, color: p.body }}>
                {job.workModel === 'remote' ? 'Remote' : job.jobLocation}
              </div>
              <div>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: p.body,
                    background: p.chipBg,
                    borderRadius: 999,
                    padding: '4px 10px',
                  }}
                >
                  {formatJobType(job.jobType)}
                </span>
              </div>
              <div>
                {sponsorsVisa(job) ? (
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      color: p.accent,
                      background: p.accentSoftBg,
                      borderRadius: 999,
                      padding: '4px 10px',
                    }}
                  >
                    ✓ Yes
                  </span>
                ) : (
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      color: p.muted,
                      background: p.chipBg,
                      borderRadius: 999,
                      padding: '4px 10px',
                    }}
                  >
                    No
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13.5, color: p.muted }}>
                {formatRelativeTime(job.postingDate)}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 13, color: p.body }}>
                {formatApplicants(job.numberOfApplicants)}
              </div>
            </Link>
          ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 22px',
            background: p.surfaceMuted,
          }}
        >
          <span style={{ fontSize: 13.5, color: p.muted }}>
            Showing <strong style={{ color: p.ink }}>{visible.length}</strong> of {filtered.length}{' '}
            results
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <PagerButton
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              p={p}
            >
              Prev
            </PagerButton>
            <PagerButton
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              p={p}
            >
              Next
            </PagerButton>
          </div>
        </div>
      </section>
    </div>
  )
}

function CheckRow({
  label,
  checked,
  onClick,
  p,
}: {
  label: string
  checked: boolean
  onClick: () => void
  p: Palette
}) {
  return (
    <label
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        fontSize: 14,
        color: p.body,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 17,
          height: 17,
          borderRadius: 5,
          background: checked ? p.accent : 'transparent',
          border: checked ? 'none' : `1.5px solid ${p.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: p.isDark ? '#06281D' : '#fff',
          fontSize: 11,
          flexShrink: 0,
        }}
      >
        {checked ? '✓' : ''}
      </span>
      {label}
    </label>
  )
}

function RadioRow({
  label,
  checked,
  onClick,
  p,
}: {
  label: string
  checked: boolean
  onClick: () => void
  p: Palette
}) {
  return (
    <label
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        fontSize: 14,
        color: checked ? p.accent : p.body,
        fontWeight: checked ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: checked ? `5px solid ${p.accent}` : `1.5px solid ${p.border}`,
          flexShrink: 0,
        }}
      />
      {label}
    </label>
  )
}

function PagerButton({
  disabled,
  onClick,
  children,
  p,
}: {
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  p: Palette
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontWeight: 600,
        fontSize: 14,
        color: disabled ? p.muted : p.accent,
        background: disabled ? 'transparent' : p.surface,
        border: `1.5px solid ${disabled ? p.border : p.accentBorder}`,
        borderRadius: 10,
        padding: '8px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}
