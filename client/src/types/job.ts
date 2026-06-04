/**
 * Domain types for job postings.
 *
 * These mirror the shapes returned by the backend API (`server/src/models`).
 * Keep them in sync with the server-side schema.
 */

export const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'contract',
  'internship',
  'temporary',
] as const

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]

export type JobStatus = 'open' | 'closed' | 'draft'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  employmentType: EmploymentType
  description: string
  tags: string[]
  salaryMin: number | null
  salaryMax: number | null
  currency: string
  status: JobStatus
  createdAt: string
  updatedAt: string
}

/** Payload for creating a job posting. */
export interface CreateJobInput {
  title: string
  company: string
  location: string
  remote?: boolean
  employmentType: EmploymentType
  description: string
  tags?: string[]
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string
  status?: JobStatus
}

/** Payload for updating a job posting (all fields optional). */
export type UpdateJobInput = Partial<CreateJobInput>

/** Query parameters accepted by the list endpoint. */
export interface JobQuery {
  search?: string
  employmentType?: EmploymentType
  remote?: boolean
  status?: JobStatus
  page?: number
  pageSize?: number
}

/** Standard paginated response envelope. */
export interface Paginated<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
