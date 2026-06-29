/**
 * Server entrypoint: connects to the database, binds the Express app to a port,
 * and handles graceful shutdown.
 */

import { createApp } from './app'
import { env } from './config/env'
import { closeDatabase, connectToDatabase } from './db'
import { ensureSchemaAndSeed } from './repositories/seed'

async function start(): Promise<void> {
  // Connect to PostgreSQL only when explicitly selected; the default
  // in-memory driver needs no database.
  if (env.dbDriver === 'postgres') {
    await connectToDatabase()
    await ensureSchemaAndSeed()
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

void start()
