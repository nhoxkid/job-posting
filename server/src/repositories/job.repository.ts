/**
 * Job repository: the data-access boundary.
 *
 * `JobRepository` defines the contract the service depends on. Two
 * implementations are provided:
 *
 *   - `InMemoryJobRepository` — seeded with sample data, requires no database.
 *     This is the default so the app runs out of the box (`DB_DRIVER=memory`).
 *   - `SqlJobRepository` — PostgreSQL-backed, used when `DB_DRIVER=postgres`.
 */

import { env } from '../config/env'
import { query } from '../db'
import type { CreateJobInput, Job, JobQuery, UpdateJobInput } from '../models/job'
import { seedJobs } from './job.seed-data'

export interface PaginatedResult<T> {
  items: T[]
  total: number
}

export interface JobRepository {
  list(query: JobQuery): Promise<PaginatedResult<Job>>
  findById(id: number): Promise<Job | null>
  findBySourceId(sourceId: string): Promise<Job | null>
  create(input: CreateJobInput): Promise<Job>
  update(id: number, input: UpdateJobInput): Promise<Job | null>
  delete(id: number): Promise<boolean>
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 12

function normalisePaging(query: JobQuery): { page: number; pageSize: number } {
  const page = Math.max(1, Math.trunc(query.page ?? DEFAULT_PAGE))
  const rawSize = Math.trunc(query.pageSize ?? DEFAULT_PAGE_SIZE)
  const pageSize = Math.min(100, Math.max(1, rawSize))
  return { page, pageSize }
}

/* -------------------------------------------------------------------------- */
/* In-memory implementation                                                   */
/* -------------------------------------------------------------------------- */

export class InMemoryJobRepository implements JobRepository {
  private jobs: Job[]
  private nextId: number

  constructor(seed: Job[] = seedJobs) {
    this.jobs = seed.map((job) => ({ ...job }))
    this.nextId = Math.max(0, ...seed.map((j) => j.jobId)) + 1
  }

  async list(query: JobQuery): Promise<PaginatedResult<Job>> {
    const { page, pageSize } = normalisePaging(query)
    const search = query.search?.trim().toLowerCase()

    let filtered = this.jobs.filter((job) => {
      if (query.active !== undefined && job.active !== query.active) return false
      if (query.jobType && job.jobType !== query.jobType) return false
      if (query.workModel && job.workModel !== query.workModel) return false
      if (query.sponsorship !== undefined && job.sponsorshipAvailable !== query.sponsorship)
        return false
      if (search) {
        const haystack = [job.position, job.employerName, job.jobLocation].join(' ').toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })

    // Newest first.
    filtered = filtered.sort(
      (a, b) => new Date(b.postingDate).getTime() - new Date(a.postingDate).getTime(),
    )

    const total = filtered.length
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return { items, total }
  }

  async findById(id: number): Promise<Job | null> {
    return this.jobs.find((job) => job.jobId === id) ?? null
  }

  async findBySourceId(sourceId: string): Promise<Job | null> {
    return this.jobs.find((job) => job.sourceId === sourceId) ?? null
  }

  async create(input: CreateJobInput): Promise<Job> {
    const job: Job = {
      jobId: this.nextId++,
      employerName: input.employerName,
      position: input.position,
      jobType: input.jobType,
      jobLocation: input.jobLocation,
      jobSummary: input.jobSummary ?? null,
      companySummary: input.companySummary ?? null,
      postingDate: input.postingDate ?? new Date().toISOString().split('T')[0],
      workModel: input.workModel ?? 'In-person',
      sponsorshipAvailable: input.sponsorshipAvailable ?? false,
      applicationDeadline: input.applicationDeadline ?? null,
      applicationLink: input.applicationLink,
      numberOfApplicants: 0,
      sourceId: input.sourceId ?? null,
      sourceRepo: input.sourceRepo ?? null,
      descriptionRaw: input.descriptionRaw ?? null,
      season: input.season ?? null,
      active: input.active ?? true,
    }
    this.jobs.unshift(job)
    return job
  }

  async update(id: number, input: UpdateJobInput): Promise<Job | null> {
    const index = this.jobs.findIndex((job) => job.jobId === id)
    if (index === -1) return null
    const existing = this.jobs[index]
    const updated: Job = { ...existing, ...input }
    this.jobs[index] = updated
    return updated
  }

  async delete(id: number): Promise<boolean> {
    const index = this.jobs.findIndex((job) => job.jobId === id)
    if (index === -1) return false
    this.jobs.splice(index, 1)
    return true
  }
}

/* -------------------------------------------------------------------------- */
/* PostgreSQL implementation                                                  */
/* -------------------------------------------------------------------------- */

/** Row shape returned by `SELECT * FROM job_postings` (snake_case columns). */
interface JobRow {
  job_id: number
  employer_name: string
  position: string
  job_type: Job['jobType']
  job_location: string
  job_summary: string | null
  company_summary: string | null
  posting_date: Date | string
  work_model: Job['workModel'] | null
  sponsorship_available: boolean
  application_deadline: Date | string | null
  application_link: string
  number_of_applicants: number
  source_id: string | null
  source_repo: string | null
  description_raw: string | null
  season: string | null
  active: boolean
}

function rowToJob(row: JobRow): Job {
  return {
    jobId: row.job_id,
    employerName: row.employer_name,
    position: row.position,
    jobType: row.job_type,
    jobLocation: row.job_location,
    jobSummary: row.job_summary,
    companySummary: row.company_summary,
    postingDate: row.posting_date instanceof Date
      ? row.posting_date.toISOString().split('T')[0]
      : String(row.posting_date),
    workModel: row.work_model,
    sponsorshipAvailable: row.sponsorship_available,
    applicationDeadline: row.application_deadline
      ? new Date(row.application_deadline).toISOString()
      : null,
    applicationLink: row.application_link,
    numberOfApplicants: Number(row.number_of_applicants),
    sourceId: row.source_id,
    sourceRepo: row.source_repo,
    descriptionRaw: row.description_raw,
    season: row.season,
    active: row.active,
  }
}

export class SqlJobRepository implements JobRepository {
  async list(q: JobQuery): Promise<PaginatedResult<Job>> {
    const { page, pageSize } = normalisePaging(q)
    const where: string[] = []
    const params: unknown[] = []

    if (q.active !== undefined) {
      params.push(q.active)
      where.push(`active = $${params.length}`)
    }
    if (q.jobType) {
      params.push(q.jobType)
      where.push(`job_type = $${params.length}`)
    }
    if (q.workModel) {
      params.push(q.workModel)
      where.push(`work_model = $${params.length}`)
    }
    if (q.sponsorship !== undefined) {
      params.push(q.sponsorship)
      where.push(`sponsorship_available = $${params.length}`)
    }
    if (q.search?.trim()) {
      params.push(`%${q.search.trim()}%`)
      const i = params.length
      where.push(
        `(position ILIKE $${i} OR employer_name ILIKE $${i} OR job_location ILIKE $${i})`,
      )
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM job_postings ${whereSql}`,
      params,
    )
    const total = Number(countResult.rows[0]?.count ?? 0)

    const limitParam = params.length + 1
    const offsetParam = params.length + 2
    const rows = await query<JobRow>(
      `SELECT * FROM job_postings ${whereSql} ORDER BY posting_date DESC LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...params, pageSize, (page - 1) * pageSize],
    )

