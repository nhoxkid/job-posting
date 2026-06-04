/**
 * Job postings API resource (scaffold).
 *
 * TODO: implement each call using `apiClient`. Maps to the backend routes
 * under `/api/jobs`.
 */

import type { CreateJobInput, Job, JobQuery, Paginated, UpdateJobInput } from '../types/job'

export const jobsApi = {
  list: async (_query: JobQuery = {}): Promise<Paginated<Job>> => {
    // TODO: return apiClient.get('/jobs', _query)
    throw new Error('Not implemented')
  },

  get: async (_id: string): Promise<Job> => {
    // TODO: return apiClient.get(`/jobs/${_id}`)
    throw new Error('Not implemented')
  },

  create: async (_input: CreateJobInput): Promise<Job> => {
    // TODO: return apiClient.post('/jobs', _input)
    throw new Error('Not implemented')
  },

  update: async (_id: string, _input: UpdateJobInput): Promise<Job> => {
    // TODO: return apiClient.patch(`/jobs/${_id}`, _input)
    throw new Error('Not implemented')
  },

  remove: async (_id: string): Promise<void> => {
    // TODO: return apiClient.delete(`/jobs/${_id}`)
    throw new Error('Not implemented')
  },
}
