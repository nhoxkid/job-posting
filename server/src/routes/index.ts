import { Router } from 'express'
import { healthRoutes } from './health.routes'
import { ingestRoutes } from './ingest.routes'
import { jobRoutes } from './job.routes'
import { preferencesRoutes } from './preferences.routes'

/** Root API router, mounted under `/api` in app.ts. */
export const apiRouter = Router()

apiRouter.use('/health', healthRoutes)
apiRouter.use('/jobs', jobRoutes)
apiRouter.use('/preferences', preferencesRoutes)
apiRouter.use('/ingest', ingestRoutes)

// TODO: mount additional resource routers here, e.g.
// apiRouter.use('/users', userRoutes)
