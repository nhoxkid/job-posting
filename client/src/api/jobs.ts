/**
 * Job postings API resource. Maps to the backend routes under `/api/jobs`.
 */

import type { CreateJobInput, Job, JobQuery, Paginated, UpdateJobInput } from '../types/job'
import { apiClient, type QueryParams } from './client'

function toParams(query: JobQuery): QueryParams {
  return {
    search: query.search,
    // Repeatable filters go over the wire comma-separated; the server accepts
    // either that or repeated keys.
    type: query.types?.length ? query.types.join(',') : undefined,
    region: query.regions?.length ? query.regions.join(',') : undefined,
    sponsorship: query.sponsorship?.length ? query.sponsorship.join(',') : undefined,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export const jobsApi = {
  list: (query: JobQuery = {}): Promise<Paginated<Job>> =>
    apiClient.get<Paginated<Job>>('/jobs', toParams(query)),

  get: (id: string): Promise<Job> => apiClient.get<Job>(`/jobs/${id}`),

  create: (input: CreateJobInput): Promise<Job> => apiClient.post<Job>('/jobs', input),

  update: (id: string, input: UpdateJobInput): Promise<Job> =>
    apiClient.patch<Job>(`/jobs/${id}`, input),

  remove: (id: string): Promise<void> => apiClient.delete<void>(`/jobs/${id}`),
}
