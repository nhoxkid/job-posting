import { describe, expect, it } from 'vitest'
import {
  classifyJobType,
  classifyRegion,
  contentHashOf,
  detectSponsorship,
  extractSkills,
  fingerprintOf,
  htmlToText,
  normalizeJob,
} from './normalize'
import type { RawJob } from './types'

function raw(overrides: Partial<RawJob> = {}): RawJob {
  return {
    externalId: 'abc-1',
    title: 'Software Engineer Intern',
    company: 'Acme Labs',
    location: 'Seattle, WA',
    description: 'Work in Python and React. Visa sponsorship is available.',
    applyUrl: 'https://example.com/apply',
    postedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('classifyJobType', () => {
  it.each([
    ['Software Engineer Intern', 'Internship'],
    ['Engineering Co-op - Fall 2026', 'Co-op'],
    ['New Grad Software Engineer', 'New Grad'],
    ['Graduate Software Developer', 'New Grad'],
    ['Entry-Level Backend Developer', 'New Grad'],
  ])('classifies %s as %s', (title, expected) => {
    expect(classifyJobType(title)).toBe(expected)
  })

  it('prefers Co-op when a title says both', () => {
    // Co-op postings routinely mention "intern" too; the more specific term wins.
    expect(classifyJobType('Software Engineering Co-op / Intern')).toBe('Co-op')
  })

  it('rejects roles that are not early-careers', () => {
    expect(classifyJobType('Senior Software Engineer')).toBeNull()
    expect(classifyJobType('Engineering Manager')).toBeNull()
    expect(classifyJobType('Staff Data Scientist')).toBeNull()
  })

  it('rejects a senior title even when a hint says internship', () => {
    expect(classifyJobType('Senior Engineer', 'Intern')).toBeNull()
  })

  it('uses the employment-type hint when the title is silent', () => {
    expect(classifyJobType('Software Engineer', 'Internship')).toBe('Internship')
  })
})

describe('classifyRegion', () => {
  it.each([
    ['London, England', 'United Kingdom'],
    ['Toronto, ON, Canada', 'Canada'],
    ['Austin, TX', 'United States'],
    ['Remote - Worldwide', 'Remote'],
  ])('maps %s to %s', (location, expected) => {
    expect(classifyRegion(location)).toBe(expected)
  })

  it('prefers Remote over the country when a posting is both', () => {
    expect(classifyRegion('Remote - Canada')).toBe('Remote')
  })

  it('honours an explicit remote hint over the location text', () => {
    expect(classifyRegion('London, UK', true)).toBe('Remote')
  })
})

describe('detectSponsorship', () => {
  it('reads positive phrasing as sponsored', () => {
    expect(detectSponsorship('Visa sponsorship is available for this role.')).toBe('yes')
    expect(detectSponsorship('We sponsor work visas.')).toBe('yes')
  })

  it('lets negative phrasing win even though it contains "sponsor"', () => {
    expect(detectSponsorship('We are unable to sponsor visas for this position.')).toBe('no')
    expect(detectSponsorship('This role does not offer visa sponsorship.')).toBe('no')
    expect(detectSponsorship('No visa sponsorship is provided.')).toBe('no')
  })

  it('reports silence as unknown rather than as a refusal', () => {
    // The whole point of the tri-state: most postings never mention it, and
    // "no" would assert a rejection the employer never made.
    expect(detectSponsorship('Great team, free lunch.')).toBe('unknown')
  })
})

describe('extractSkills', () => {
  it('finds vocabulary terms including punctuated ones', () => {
    const skills = extractSkills('Experience with C++, .NET and Node.js required.')
    expect(skills).toContain('C++')
    expect(skills).toContain('.NET')
    expect(skills).toContain('Node.js')
  })

  it('does not match a term inside a longer word', () => {
    expect(extractSkills('We use Gitlab pipelines')).not.toContain('Git')
  })

  it('does not treat prose as a one- or two-letter language name', () => {
    // Seen on real postings: "R" matched ordinary prose and "Go" matched the
    // English verb, putting language chips on non-engineering roles.
    expect(extractSkills('You will go above and beyond for our customers.')).not.toContain('Go')
    expect(extractSkills('Reports are reviewed by the r&d group weekly.')).not.toContain('R')
  })

  it('still matches short names written properly', () => {
    expect(extractSkills('Backend services are written in Go.')).toContain('Go')
    expect(extractSkills('Statistical work in R and Python.')).toContain('R')
  })

  it('caps the number returned', () => {
    const text = 'Python JavaScript TypeScript Java Go Rust SQL React Docker AWS Linux'
    expect(extractSkills(text, 3)).toHaveLength(3)
  })
})

describe('htmlToText', () => {
  it('strips markup and keeps readable structure', () => {
    const text = htmlToText('<p>Build things</p><ul><li>Ship code</li></ul>')
    expect(text).toContain('Build things')
    expect(text).toContain('• Ship code')
    expect(text).not.toContain('<')
  })

  it('drops script content entirely', () => {
    expect(htmlToText('<script>alert(1)</script>Hello')).toBe('Hello')
  })
})

describe('fingerprintOf — cross-source identity', () => {
  it('matches across trivial company and title differences', () => {
    // This is what collapses the same opening listed by two providers.
    expect(fingerprintOf('Acme Labs, Inc.', 'Software Engineer Intern', 'United States')).toBe(
      fingerprintOf('acme labs', 'software  engineer intern', 'United States'),
    )
  })

  it('separates different roles at the same company', () => {
    expect(fingerprintOf('Acme', 'Backend Intern', 'United States')).not.toBe(
      fingerprintOf('Acme', 'Frontend Intern', 'United States'),
    )
  })

  it('separates the same role in different regions', () => {
    expect(fingerprintOf('Acme', 'Backend Intern', 'Canada')).not.toBe(
      fingerprintOf('Acme', 'Backend Intern', 'United States'),
    )
  })
})

describe('normalizeJob', () => {
  it('produces a canonical job from a raw posting', () => {
    const job = normalizeJob(raw(), 'greenhouse')
    expect(job).not.toBeNull()
    expect(job).toMatchObject({
      title: 'Software Engineer Intern',
      company: 'Acme Labs',
      type: 'Internship',
      region: 'United States',
      sponsorship: 'yes',
      source: 'greenhouse',
      externalId: 'abc-1',
    })
    expect(job!.skills).toEqual(expect.arrayContaining(['Python', 'React']))
    expect(job!.fingerprint).toHaveLength(40)
    expect(job!.contentHash).toHaveLength(40)
  })

  it('rejects senior roles', () => {
    expect(normalizeJob(raw({ title: 'Principal Engineer' }), 'lever')).toBeNull()
  })

  it('rejects postings missing required fields', () => {
    expect(normalizeJob(raw({ company: '' }), 'lever')).toBeNull()
    expect(normalizeJob(raw({ applyUrl: '' }), 'lever')).toBeNull()
  })

  it('gives the same fingerprint to the same job from two providers', () => {
    const fromAts = normalizeJob(raw({ externalId: 'gh-1' }), 'greenhouse')
    const fromAggregator = normalizeJob(
      raw({ externalId: 'rm-9', company: 'Acme Labs Inc', location: 'Seattle, Washington' }),
      'remotive',
    )
    expect(fromAts!.fingerprint).toBe(fromAggregator!.fingerprint)
  })

  it('defaults postedAt to now when the source omits it', () => {
    const job = normalizeJob(raw({ postedAt: null }), 'lever')
    expect(Number.isNaN(Date.parse(job!.postedAt))).toBe(false)
  })
})

describe('contentHashOf', () => {
  it('changes when a displayed field changes', () => {
    const job = normalizeJob(raw(), 'greenhouse')!
    const edited = { ...job, title: 'Backend Intern' }
    expect(contentHashOf(edited)).not.toBe(job.contentHash)
  })

  it('ignores fields that do not affect the posting', () => {
    const job = normalizeJob(raw(), 'greenhouse')!
    // `applied` is our own counter, not part of the upstream posting.
    expect(contentHashOf({ ...job, applied: 99 })).toBe(job.contentHash)
  })
})
