/**
 * Domain types for job postings.
 *
 * These mirror the shapes returned by the backend API (`server/src/models`).
 * Keep them in sync with the server-side schema.
 */

export const JOB_TYPES = ['internship', 'new grad'] as const

export type JobType = (typeof JOB_TYPES)[number]

export const WORK_MODELS = ['In-person', 'remote', 'hybrid'] as const

export type WorkModel = (typeof WORK_MODELS)[number]

export interface Job {
  jobId: number
  employerName: string
  position: string
  jobType: JobType
  jobLocation: string
  jobSummary: string | null
  companySummary: string | null
  postingDate: string
  workModel: WorkModel | null
  sponsorshipAvailable: boolean
  applicationDeadline: string | null
  applicationLink: string
  numberOfApplicants: number
  sourceId: string | null
  sourceRepo: string | null
  descriptionRaw: string | null
  season: string | null
  active: boolean
}

/** Payload for creating a job posting. */
export interface CreateJobInput {
  employerName: string
  position: string
  jobType: JobType
  jobLocation: string
  applicationLink: string
  workModel?: WorkModel
  sponsorshipAvailable?: boolean
  jobSummary?: string
  companySummary?: string
  postingDate?: string
  applicationDeadline?: string
  season?: string
  active?: boolean
}

/** Payload for updating a job posting (all fields optional). */
export type UpdateJobInput = Partial<CreateJobInput>

/** Query parameters accepted by the list endpoint. */
export interface JobQuery {
  search?: string
  jobType?: JobType
  workModel?: WorkModel
  sponsorship?: boolean
  active?: boolean
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
