import { Router } from 'express'
import { jobController } from '../controllers/job.controller'
import { asyncHandler } from '../utils/asyncHandler'
// import { validate } from '../middleware/validate'

export const jobRoutes = Router()

// GET /api/jobs — list jobs
jobRoutes.get('/', asyncHandler(jobController.list))

// POST /api/jobs — create a job
// TODO: add validation middleware, e.g. validate({ body: createJobSchema })
jobRoutes.post('/', asyncHandler(jobController.create))

// GET /api/jobs/:id — get a single job
jobRoutes.get('/:id', asyncHandler(jobController.getById))

// PATCH /api/jobs/:id — update a job
jobRoutes.patch('/:id', asyncHandler(jobController.update))

// DELETE /api/jobs/:id — delete a job
jobRoutes.delete('/:id', asyncHandler(jobController.remove))
