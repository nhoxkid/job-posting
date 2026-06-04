import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '../../../api/jobs'
import type { CreateJobInput } from '../../../types/job'
import { jobKeys } from './useJobs'

/** Create a job and refresh the cached lists. */
export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateJobInput) => jobsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.all }),
  })
}
