/**
 * Express application factory.
 *
 * Assembles middleware and routes. Kept separate from `server.ts` so the app
 * can be imported in tests without binding a port.
 */

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { assertAuthConfig, env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { apiRouter } from './routes'

export function createApp(): Express {
  // Fails fast on an unusable auth config (e.g. no SESSION_SECRET in
  // production) before the app can serve a single request.
  assertAuthConfig()

  const app = express()

  // Security & body parsing.
  app.use(helmet())
  // `credentials: true` is required for the browser to send the httpOnly
  // session cookie cross-origin (client on :5173, API on :4000). The spec
  // forbids pairing credentials with `Access-Control-Allow-Origin: *`, so a
  // configured `*` reflects the caller's origin instead.
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  // Request logging.
  app.use(morgan(env.isProduction ? 'combined' : 'dev'))

  // API routes.
  app.use('/api', apiRouter)

  // 404 + error handling (must be last).
  app.use(notFound)
  app.use(errorHandler)

  return app
}
