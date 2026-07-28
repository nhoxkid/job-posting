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

/**
 * Which origins may call the API.
 *
 * In development this accepts any `localhost`/`127.0.0.1` port rather than the
 * single configured one. Vite silently increments its port when 5173 is busy,
 * so a hard-coded origin means the browser starts getting CORS failures that
 * look exactly like "the API is down" — with the API sitting there answering
 * curl perfectly. Production still honours the configured list exactly.
 */
function corsOrigin(): cors.CorsOptions['origin'] {
  if (env.corsOrigin === '*') return '*'

  const allowed = env.corsOrigin.split(',').map((origin) => origin.trim())
  if (env.isProduction) return allowed

  return (origin, callback) => {
    // Same-origin and non-browser callers (curl, tests) send no Origin header.
    if (!origin) return callback(null, true)
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    callback(null, isLocal || allowed.includes(origin))
  }
}

export function createApp(): Express {
  const app = express()

  // Security & body parsing.
  //
  // `crossOriginResourcePolicy` is relaxed because this is an API serving a
  // browser client on a different origin; helmet's `same-origin` default would
  // block those reads even after CORS approves them.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(cors({ origin: corsOrigin() }))
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
