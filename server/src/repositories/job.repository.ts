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

import { randomUUID } from 'node:crypto'
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
  findById(id: string): Promise<Job | null>
  create(input: CreateJobInput): Promise<Job>
  update(id: string, input: UpdateJobInput): Promise<Job | null>
  delete(id: string): Promise<boolean>
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

  constructor(seed: Job[] = seedJobs) {
    // Clone so callers can't mutate the seed array by reference.
    this.jobs = seed.map((job) => ({ ...job, tags: [...job.tags] }))
  }

  async list(query: JobQuery): Promise<PaginatedResult<Job>> {
    const { page, pageSize } = normalisePaging(query)
    const search = query.search?.trim().toLowerCase()

    let filtered = this.jobs.filter((job) => {
      if (query.status && job.status !== query.status) return false
      if (query.employmentType && job.employmentType !== query.employmentType) return false
      if (query.remote !== undefined && job.remote !== query.remote) return false
      if (search) {
        const haystack = [job.title, job.company, job.location, ...job.tags]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })

    // Newest first.
    filtered = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = filtered.length
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return { items, total }
  }

  async findById(id: string): Promise<Job | null> {
    return this.jobs.find((job) => job.id === id) ?? null
  }

  async create(input: CreateJobInput): Promise<Job> {
    const now = new Date().toISOString()
    const job: Job = {
      ...input,
      tags: [...(input.tags ?? [])],
      id: `job_${randomUUID()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.jobs.unshift(job)
    return job
  }

  async update(id: string, input: UpdateJobInput): Promise<Job | null> {
    const index = this.jobs.findIndex((job) => job.id === id)
    if (index === -1) return null
    const existing = this.jobs[index]
    const updated: Job = {
      ...existing,
      ...input,
      tags: input.tags ? [...input.tags] : existing.tags,
      updatedAt: new Date().toISOString(),
    }
    this.jobs[index] = updated
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const index = this.jobs.findIndex((job) => job.id === id)
    if (index === -1) return false
    this.jobs.splice(index, 1)
    return true
  }
}

/* -------------------------------------------------------------------------- */
/* PostgreSQL implementation                                                  */
/* -------------------------------------------------------------------------- */

/** Row shape returned by `SELECT * FROM jobs` (snake_case columns). */
interface JobRow {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  employment_type: Job['employmentType']
  description: string
  tags: string[]
  salary_min: number | null
  salary_max: number | null
  currency: string
  status: Job['status']
  created_at: Date | string
  updated_at: Date | string
}

function rowToJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    remote: row.remote,
    employmentType: row.employment_type,
    description: row.description,
    tags: row.tags ?? [],
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    currency: row.currency,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export class SqlJobRepository implements JobRepository {
  async list(q: JobQuery): Promise<PaginatedResult<Job>> {
    const { page, pageSize } = normalisePaging(q)
    const where: string[] = []
    const params: unknown[] = []

    if (q.status) {
      params.push(q.status)
      where.push(`status = $${params.length}`)
    }
    if (q.employmentType) {
      params.push(q.employmentType)
      where.push(`employment_type = $${params.length}`)
    }
    if (q.remote !== undefined) {
      params.push(q.remote)
      where.push(`remote = $${params.length}`)
    }
    if (q.search?.trim()) {
      params.push(`%${q.search.trim()}%`)
      const i = params.length
      where.push(
        `(title ILIKE $${i} OR company ILIKE $${i} OR location ILIKE $${i} OR array_to_string(tags, ' ') ILIKE $${i})`,
      )
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM jobs ${whereSql}`,
      params,
    )
    const total = Number(countResult.rows[0]?.count ?? 0)

    const limitParam = params.length + 1
    const offsetParam = params.length + 2
    const rows = await query<JobRow>(
      `SELECT * FROM jobs ${whereSql} ORDER BY created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`,
      [...params, pageSize, (page - 1) * pageSize],
    )

    return { items: rows.rows.map(rowToJob), total }
  }

  async findById(id: string): Promise<Job | null> {
    const result = await query<JobRow>('SELECT * FROM jobs WHERE id = $1', [id])
    const row = result.rows[0]
    return row ? rowToJob(row) : null
  }

  async create(input: CreateJobInput): Promise<Job> {
    const result = await query<JobRow>(
      `INSERT INTO jobs
        (title, company, location, remote, employment_type, description, tags, salary_min, salary_max, currency, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        input.title,
        input.company,
        input.location,
        input.remote ?? false,
        input.employmentType,
        input.description,
        input.tags ?? [],
        input.salaryMin ?? null,
        input.salaryMax ?? null,
        input.currency ?? 'USD',
        input.status ?? 'open',
      ],
    )
    return rowToJob(result.rows[0])
  }

  async update(id: string, input: UpdateJobInput): Promise<Job | null> {
    const columns: Record<string, unknown> = {}
    if (input.title !== undefined) columns.title = input.title
    if (input.company !== undefined) columns.company = input.company
    if (input.location !== undefined) columns.location = input.location
    if (input.remote !== undefined) columns.remote = input.remote
    if (input.employmentType !== undefined) columns.employment_type = input.employmentType
    if (input.description !== undefined) columns.description = input.description
    if (input.tags !== undefined) columns.tags = input.tags
    if (input.salaryMin !== undefined) columns.salary_min = input.salaryMin
    if (input.salaryMax !== undefined) columns.salary_max = input.salaryMax
    if (input.currency !== undefined) columns.currency = input.currency
    if (input.status !== undefined) columns.status = input.status

    const keys = Object.keys(columns)
    if (keys.length === 0) return this.findById(id)

    const sets = keys.map((key, i) => `${key} = $${i + 2}`)
    const result = await query<JobRow>(
      `UPDATE jobs SET ${sets.join(', ')}, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, ...keys.map((key) => columns[key])],
    )
    const row = result.rows[0]
    return row ? rowToJob(row) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM jobs WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  }
}

/* -------------------------------------------------------------------------- */
/* Default instance — chosen by DB_DRIVER (defaults to in-memory).            */
/* -------------------------------------------------------------------------- */

export const jobRepository: JobRepository =
  env.dbDriver === 'postgres' ? new SqlJobRepository() : new InMemoryJobRepository()
