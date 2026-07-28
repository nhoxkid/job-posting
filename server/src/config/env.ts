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

  // Data source: 'memory' (default, no database required) or 'postgres'.
  dbDriver: (process.env.DB_DRIVER ?? 'memory') as 'memory' | 'postgres',

  // SQL database connection. See src/db/index.ts. Only used when dbDriver is 'postgres'.
  databaseUrl: process.env.DATABASE_URL ?? '',

  // Gemini API key for on-demand job summary generation
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',

  // Shared secret for GitHub Actions webhook ingest
  ingestSecret: process.env.INGEST_SECRET ?? '',
}
