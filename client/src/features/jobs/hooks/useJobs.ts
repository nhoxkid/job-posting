import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '../../../api/jobs'
import type { JobQuery } from '../../../types/job'

/** Query-key factory for the jobs domain. */
export const jobKeys = {
  all: ['jobs'] as const,
  list: (query: JobQuery) => ['jobs', 'list', query] as const,
  detail: (id: string) => ['jobs', 'detail', id] as const,
}

/** Fetch a paginated list of jobs. */
export function useJobs(query: JobQuery = {}) {
  return useQuery({
    queryKey: jobKeys.list(query),
    queryFn: () => jobsApi.list(query),
  })
}