    return { items: rows.rows.map(rowToJob), total }
  }

  async findById(id: number): Promise<Job | null> {
    const result = await query<JobRow>('SELECT * FROM job_postings WHERE job_id = $1', [id])
    const row = result.rows[0]
    return row ? rowToJob(row) : null
  }

  async findBySourceId(sourceId: string): Promise<Job | null> {
    const result = await query<JobRow>('SELECT * FROM job_postings WHERE source_id = $1', [sourceId])
    const row = result.rows[0]
    return row ? rowToJob(row) : null
  }

  async create(input: CreateJobInput): Promise<Job> {
    const result = await query<JobRow>(
      `INSERT INTO job_postings
        (employer_name, position, job_type, job_location, job_summary, company_summary,
         posting_date, work_model, sponsorship_available, application_deadline, application_link,
         source_id, source_repo, description_raw, season, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        input.employerName,
        input.position,
        input.jobType,
        input.jobLocation,
        input.jobSummary ?? null,
        input.companySummary ?? null,
        input.postingDate ?? new Date().toISOString().split('T')[0],
        input.workModel ?? 'In-person',
        input.sponsorshipAvailable ?? false,
        input.applicationDeadline ?? null,
        input.applicationLink,
        input.sourceId ?? null,
        input.sourceRepo ?? null,
        input.descriptionRaw ?? null,
        input.season ?? null,
        input.active ?? true,
      ],
    )
    return rowToJob(result.rows[0])
  }

  async update(id: number, input: UpdateJobInput): Promise<Job | null> {
    const columns: Record<string, unknown> = {}
    if (input.employerName !== undefined) columns.employer_name = input.employerName
    if (input.position !== undefined) columns.position = input.position
    if (input.jobType !== undefined) columns.job_type = input.jobType
    if (input.jobLocation !== undefined) columns.job_location = input.jobLocation
    if (input.jobSummary !== undefined) columns.job_summary = input.jobSummary
    if (input.companySummary !== undefined) columns.company_summary = input.companySummary
    if (input.postingDate !== undefined) columns.posting_date = input.postingDate
    if (input.workModel !== undefined) columns.work_model = input.workModel
    if (input.sponsorshipAvailable !== undefined)
      columns.sponsorship_available = input.sponsorshipAvailable
    if (input.applicationDeadline !== undefined)
      columns.application_deadline = input.applicationDeadline
    if (input.applicationLink !== undefined) columns.application_link = input.applicationLink
    if (input.sourceId !== undefined) columns.source_id = input.sourceId
    if (input.sourceRepo !== undefined) columns.source_repo = input.sourceRepo
    if (input.descriptionRaw !== undefined) columns.description_raw = input.descriptionRaw
    if (input.season !== undefined) columns.season = input.season
    if (input.active !== undefined) columns.active = input.active

    const keys = Object.keys(columns)
    if (keys.length === 0) return this.findById(id)

    const sets = keys.map((key, i) => `${key} = $${i + 2}`)
    const result = await query<JobRow>(
      `UPDATE job_postings SET ${sets.join(', ')} WHERE job_id = $1 RETURNING *`,
      [id, ...keys.map((key) => columns[key])],
    )
    const row = result.rows[0]
    return row ? rowToJob(row) : null
  }

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM job_postings WHERE job_id = $1', [id])
    return (result.rowCount ?? 0) > 0
  }
}

/* -------------------------------------------------------------------------- */
/* Default instance — chosen by DB_DRIVER (defaults to in-memory).            */
/* -------------------------------------------------------------------------- */

export const jobRepository: JobRepository =
  env.dbDriver === 'postgres' ? new SqlJobRepository() : new InMemoryJobRepository()
