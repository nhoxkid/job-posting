/**
 * Job controller: the HTTP boundary.
 *
 * Each handler is wired to a route. Fill in the bodies — read input from the
 * request, call `jobService`, and shape the response. They currently return
 * 501 Not Implemented.
 */

import type { Request, Response } from 'express'
// import { jobService } from '../services/job.service'

export const jobController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    // TODO: const result = await jobService.list(req.query)
    res.status(501).json({ error: { message: 'Not implemented: list jobs' } })
  },

  getById: async (_req: Request, res: Response): Promise<void> => {
    // TODO: const job = await jobService.getById(req.params.id)
    res.status(501).json({ error: { message: 'Not implemented: get job' } })
  },

  create: async (_req: Request, res: Response): Promise<void> => {
    // TODO: const job = await jobService.create(req.body)
    res.status(501).json({ error: { message: 'Not implemented: create job' } })
  },

  update: async (_req: Request, res: Response): Promise<void> => {
    // TODO: const job = await jobService.update(req.params.id, req.body)
    res.status(501).json({ error: { message: 'Not implemented: update job' } })
  },

  remove: async (_req: Request, res: Response): Promise<void> => {
    // TODO: await jobService.remove(req.params.id)
    res.status(501).json({ error: { message: 'Not implemented: delete job' } })
  },
}
