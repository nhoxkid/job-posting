/**
 * Server entrypoint: connects to the database, imports initial job listings,
 * binds the Express app to a port, and handles graceful shutdown.
 */

import { createApp } from './app'
import { env } from './config/env'
import { closeDatabase, connectToDatabase } from './db'
import { ensureSchemaAndSeed } from './repositories/seed'
import { ingestService } from './services/ingest.service'

async function start(): Promise<void> {
  // Connect to PostgreSQL only when explicitly selected; the default
  // in-memory driver needs no database.
  if (env.dbDriver === 'postgres') {
    await connectToDatabase()
    await ensureSchemaAndSeed()
  } else {
    // In-memory mode: auto-ingest local listings.json on startup
    const res = await ingestService.ingestFromLocalFile()
    console.log(`Loaded ${res.created} job postings into in-memory storage from local listings.json`)
  }

  const app = createApp()

  const server = app.listen(env.port, env.host, () => {
    console.log(
      `API listening on http://${env.host}:${env.port} [${env.nodeEnv}] (db: ${env.dbDriver})`,
    )
  })

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`)
    server.close(() => undefined)
    await closeDatabase()
    process.exit(0)
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

start().catch((err: unknown) => {
  // Without this the process exits silently on a startup failure (e.g. a bad
  // schema statement) *before* app.listen(), leaving the API unreachable with
  // no obvious cause.
  console.error('Failed to start server:', err)
  process.exit(1)
})
