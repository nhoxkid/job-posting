/**
 * Job controller: the HTTP boundary.
 *
 * Each handler reads input from the request, calls `jobService`, and shapes the
 * response. Errors are thrown as `ApiError` and translated by the error
 * middleware (handlers are wrapped in `asyncHandler`).
 */

import type { Request, Response } from 'express'
import type { EmploymentType, JobQuery, JobStatus } from '../models/job'
import { jobService } from '../services/job.service'

/** Parse and coerce list query params from their string representations. */
function parseListQuery(q: Request['query']): JobQuery {
  const query: JobQuery = {}

  if (typeof q.search === 'string' && q.search.trim()) query.search = q.search.trim()
  if (typeof q.employmentType === 'string') query.employmentType = q.employmentType as EmploymentType
  if (typeof q.status === 'string') query.status = q.status as JobStatus
  if (typeof q.remote === 'string') query.remote = q.remote === 'true'

  const page = Number(q.page)
  if (Number.isFinite(page) && page > 0) query.page = page
  const pageSize = Number(q.pageSize)
  if (Number.isFinite(pageSize) && pageSize > 0) query.pageSize = pageSize

  return query
}

export const jobController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const result = await jobService.list(parseListQuery(req.query))
    res.json(result)
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.getById(req.params.id)
    res.json(job)
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.create(req.body)
    res.status(201).json(job)
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const job = await jobService.update(req.params.id, req.body)
    res.json(job)
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    await jobService.remove(req.params.id)
    res.status(204).end()
  },
}
