import { Link } from 'react-router-dom'
import { Skeleton } from '../components/ui'
import { useJobs } from '../features/jobs'
import { formatEmploymentType, formatRelativeTime } from '../lib/format'
import { sponsorsVisa } from '../lib/jobDisplay'
import type { Job } from '../types/job'

/** Illustrative match score (70–96) derived deterministically from the id. */
function matchScore(job: Job): number {
  let hash = 0
  for (let i = 0; i < job.id.length; i++) hash = (hash * 31 + job.id.charCodeAt(i)) % 1000
  return 70 + (hash % 27)
}

/**
 * Recommended roles. Resume matching has no backend yet, so the list shows real
 * open roles ranked by an illustrative score (clearly labelled below).
 */
export function RecommendedPage() {
  const { data, isPending } = useJobs({ status: 'open', pageSize: 12 })
  const ranked = (data?.data ?? [])
    .map((job) => ({ job, pct: matchScore(job) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h1 className="rv-display" style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Recommended for you</h1>
          <p style={{ fontSize: 14.5, color: '#7A8780', margin: 0 }}>Ranked by match to your resume</p>
        </div>
        <Link to="/onboarding" style={{ fontWeight: 600, fontSize: 14, color: '#12805A', background: '#fff', border: '1.5px solid #CFE6D9', borderRadius: 11, padding: '10px 18px', textDecoration: 'none' }}>↺ Update Resume</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFF7E6', border: '1px solid #F2E2BC', color: '#8A6D1F', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 22 }}>
        <span>ℹ</span> Resume matching is a preview — scores below are illustrative and roles come from live listings.
      </div>

      {isPending && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ranked.map(({ job, pct }) => (
          <Link key={job.id} to={`/jobs/${job.id}`} className="rv-rec-card" style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: '22px 24px', cursor: 'pointer', display: 'flex', gap: 20, alignItems: 'center', transition: 'box-shadow .15s,border-color .15s,transform .15s', boxShadow: '0 1px 2px rgba(10,20,16,0.04)', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                <span className="rv-display" style={{ fontWeight: 700, fontSize: 17 }}>{job.title} · {job.company}</span>
                <span style={{ fontSize: 13.5, color: '#7A8780' }}>{job.location} · {formatRelativeTime(job.createdAt)}</span>
              </div>
              <div style={{ fontSize: 14, color: '#46554F', marginBottom: 12 }}>
                <span style={{ color: '#8B988F' }}>Skills:</span> {job.tags.filter((t) => !/sponsor/i.test(t)).slice(0, 4).join(', ') || '—'}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {sponsorsVisa(job)
                  ? <span style={{ fontWeight: 600, fontSize: 12, color: '#12805A', background: '#E7F3EC', borderRadius: 999, padding: '4px 11px' }}>✓ Sponsorship</span>
                  : <span style={{ fontWeight: 600, fontSize: 12, color: '#7A8780', background: '#F1F4F2', borderRadius: 999, padding: '4px 11px' }}>✗ No sponsorship</span>}
                <span style={{ fontWeight: 600, fontSize: 12, color: '#46554F', background: '#fff', border: '1px solid #E6ECE7', borderRadius: 999, padding: '4px 11px' }}>{formatEmploymentType(job.employmentType)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0, width: 104 }}>
              <div className="rv-display" style={{ fontWeight: 800, fontSize: 32, background: 'linear-gradient(140deg,#1A9468,#0E4D37)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#8B988F', marginTop: 4, letterSpacing: '0.03em' }}>MATCH</div>
              <div style={{ height: 5, borderRadius: 999, background: '#EAF2EE', marginTop: 10, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#46C98A,#12805A)' }} /></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
