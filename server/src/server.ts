/**
 * Server entrypoint: connects to the database, binds the Express app to a port,
 * and handles graceful shutdown.
 */

import { createApp } from './app'
import { env } from './config/env'
import { closeDatabase, connectToDatabase } from './db'

async function start(): Promise<void> {
  // TODO: enable once DATABASE_URL is configured.
  // await connectToDatabase()
  void connectToDatabase

  const app = createApp()

  const server = app.listen(env.port, env.host, () => {
    console.log(`API listening on http://${env.host}:${env.port} [${env.nodeEnv}]`)
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
