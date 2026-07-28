/**
 * Job postings API resource. Maps to the backend routes under `/api/jobs`.
 */

import type { CreateJobInput, Job, JobQuery, Paginated, UpdateJobInput } from '../types/job'
import { apiClient, type QueryParams } from './client'

function toParams(query: JobQuery): QueryParams {
  return {
    search: query.search,
    jobType: query.jobType,
    workModel: query.workModel,
    sponsorship: query.sponsorship,
    active: query.active,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export const jobsApi = {
  list: (query: JobQuery = {}): Promise<Paginated<Job>> =>
    apiClient.get<Paginated<Job>>('/jobs', toParams(query)),

  get: (id: number): Promise<Job> => apiClient.get<Job>(`/jobs/${id}`),

  create: (input: CreateJobInput): Promise<Job> => apiClient.post<Job>('/jobs', input),

  update: (id: number, input: UpdateJobInput): Promise<Job> =>
    apiClient.patch<Job>(`/jobs/${id}`, input),

  remove: (id: number): Promise<void> => apiClient.delete<void>(`/jobs/${id}`),
}
