import { Router } from 'express'
import { healthRoutes } from './health.routes'
import { ingestRouter } from './ingest.routes'
import { jobRoutes } from './job.routes'
import { preferencesRoutes } from './preferences.routes'

/** Root API router, mounted under `/api` in app.ts. */
export const apiRouter = Router()

apiRouter.use('/health', healthRoutes)
apiRouter.use('/jobs', jobRoutes)
apiRouter.use('/preferences', preferencesRoutes)
apiRouter.use('/ingest', ingestRouter)
