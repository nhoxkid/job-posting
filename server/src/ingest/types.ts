/**
 * Ingestion contracts.
 *
 * A provider's only job is to fetch from one upstream and hand back `RawJob`s.
 * It does no normalising, no de-duplication and no database work — those happen
 * once, centrally, so every source gets identical treatment and adding a source
 * means writing one small file rather than touching the pipeline.
 *
 * ---------------------------------------------------------------------------
 * On sources
 * ---------------------------------------------------------------------------
 * The shipped providers read endpoints that are published for programmatic
 * consumption (company ATS boards and public job APIs). LinkedIn and Glassdoor
 * are deliberately NOT implemented: both forbid scraping in their terms and run
 * bot detection that a scraper would have to defeat. To include their listings,
 * license them through an aggregator that already has redistribution rights and
 * add it as a provider here — the rest of the pipeline needs no changes.
 */

/** A posting exactly as the upstream described it, before normalisation. */
export interface RawJob {
  /** The provider's own identifier. Must be stable across runs. */
  externalId: string
  title: string
  company: string
  /** Free-text location as the source wrote it, e.g. "Toronto, ON, Canada". */
  location: string
  /** Posting body. May be HTML; normalisation strips it. */
  description: string
  applyUrl: string
  /** ISO timestamp, or null when the source doesn't say. */
  postedAt: string | null
  /** Optional hints a source may provide; normalisation infers when absent. */
  remoteHint?: boolean
  employmentTypeHint?: string
  /**
   * Sponsorship as stated by the source.
   *
   * Curated datasets record this as a field, which beats inferring it from
   * prose — so when a provider sets this, normalisation trusts it instead of
   * running the regex over the description.
   */
  sponsorshipHint?: 'yes' | 'no'
}

/** One upstream source of postings. */
export interface JobProvider {
  /** Stable slug, stored on every row as provenance. */
  readonly slug: string
  /** Human-readable name for logs. */
  readonly label: string
  /**
   * Whether this provider can run right now. Providers needing an API key
   * return false when it isn't configured, and the runner skips them with a
   * notice rather than failing the whole run.
   */
  isConfigured(): boolean
  /** Fetch the current batch. Throws on network/parse failure. */
  fetch(): Promise<RawJob[]>
}

/** What one ingestion run did, per provider and in total. */
export interface IngestReport {
  provider: string
  fetched: number
  /** Rejected by normalisation, e.g. not an early-careers role. */
  skipped: number
  inserted: number
  updated: number
  /** Collapsed into an existing row by fingerprint or content hash. */
  duplicates: number
  error?: string
}
