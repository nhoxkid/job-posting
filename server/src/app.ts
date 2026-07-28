/**
 * Express application factory.
 *
 * Assembles middleware and routes. Kept separate from `server.ts` so the app
 * can be imported in tests without binding a port.
 */

import cookieParser from 'cookie-parser'
import cors, { type CorsOptions } from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { assertAuthConfig, env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { apiRouter } from './routes'

/** Any http://localhost:PORT or http://127.0.0.1:PORT origin. */
const LOCALHOST_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

/**
 * Which origins may make credentialed requests.
 *
 * In development, any localhost port is allowed. Vite does not guarantee a
 * port — if 5173 is taken it silently moves to 5174, 5175, ... and a
 * hardcoded `CORS_ORIGIN=http://localhost:5173` then blocks every request,
 * which surfaces in the UI as an unexplained "Network error".
 *
 * In production the configured origins are enforced exactly; `*` reflects the
 * caller (a literal `*` is illegal alongside credentials).
 */
function corsOriginPolicy(): CorsOptions['origin'] {
  const configured = env.corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (env.isProduction) {
    return env.corsOrigin === '*' ? true : configured
  }

  return (origin, callback) => {
    // Same-origin/non-browser callers (curl, health checks) send no Origin.
    if (!origin) return callback(null, true)
    if (LOCALHOST_ORIGIN.test(origin) || configured.includes(origin)) {
      return callback(null, true)
    }
    callback(null, false)
  }
}

export function createApp(): Express {
  // Fails fast on an unusable auth config (e.g. no SESSION_SECRET in
  // production) before the app can serve a single request.
  assertAuthConfig()

  const app = express()

  // Security & body parsing.
  app.use(helmet())
  // `credentials: true` is required for the browser to send the httpOnly
  // session cookie cross-origin (client and API are on different ports). The
  // spec forbids pairing credentials with `Access-Control-Allow-Origin: *`, so
  // a configured `*` reflects the caller's origin instead.
  app.use(cors({ origin: corsOriginPolicy(), credentials: true }))
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
