/**
 * Ingestion entry point: `npm run ingest -w @job-posting/server`.
 *
 * Deliberately a separate process from the API rather than a timer inside it.
 * A crawl is bursty, occasionally slow, and sometimes fails — none of which
 * should share a process with request serving. Run it from cron, a scheduled
 * container, or by hand.
 */

import { env } from '../config/env'
import { closeDatabase, connectToDatabase } from '../db'
import { runIngest } from './ingest.service'

async function main(): Promise<void> {
  const usingPostgres = env.dbDriver === 'postgres'

  if (usingPostgres) {
    await connectToDatabase()
  } else {
    console.warn(
      'DB_DRIVER is "memory", so ingested jobs live only for this process and are ' +
        'discarded on exit. Set DB_DRIVER=postgres and DATABASE_URL to persist them.',
    )
  }

  console.log('Starting ingestion...\n')
  const summary = await runIngest()

  console.log('\n--- Summary ---')
  console.table(summary.reports)
  const { fetched, skipped, inserted, updated, duplicates } = summary.totals
  console.log(
    `Fetched ${fetched} · inserted ${inserted} · updated ${updated} · ` +
      `duplicate/unchanged ${duplicates} · skipped (not early-careers) ${skipped}`,
  )

  const failures = summary.reports.filter((report) => report.error)
  if (failures.length > 0) {
    console.error(`\n${failures.length} provider(s) failed.`)
  }

  if (usingPostgres) await closeDatabase()

  // Non-zero only when every provider failed: a partial crawl is still a
  // successful run, and a scheduler shouldn't alert on one flaky source.
  process.exit(failures.length === summary.reports.length && failures.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Ingestion crashed:', error)
  process.exit(1)
})
