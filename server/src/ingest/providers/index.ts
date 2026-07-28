/**
 * Provider registry.
 *
 * Which sources run is configuration, not code: boards are listed in env vars
 * so adding a company to the crawl doesn't need a deploy of new logic.
 *
 * To add a licensed LinkedIn/Glassdoor feed, write a provider that implements
 * `JobProvider` against that vendor's API and append it here. Nothing else in
 * the pipeline changes — normalisation, de-duplication and persistence are all
 * source-agnostic.
 */

import { env } from '../../config/env'
import type { JobProvider } from '../types'
import { greenhouseProviders } from './greenhouse'
import { simplifyInternshipsProvider, simplifyNewGradProvider } from './simplify'
import { leverProviders } from './lever'
import { remotiveProvider } from './remotive'

/**
 * A default crawl so `npm run ingest` does something useful out of the box.
 *
 * Every board here was checked to resolve and to carry early-careers roles.
 * Expect the yield to be small and seasonal: these boards run 100–800 postings
 * each but only a handful are internships or new-grad roles at any moment, and
 * that number collapses outside the autumn recruiting cycle. Widen the crawl
 * through INGEST_GREENHOUSE_BOARDS / INGEST_LEVER_COMPANIES rather than by
 * loosening the classifier — a board full of senior roles is not a bug.
 */
const DEFAULT_GREENHOUSE_BOARDS = [
  'stripe=Stripe',
  'databricks=Databricks',
  'figma=Figma',
  'robinhood=Robinhood',
  'flexport=Flexport',
  'nuro=Nuro',
  'scaleai=Scale AI',
]

// Lever's public boards are sparser than Greenhouse's, and several well-known
// companies have migrated off it — a slug that 404s or returns an empty array
// is a stale board, not a broken provider.
const DEFAULT_LEVER_COMPANIES = ['matchgroup=Match Group']

function parseList(value: string, fallback: string[]): string[] {
  const entries = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return entries.length > 0 ? entries : fallback
}

export function buildProviders(): JobProvider[] {
  return [
    // Curated early-careers datasets first. They carry recorded sponsorship
    // and far better coverage, and running them first means their copy wins
    // when the same opening also appears on a company's own board.
    simplifyInternshipsProvider(),
    simplifyNewGradProvider(),
    ...greenhouseProviders(parseList(env.ingestGreenhouseBoards, DEFAULT_GREENHOUSE_BOARDS)),
    ...leverProviders(parseList(env.ingestLeverCompanies, DEFAULT_LEVER_COMPANIES)),
    remotiveProvider(),
  ].filter((provider) => provider.isConfigured())
}

export { simplifyInternshipsProvider, simplifyNewGradProvider } from './simplify'
export { greenhouseProvider, greenhouseProviders } from './greenhouse'
export { leverProvider, leverProviders } from './lever'
export { remotiveProvider } from './remotive'
