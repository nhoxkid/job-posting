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

  /* ---- Job ingestion (see src/ingest) ---- */

  // Comma-separated Greenhouse board tokens, each optionally "token=Display Name".
  // Empty falls back to the default crawl in src/ingest/providers/index.ts.
  ingestGreenhouseBoards: process.env.INGEST_GREENHOUSE_BOARDS ?? '',

  // Comma-separated Lever company slugs, same "slug=Display Name" form.
  ingestLeverCompanies: process.env.INGEST_LEVER_COMPANIES ?? '',

  // Max postings per provider to fetch full descriptions for. Curated feeds
  // list far more than that; the remainder keep a composed summary.
  ingestEnrichLimit: process.env.INGEST_ENRICH_LIMIT ?? '400',

  // TODO: add API keys / secrets here as needed, e.g.
  // apiKey: process.env.API_KEY ?? '',
  // jwtSecret: process.env.JWT_SECRET ?? '',
}
