/**
 * Environment configuration.
 *
 * Loads variables from `.env` (via dotenv) and exposes them as a typed object.
 * Add new settings here as you wire up features (API keys, secrets, etc.).
 */

import dotenv from 'dotenv'

dotenv.config()

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',

  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 4000),

  // Comma-separated list of allowed origins, or `*`.
  corsOrigin: process.env.CORS_ORIGIN ?? '*',

  // SQL database connection. See src/db/index.ts.
  databaseUrl: process.env.DATABASE_URL ?? '',

  // TODO: add API keys / secrets here as needed, e.g.
  // apiKey: process.env.API_KEY ?? '',
  // jwtSecret: process.env.JWT_SECRET ?? '',
}
