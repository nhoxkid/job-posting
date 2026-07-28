import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import { formatApplicants, formatJobType, formatRelativeTime } from '../../../lib/format'
import type { Job } from '../../../types/job'

export function JobCard({ job }: { job: Job }) {
  const badges: string[] = []
  if (job.season) badges.push(job.season)
  if (job.workModel) badges.push(job.workModel)
  if (job.sponsorshipAvailable) badges.push('Visa sponsorship')

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{job.position}</CardTitle>
          <Badge variant="secondary">{formatJobType(job.jobType)}</Badge>
        </div>
        <p className="text-sm font-medium text-primary">{job.employerName}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{job.workModel === 'remote' ? 'Remote' : job.jobLocation}</span>
          <span>{formatApplicants(job.numberOfApplicants)}</span>
        </div>
        <p className="line-clamp-3 text-sm text-foreground/80">
          {job.jobSummary ?? job.companySummary ?? 'No description available yet.'}
        </p>
        {badges.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {badges.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Posted {formatRelativeTime(job.postingDate)}</p>
      </CardContent>
    </Card>
  )
}
