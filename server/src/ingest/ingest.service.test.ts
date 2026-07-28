import { describe, expect, it } from 'vitest'
import { runIngest } from './ingest.service'
import { InMemoryJobRepository } from '../repositories/job.repository'
import type { JobProvider, RawJob } from './types'

function stubProvider(slug: string, jobs: RawJob[], label = slug): JobProvider {
  return {
    slug,
    label,
    isConfigured: () => true,
    fetch: async () => jobs,
  }
}

function posting(overrides: Partial<RawJob> = {}): RawJob {
  return {
    externalId: 'x-1',
    title: 'Software Engineer Intern',
    company: 'Acme Labs',
    location: 'Seattle, WA',
    description: 'Python and SQL.',
    applyUrl: 'https://example.com/1',
    postedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  }
}

/** Empty repository — the seed data would otherwise collide with test rows. */
function emptyRepo() {
  return new InMemoryJobRepository([])
}

const silent = () => {}

describe('runIngest de-duplication', () => {
  it('collapses a posting repeated inside one provider batch', async () => {
    const repo = emptyRepo()
    const provider = stubProvider('dup', [
      posting({ externalId: 'a' }),
      posting({ externalId: 'b' }), // same company/title/region
    ])

    const { totals } = await runIngest({ providers: [provider], repository: repo, log: silent, enrichLimit: 0 })

    expect(totals.inserted).toBe(1)
    expect(totals.duplicates).toBe(1)
    expect((await repo.list({ pageSize: 50 })).total).toBe(1)
  })

  it('collapses the same opening carried by two different providers', async () => {
    const repo = emptyRepo()
    const ats = stubProvider('greenhouse', [posting({ externalId: 'gh-1' })])
    const aggregator = stubProvider('remotive', [
      // Same job, described slightly differently by the other source.
      posting({ externalId: 'rm-1', company: 'Acme Labs, Inc.', location: 'Seattle, Washington' }),
    ])

    const { totals } = await runIngest({
      providers: [ats, aggregator],
      repository: repo,
      log: silent, enrichLimit: 0,
    })

    expect(totals.inserted).toBe(1)
    expect(totals.duplicates).toBe(1)

    const stored = await repo.list({ pageSize: 50 })
    expect(stored.total).toBe(1)
    // The ATS ran first, so its copy is the one kept.
    expect(stored.items[0].source).toBe('greenhouse')
  })

  it('does not rewrite a row when a re-run returns identical content', async () => {
    const repo = emptyRepo()
    const provider = stubProvider('gh', [posting()])

    const first = await runIngest({ providers: [provider], repository: repo, log: silent, enrichLimit: 0 })
    expect(first.totals.inserted).toBe(1)

    const second = await runIngest({ providers: [provider], repository: repo, log: silent, enrichLimit: 0 })
    expect(second.totals.inserted).toBe(0)
    expect(second.totals.updated).toBe(0)
    expect(second.totals.duplicates).toBe(1)
  })

  it('updates the existing row when the posting content changes', async () => {
    const repo = emptyRepo()

    await runIngest({ providers: [stubProvider('gh', [posting()])], repository: repo, log: silent, enrichLimit: 0 })

    const changed = stubProvider('gh', [posting({ description: 'Now uses Go and Kubernetes.' })])
    const second = await runIngest({ providers: [changed], repository: repo, log: silent, enrichLimit: 0 })

    expect(second.totals.updated).toBe(1)
    const stored = await repo.list({ pageSize: 50 })
    expect(stored.total).toBe(1)
    expect(stored.items[0].skills).toEqual(expect.arrayContaining(['Go', 'Kubernetes']))
  })

  it('records an explicit sponsorship hint and leaves silence unknown', async () => {
    const repo = emptyRepo()
    const provider = stubProvider('gh', [
      posting({ externalId: 'a', title: 'Backend Intern', sponsorshipHint: 'yes' }),
      posting({ externalId: 'b', title: 'Frontend Intern', sponsorshipHint: 'no' }),
      posting({ externalId: 'c', title: 'Mobile Intern' }), // says nothing
    ])

    await runIngest({ providers: [provider], repository: repo, log: silent, enrichLimit: 0 })

    const stored = await repo.list({ pageSize: 50 })
    const byTitle = Object.fromEntries(stored.items.map((j) => [j.title, j.sponsorship]))
    expect(byTitle['Backend Intern']).toBe('yes')
    expect(byTitle['Frontend Intern']).toBe('no')
    expect(byTitle['Mobile Intern']).toBe('unknown')
  })

  it('keeps genuinely different postings apart', async () => {
    const repo = emptyRepo()
    const provider = stubProvider('gh', [
      posting({ externalId: 'a', title: 'Backend Intern' }),
      posting({ externalId: 'b', title: 'Frontend Intern' }),
      posting({ externalId: 'c', title: 'Backend Intern', company: 'Northwind' }),
    ])

    const { totals } = await runIngest({ providers: [provider], repository: repo, log: silent, enrichLimit: 0 })

    expect(totals.inserted).toBe(3)
    expect(totals.duplicates).toBe(0)
  })
})

describe('runIngest resilience', () => {
  it('counts non-early-careers postings as skipped, not failures', async () => {
    const repo = emptyRepo()
    const provider = stubProvider('gh', [
      posting({ externalId: 'a' }),
      posting({ externalId: 'b', title: 'Senior Staff Engineer' }),
    ])

    const { totals } = await runIngest({ providers: [provider], repository: repo, log: silent, enrichLimit: 0 })

    expect(totals.inserted).toBe(1)
    expect(totals.skipped).toBe(1)
  })

  it('continues past a failing provider and records the error', async () => {
    const repo = emptyRepo()
    const broken: JobProvider = {
      slug: 'broken',
      label: 'Broken',
      isConfigured: () => true,
      fetch: async () => {
        throw new Error('upstream 503')
      },
    }
    const healthy = stubProvider('gh', [posting()])

    const { reports, totals } = await runIngest({
      providers: [broken, healthy],
      repository: repo,
      log: silent, enrichLimit: 0,
    })

    expect(reports[0].error).toContain('upstream 503')
    // One bad source must not cost us the others.
    expect(totals.inserted).toBe(1)
  })
})
