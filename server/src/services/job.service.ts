/**
 * Job service: business logic layer (HTTP- and storage-agnostic).
 *
 * Depends on the `JobRepository` interface. Validates input, applies defaults,
 * and shapes the paginated envelope returned to the controller.
 */

import { EMPLOYMENT_TYPES, JOB_STATUSES } from '../models/job'
import type { CreateJobInput, Job, JobQuery, UpdateJobInput } from '../models/job'
import { jobRepository, type JobRepository } from '../repositories/job.repository'
import { ApiError } from '../utils/ApiError'

export interface Paginated<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw ApiError.badRequest(`"${field}" is required`)
  }
  return value.trim()
}

/** Validate and normalise a create payload coming off the wire. */
function parseCreateInput(body: unknown): CreateJobInput {
  if (typeof body !== 'object' || body === null) {
    throw ApiError.badRequest('Request body must be a JSON object')
  }
  const b = body as Record<string, unknown>

  const employmentType = requireString(b.employmentType, 'employmentType')
  if (!EMPLOYMENT_TYPES.includes(employmentType as never)) {
    throw ApiError.badRequest(
      `"employmentType" must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
    )
  }

  const status = b.status === undefined ? 'open' : requireString(b.status, 'status')
  if (!JOB_STATUSES.includes(status as never)) {
    throw ApiError.badRequest(`"status" must be one of: ${JOB_STATUSES.join(', ')}`)
  }

  const tags = Array.isArray(b.tags) ? b.tags.filter((t): t is string => typeof t === 'string') : []

  return {
    title: requireString(b.title, 'title'),
    company: requireString(b.company, 'company'),
    location: requireString(b.location, 'location'),
    remote: Boolean(b.remote),
    employmentType: employmentType as CreateJobInput['employmentType'],
    description: requireString(b.description, 'description'),
    tags,
    salaryMin: typeof b.salaryMin === 'number' ? b.salaryMin : null,
    salaryMax: typeof b.salaryMax === 'number' ? b.salaryMax : null,
    currency: typeof b.currency === 'string' && b.currency.trim() ? b.currency.trim() : 'USD',
    status: status as CreateJobInput['status'],
  }
}

export class JobService {
  constructor(private readonly repo: JobRepository = jobRepository) {}

  async list(query: JobQuery): Promise<Paginated<Job>> {
    const { items, total } = await this.repo.list(query)
    const page = Math.max(1, Math.trunc(query.page ?? 1))
    const pageSize = Math.min(100, Math.max(1, Math.trunc(query.pageSize ?? 12)))
    return {
      data: items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  async getById(id: string): Promise<Job> {
    const job = await this.repo.findById(id)
    if (!job) throw ApiError.notFound(`Job "${id}" not found`)
    return job
  }

  async create(input: unknown): Promise<Job> {
    return this.repo.create(parseCreateInput(input))
  }

  async update(id: string, input: UpdateJobInput): Promise<Job> {
    const updated = await this.repo.update(id, input)
    if (!updated) throw ApiError.notFound(`Job "${id}" not found`)
    return updated
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.delete(id)
    if (!deleted) throw ApiError.notFound(`Job "${id}" not found`)
  }
}

/** Default service instance. */
export const jobService = new JobService()
