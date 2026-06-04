import { Badge, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui'
import { formatEmploymentType, formatRelativeTime, formatSalary } from '../../../lib/format'
import type { Job } from '../../../types/job'

export function JobCard({ job }: { job: Job }) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{job.title}</CardTitle>
          <Badge variant="secondary">{formatEmploymentType(job.employmentType)}</Badge>
        </div>
        <p className="text-sm font-medium text-primary">{job.company}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{job.remote ? 'Remote' : job.location}</span>
          <span>{formatSalary(job)}</span>
        </div>
        <p className="line-clamp-3 text-sm text-foreground/80">{job.description}</p>
        {job.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Posted {formatRelativeTime(job.createdAt)}</p>
      </CardContent>
    </Card>
  )
}
