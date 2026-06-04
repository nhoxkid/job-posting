/**
 * Job posting domain types.
 *
 * Plain TypeScript declarations only — no runtime logic. Adjust these to match
 * your database schema as you implement the repositories.
 */

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary'

export type JobStatus = 'open' | 'closed' | 'draft'

/** A persisted job posting. */
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

/** Payload for creating a job. */
export type CreateJobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>

/** Payload for updating a job. */
export type UpdateJobInput = Partial<CreateJobInput>

/** Filters accepted by the list endpoint. */
export interface JobQuery {
  search?: string
  employmentType?: EmploymentType
  remote?: boolean
  status?: JobStatus
  page?: number
  pageSize?: number
}
