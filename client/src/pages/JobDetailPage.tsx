import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BrandLogo } from '../components/brand/Logo'
import { Alert, AlertDescription, AlertTitle, Skeleton } from '../components/ui'
import { useJob } from '../features/jobs'
import { formatEmploymentType, formatRelativeTime, formatSalary } from '../lib/format'
import { companyInitials, sponsorsVisa } from '../lib/jobDisplay'

function DetailHeader() {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E6ECE7' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandLogo />
        <Link to="/jobs" className="rv-nav-link" style={{ fontWeight: 600, fontSize: 15, color: '#46554F', textDecoration: 'none' }}>← Back to listings</Link>
      </div>
    </div>
  )
}

export function JobDetailPage() {
  const { id = '' } = useParams()
  const { data: job, isPending, isError, error } = useJob(id)

  return (
    <div style={{ background: '#F6F8F5', minHeight: '100vh', animation: 'spr-up .35s ease both' }}>
      <DetailHeader />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 28 }}>
        {isPending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Couldn’t load this role</AlertTitle>
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        )}

        {!isPending && !isError && job && (
          <>
            {/* Hero */}
            <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#0C4030,#08231A)', borderRadius: 22, padding: 30, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: -100, right: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(95,214,160,0.3),transparent 65%)', filter: 'blur(20px)' }} />
              <div className="rv-display" style={{ position: 'relative', width: 66, height: 66, borderRadius: 16, background: 'rgba(255,255,255,0.95)', color: '#12805A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>{companyInitials(job.company)}</div>
              <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                <h1 className="rv-display" style={{ fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 6px', color: '#fff' }}>{job.title}</h1>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)' }}>{job.company} · {job.location} · Posted {formatRelativeTime(job.createdAt)}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 13, flexWrap: 'wrap' }}>
                  {sponsorsVisa(job) && <span style={{ fontWeight: 600, fontSize: 12.5, color: '#06281D', background: '#5FD6A0', borderRadius: 999, padding: '5px 12px' }}>✓ Sponsorship</span>}
                  <Pill>{formatEmploymentType(job.employmentType)}</Pill>
                  {job.remote && <Pill>Remote</Pill>}
                </div>
              </div>
              <Link to="/register" style={{ position: 'relative', fontWeight: 700, fontSize: 16, color: '#06281D', background: 'linear-gradient(180deg,#7CE7B0,#46C98A)', border: 'none', borderRadius: 13, padding: '15px 32px', cursor: 'pointer', boxShadow: '0 12px 26px -8px rgba(70,201,138,0.6)', textDecoration: 'none' }}>↗ Apply</Link>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 20 }}>
              <InfoCard label="Role overview">
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#46554F', margin: 0 }}>{job.description}</p>
              </InfoCard>
              <InfoCard label="Skills & tags">
                {job.tags.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {job.tags.map((tag) => (
                      <span key={tag} style={{ fontWeight: 600, fontSize: 13.5, color: '#12805A', background: '#E7F3EC', border: '1px solid #D2E7DB', borderRadius: 9, padding: '7px 14px' }}>{tag}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 14.5, color: '#7A8780', margin: 0 }}>No tags listed.</p>
                )}
              </InfoCard>
            </div>

            {/* Role details */}
            <div style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: '26px 28px', marginTop: 20, boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
              <h2 className="rv-display" style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', margin: '0 0 22px' }}>Role Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 32px' }}>
                <Detail label="Location" value={job.remote ? `${job.location} (Remote)` : job.location} />
                <Detail label="Employment type" value={formatEmploymentType(job.employmentType)} />
                <Detail label="Compensation" value={formatSalary(job)} />
                <Detail label="Status" value={job.status.charAt(0).toUpperCase() + job.status.slice(1)} />
              </div>
            </div>
          </>
        )}

        {!isPending && !isError && !job && (
          <p style={{ padding: '48px 0', textAlign: 'center', color: '#7A8780' }}>Role not found.</p>
        )}
      </div>
    </div>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return <span style={{ fontWeight: 600, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '5px 12px' }}>{children}</span>
}

function InfoCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E6ECE7', borderRadius: 18, padding: 24, boxShadow: '0 1px 2px rgba(10,20,16,0.04)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#E7F3EC', color: '#12805A', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 999, marginBottom: 14 }}>
        <span style={{ width: 6, height: 6, background: '#12805A', borderRadius: '50%' }} />{label}
      </div>
      {children}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8B988F', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15 }}>{value}</div>
    </div>
  )
}
