import { Router } from 'express'
import { healthRoutes } from './health.routes'
import { jobRoutes } from './job.routes'

/** Root API router, mounted under `/api` in app.ts. */
export const apiRouter = Router()

apiRouter.use('/health', healthRoutes)
apiRouter.use('/jobs', jobRoutes)

// TODO: mount additional resource routers here, e.g.
// apiRouter.use('/users', userRoutes)
