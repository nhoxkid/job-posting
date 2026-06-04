import { useQuery } from '@tanstack/react-query'
import { jobsApi } from '../../../api/jobs'
import { jobKeys } from './useJobs'

/** Fetch a single job by id. */
export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobsApi.get(id),
    enabled: Boolean(id),
  })
}
