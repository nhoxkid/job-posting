import { Alert, AlertDescription, AlertTitle, Skeleton } from '../../../components/ui'
import type { JobQuery } from '../../../types/job'
import { useJobs } from '../hooks/useJobs'
import { JobCard } from './JobCard'

export function JobList({ query }: { query: JobQuery }) {
  const { data, isPending, isError, error } = useJobs(query)

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn’t load jobs</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    )
  }

  if (data.data.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No jobs match your search.</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{data.total} jobs found</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
