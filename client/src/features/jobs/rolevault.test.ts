import { describe, expect, it } from 'vitest'
import type { Job } from '../../types/job'
import {
  computeRecommendations,
  createDefaultBrowseFilters,
  filterBrowseJobs,
  inferResumeSkills,
  parseResumeSkills,
} from './rolevault'

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    jobId: 1,
    employerName: 'Example Labs',
    position: 'Software Engineering Intern',
    jobType: 'internship',
    jobLocation: 'Toronto, ON',
    jobSummary: null,
    companySummary: null,
    postingDate: '2026-07-27',
    workModel: 'hybrid',
    sponsorshipAvailable: false,
    applicationDeadline: null,
    applicationLink: 'https://example.com/apply',
    numberOfApplicants: 0,
    sourceId: 'example-1',
    sourceRepo: 'test-fixture',
    descriptionRaw: null,
    season: 'Summer 2027',
    active: true,
    ...overrides,
  }
}

describe('resume skill matching', () => {
  it('detects supported skills from resume text and the file name without duplicates', () => {
    const skills = parseResumeSkills(
      'Built Python and TypeScript services with Python in Docker.',
      'react-candidate.pdf',
    )

    expect(skills).toEqual(['Python', 'TypeScript', 'React', 'Docker'])
  })

  it('adds relevant inferred skills and limits the recommendation profile to five', () => {
    const skills = inferResumeSkills(
      'Frontend engineer who also maintained cloud infrastructure.',
      'resume.pdf',
      ['Python'],
    )

    expect(skills).toEqual(['Python', 'React', 'TypeScript', 'JavaScript', 'Docker'])
  })

  it('ranks jobs by the percentage of resume skills found in the role', () => {
    const jobs = [
      makeJob({ jobId: 1, position: 'Python React Engineering Intern' }),
      makeJob({ jobId: 2, position: 'Python Data Intern' }),
      makeJob({ jobId: 3, position: 'Quality Assurance Intern' }),
    ]

    const recommendations = computeRecommendations(['Python', 'React'], jobs)

    expect(recommendations.map(({ job }) => job.jobId)).toEqual([1, 2, 3])
    expect(recommendations.map(({ score }) => score)).toEqual([100, 50, 0])
    expect(recommendations[0].matches).toEqual(['Python', 'React'])
  })

  it('returns no more than the five highest-ranked jobs', () => {
    const jobs = Array.from({ length: 7 }, (_, index) =>
      makeJob({ jobId: index + 1, position: `Python Intern ${index + 1}` }),
    )

    const recommendations = computeRecommendations(['Python'], jobs)

    expect(recommendations).toHaveLength(5)
    expect(recommendations.map(({ job }) => job.jobId)).toEqual([1, 2, 3, 4, 5])
  })

  it('returns no recommendations when skills or jobs are missing', () => {
    expect(computeRecommendations([], [makeJob()])).toEqual([])
    expect(computeRecommendations(['Python'], [])).toEqual([])
  })
})

describe('browse job filtering', () => {
  const jobs = [
    makeJob({
      jobId: 1,
      employerName: 'Acme',
      position: 'Backend Intern',
      sponsorshipAvailable: true,
    }),
    makeJob({
      jobId: 2,
      employerName: 'Beacon',
      position: 'Backend Engineer',
      jobType: 'new grad',
      sponsorshipAvailable: false,
    }),
    makeJob({
      jobId: 3,
      employerName: 'Acme',
      position: 'Frontend Intern',
      sponsorshipAvailable: true,
    }),
  ]

  it('keeps only jobs that offer sponsorship when requested', () => {
    const filtered = filterBrowseJobs(jobs, {
      ...createDefaultBrowseFilters(),
      sponsorship: 'yes',
    })

    expect(filtered.map((job) => job.jobId)).toEqual([1, 3])
  })

  it('keeps only jobs without sponsorship when requested', () => {
    const filtered = filterBrowseJobs(jobs, {
      ...createDefaultBrowseFilters(),
      sponsorship: 'no',
    })

    expect(filtered.map((job) => job.jobId)).toEqual([2])
  })

  it('combines normalized search text with the selected role type', () => {
    const filtered = filterBrowseJobs(jobs, {
      query: 'acme   toronto',
      types: ['Internship'],
      sponsorship: 'any',
    })

    expect(filtered.map((job) => job.jobId)).toEqual([1, 3])
  })
})
