/**
 * Job service: business logic layer (HTTP- and storage-agnostic).
 *
 * Depends on the `JobRepository` interface. Validates input, applies defaults,
 * shapes paginated responses, and coordinates on-demand AI enrichment.
 */

import { JOB_TYPES } from '../models/job'
import type { CreateJobInput, Job, JobQuery, UpdateJobInput } from '../models/job'
import { jobRepository, type JobRepository } from '../repositories/job.repository'
import { ApiError } from '../utils/ApiError'
import { enrichmentService } from './enrichment.service'
import { geminiService } from './gemini.service'

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

  const jobType = b.jobType === undefined ? 'internship' : requireString(b.jobType, 'jobType')
  if (!JOB_TYPES.includes(jobType as never)) {
    throw ApiError.badRequest(`"jobType" must be one of: ${JOB_TYPES.join(', ')}`)
  }

  return {
    employerName: requireString(b.employerName, 'employerName'),
    position: requireString(b.position, 'position'),
    jobType: jobType as CreateJobInput['jobType'],
    jobLocation: requireString(b.jobLocation, 'jobLocation'),
    workModel:
      typeof b.workModel === 'string'
        ? (b.workModel as CreateJobInput['workModel'])
        : 'In-person',
    sponsorshipAvailable: Boolean(b.sponsorshipAvailable),
    applicationLink: requireString(b.applicationLink, 'applicationLink'),
    jobSummary: typeof b.jobSummary === 'string' ? b.jobSummary.trim() : undefined,
    companySummary: typeof b.companySummary === 'string' ? b.companySummary.trim() : undefined,
    postingDate: typeof b.postingDate === 'string' ? b.postingDate : undefined,
    applicationDeadline:
      typeof b.applicationDeadline === 'string' ? b.applicationDeadline : undefined,
    sourceId: typeof b.sourceId === 'string' ? b.sourceId : undefined,
    sourceRepo: typeof b.sourceRepo === 'string' ? b.sourceRepo : undefined,
    descriptionRaw: typeof b.descriptionRaw === 'string' ? b.descriptionRaw : undefined,
    season: typeof b.season === 'string' ? b.season : undefined,
    active: typeof b.active === 'boolean' ? b.active : undefined,
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

  async getById(id: number): Promise<Job> {
    let job = await this.repo.findById(id)
    if (!job) throw ApiError.notFound(`Job "${id}" not found`)

    // On-demand AI enrichment: if summaries are missing, scrape description & call Gemini
    if (!job.jobSummary || !job.companySummary) {
      let descriptionRaw = job.descriptionRaw
      if (!descriptionRaw) {
        descriptionRaw = await enrichmentService.fetchJobDescription(job.applicationLink)
      }

      const summaries = await geminiService.generateSummaries(
        job.employerName,
        job.position,
        descriptionRaw,
      )

      const updated = await this.repo.update(id, {
        descriptionRaw: descriptionRaw ?? undefined,
        jobSummary: summaries.roleSummary,
        companySummary: summaries.companySummary,
      })
      if (updated) job = updated
    }

    return job
  }

  async create(input: unknown): Promise<Job> {
    return this.repo.create(parseCreateInput(input))
  }

  async update(id: number, input: UpdateJobInput): Promise<Job> {
    const updated = await this.repo.update(id, input)
    if (!updated) throw ApiError.notFound(`Job "${id}" not found`)
    return updated
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.repo.delete(id)
    if (!deleted) throw ApiError.notFound(`Job "${id}" not found`)
  }
}

/** Default service instance. */
export const jobService = new JobService()
