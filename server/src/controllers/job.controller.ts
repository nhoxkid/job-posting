/**
 * Job controller: the HTTP boundary.
 *
 * Reads request parameters, calls the job service, and sends the appropriate
 * HTTP response. Business logic and database access remain in the service and
 * repository layers.
 */

import type { Request, Response } from 'express'
import {
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  type EmploymentType,
  type JobQuery,
  type JobStatus,
} from '../models/job'
import { jobService } from '../services/job.service'
import { ApiError } from '../utils/ApiError'

function firstQueryValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function parsePositiveInteger(value: unknown, name: string, maximum?: number): number | undefined {
  const text = firstQueryValue(value)
  if (text === undefined || text.trim() === '') return undefined

  const number = Number(text)
  if (!Number.isInteger(number) || number < 1 || (maximum !== undefined && number > maximum)) {
    const range = maximum === undefined ? 'a positive integer' : `an integer from 1 to ${maximum}`
    throw ApiError.badRequest(`"${name}" must be ${range}`)
  }

  return number
}

function parseRemote(value: unknown): boolean | undefined {
  const text = firstQueryValue(value)
  if (text === undefined || text.trim() === '') return undefined
  if (text === 'true') return true
  if (text === 'false') return false
  throw ApiError.badRequest('"remote" must be either true or false')
}

function parseEmploymentType(value: unknown): EmploymentType | undefined {
  const text = firstQueryValue(value)
  if (text === undefined || text.trim() === '') return undefined

  if (!EMPLOYMENT_TYPES.includes(text as EmploymentType)) {
    throw ApiError.badRequest(
      `"employmentType" must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
    )
  }

  return text as EmploymentType
}

function parseStatus(value: unknown): JobStatus | undefined {
  const text = firstQueryValue(value)
  if (text === undefined || text.trim() === '') return undefined

  if (!JOB_STATUSES.includes(text as JobStatus)) {
    throw ApiError.badRequest(`"status" must be one of: ${JOB_STATUSES.join(', ')}`)
  }

  return text as JobStatus
}

function parseJobQuery(req: Request): JobQuery {
  const search = firstQueryValue(req.query.search)?.trim()
  const employmentType = parseEmploymentType(req.query.employmentType)
  const remote = parseRemote(req.query.remote)
  const status = parseStatus(req.query.status)
  const page = parsePositiveInteger(req.query.page, 'page')
  const pageSize = parsePositiveInteger(req.query.pageSize, 'pageSize', 100)

  return {
    ...(search ? { search } : {}),
    ...(employmentType !== undefined ? { employmentType } : {}),
    ...(remote !== undefined ? { remote } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(page !== undefined ? { page } : {}),
    ...(pageSize !== undefined ? { pageSize } : {}),
  }
}

export const jobController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await jobService.list(parseJobQuery(req))
    res.status(200).json(result)
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.getById(req.params.id)
    res.status(200).json(job)
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.create(req.body)
    res.status(201).json(job)
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.update(req.params.id, req.body)
    res.status(200).json(job)
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await jobService.remove(req.params.id)
    res.status(204).send()
  },
}
