/**
 * Express application factory.
 *
 * Assembles middleware and routes. Kept separate from `server.ts` so the app
 * can be imported in tests without binding a port.
 */

import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { apiRouter } from './routes'

export function createApp(): Express {
  const app = express()

  // Security & body parsing.
  app.use(helmet())
  app.use(cors({ origin: env.corsOrigin === '*' ? '*' : env.corsOrigin.split(',') }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Request logging.
  app.use(morgan(env.isProduction ? 'combined' : 'dev'))

  // API routes.
  app.use('/api', apiRouter)

  // 404 + error handling (must be last).
  app.use(notFound)
  app.use(errorHandler)

  return app
}
