import { describe, expect, it, vi } from 'vitest'
import type { Job } from '../models/job'
import { InMemoryJobRepository } from '../repositories/job.repository'
import { JobService } from './job.service'

function createJob(overrides: Partial<Job> = {}): Job {
  return {
    jobId: 1,
    employerName: 'Example Labs',
    position: 'Software Intern',
    jobType: 'internship',
    jobLocation: 'Toronto, ON',
    jobSummary: null,
    companySummary: null,
    postingDate: '2026-07-27',
    workModel: 'hybrid',
    sponsorshipAvailable: false,
    applicationDeadline: null,
    applicationLink: 'https://example.com/jobs/1',
    numberOfApplicants: 0,
    sourceId: 'example-1',
    sourceRepo: 'example/jobs',
    descriptionRaw: null,
    season: 'Summer 2027',
    active: true,
    ...overrides,
  }
}

describe('JobService summary enrichment', () => {
  it('replaces a legacy copied excerpt with a generated structured summary', async () => {
    const description = 'Detailed source description. '.repeat(30)
    const repository = new InMemoryJobRepository([
      createJob({
        descriptionRaw: description,
        jobSummary: `${description.slice(0, 300)}...`,
        companySummary: 'Example Labs is hiring for engineering and technical roles.',
      }),
    ])
    const descriptions = {
      fetchJobDescription: vi.fn(async () => null),
    }
    const summaries = {
      isConfigured: vi.fn(() => true),
      generateSummaries: vi.fn(async () => ({
        roleSummary:
          'Role overview\nA genuine Gemini summary.\n\nCompensation\n$35 CAD per hour.',
        companySummary: 'Example Labs develops software for public infrastructure.',
      })),
    }
    const service = new JobService(repository, descriptions, summaries)

    const result = await service.getById(1)

    expect(result.jobSummary).toContain('A genuine Gemini summary')
    expect(result.jobSummary).not.toContain(description.slice(0, 100))
    expect(result.companySummary).toContain('public infrastructure')
    expect(descriptions.fetchJobDescription).not.toHaveBeenCalled()
    expect(summaries.generateSummaries).toHaveBeenCalledWith(
      'Example Labs',
      'Software Intern',
      description,
    )
  })

  it('removes legacy fallback text without scraping when Gemini is not configured', async () => {
    const description = 'Detailed source description. '.repeat(30)
    const repository = new InMemoryJobRepository([
      createJob({
        descriptionRaw: description,
        jobSummary: `${description.slice(0, 300)}...`,
        companySummary: '[Company Summary Unavailable - Please set GEMINI_API_KEY]',
      }),
    ])
    const descriptions = {
      fetchJobDescription: vi.fn(async () => null),
    }
    const summaries = {
      isConfigured: vi.fn(() => false),
      generateSummaries: vi.fn(async () => ({
        roleSummary: null,
        companySummary: null,
      })),
    }
    const service = new JobService(repository, descriptions, summaries)

    const result = await service.getById(1)

    expect(result.jobSummary).toBeNull()
    expect(result.companySummary).toBeNull()
    expect(descriptions.fetchJobDescription).not.toHaveBeenCalled()
    expect(summaries.generateSummaries).not.toHaveBeenCalled()
  })
})
