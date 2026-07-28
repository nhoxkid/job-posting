import { expect, test, type Page, type Route } from '@playwright/test'
import type { Job } from '../client/src/types/job'

const jobs: Job[] = [
  {
    jobId: 1,
    employerName: 'Northstar AI',
    position: 'Python React TypeScript SQL Intern',
    jobType: 'internship',
    jobLocation: 'Toronto, ON',
    jobSummary: null,
    companySummary: null,
    postingDate: '2026-07-27',
    workModel: 'hybrid',
    sponsorshipAvailable: true,
    applicationDeadline: null,
    applicationLink: 'https://example.com/northstar',
    numberOfApplicants: 12,
    sourceId: 'northstar-1',
    sourceRepo: 'e2e-fixture',
    descriptionRaw: null,
    season: 'Summer 2027',
    active: true,
  },
  {
    jobId: 2,
    employerName: 'Beacon Systems',
    position: 'JavaScript Frontend Intern',
    jobType: 'internship',
    jobLocation: 'Vancouver, BC',
    jobSummary: null,
    companySummary: null,
    postingDate: '2026-07-26',
    workModel: 'remote',
    sponsorshipAvailable: false,
    applicationDeadline: null,
    applicationLink: 'https://example.com/beacon',
    numberOfApplicants: 8,
    sourceId: 'beacon-1',
    sourceRepo: 'e2e-fixture',
    descriptionRaw: null,
    season: 'Summer 2027',
    active: true,
  },
  {
    jobId: 3,
    employerName: 'Data Harbour',
    position: 'SQL Data Engineering New Grad',
    jobType: 'new grad',
    jobLocation: 'Remote, Canada',
    jobSummary: null,
    companySummary: null,
    postingDate: '2026-07-25',
    workModel: 'remote',
    sponsorshipAvailable: true,
    applicationDeadline: null,
    applicationLink: 'https://example.com/data-harbour',
    numberOfApplicants: 20,
    sourceId: 'data-harbour-1',
    sourceRepo: 'e2e-fixture',
    descriptionRaw: null,
    season: 'New Grad 2027',
    active: true,
  },
  {
    jobId: 4,
    employerName: 'Quality Works',
    position: 'Java Quality Assurance Intern',
    jobType: 'internship',
    jobLocation: 'Montreal, QC',
    jobSummary: null,
    companySummary: null,
    postingDate: '2026-07-24',
    workModel: 'In-person',
    sponsorshipAvailable: false,
    applicationDeadline: null,
    applicationLink: 'https://example.com/quality-works',
    numberOfApplicants: 4,
    sourceId: 'quality-works-1',
    sourceRepo: 'e2e-fixture',
    descriptionRaw: null,
    season: 'Fall 2027',
    active: true,
  },
]

const signedInUser = {
  userId: 101,
  email: 'candidate@example.com',
  displayName: 'Test Candidate',
  avatarUrl: null,
  role: 'applicant',
  createdAt: '2026-07-27T12:00:00.000Z',
}

const corsHeaders = {
  'access-control-allow-credentials': 'true',
  'access-control-allow-origin': 'http://127.0.0.1:4173',
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: corsHeaders,
    body: JSON.stringify(body),
  })
}

async function mockApi(page: Page) {
  await page.route('http://localhost:4000/api/**', async (route) => {
    const url = new URL(route.request().url())

    if (url.pathname === '/api/jobs') {
      await fulfillJson(route, {
        data: jobs,
        page: 1,
        pageSize: 100,
        total: jobs.length,
        totalPages: 1,
      })
      return
    }

    if (url.pathname === '/api/auth/me') {
      await fulfillJson(route, { user: signedInUser })
      return
    }

    if (url.pathname === '/api/auth/config') {
      await fulfillJson(route, { googleEnabled: false })
      return
    }

    await fulfillJson(route, { error: { message: 'Unexpected E2E API request' } }, 404)
  })
}

test('resume recommendation ranks an uploaded resume against available jobs', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await page.getByText('Resume matching', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Upload your resume' })).toBeVisible()

  await page.locator('input[type="file"]').setInputFiles({
    name: 'candidate-resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('Software engineer experienced with Python, React, TypeScript, and SQL.'),
  })

  await expect(page.getByText('Python', { exact: true })).toBeVisible()
  await expect(page.getByText('React', { exact: true })).toBeVisible()
  await expect(page.getByText(/skills detected from candidate-resume\.pdf/)).toBeVisible()

  await page.getByRole('button', { name: 'View recommendations' }).click()

  await expect(page.getByRole('heading', { name: 'Recommended for you' })).toBeVisible()
  await expect(page.getByText('Ranked by match to candidate-resume.pdf')).toBeVisible()

  const recommendationCards = page.locator('.rv-rec-card')
  await expect(recommendationCards).toHaveCount(4)
  await expect(recommendationCards.first()).toContainText('Python React TypeScript SQL Intern')
  await expect(recommendationCards.first()).toContainText('80%')
})

test('sponsorship filter displays only jobs that sponsor visas', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await page.getByText('Browse', { exact: true }).first().click()
  const jobRows = page.locator('.rv-table-row')
  await expect(jobRows).toHaveCount(4)
  await expect(page.getByText('JavaScript Frontend Intern', { exact: true })).toBeVisible()

  await page.getByText('Sponsors visas only', { exact: true }).click()

  await expect(jobRows).toHaveCount(2)
  await expect(page.getByText('Python React TypeScript SQL Intern', { exact: true })).toBeVisible()
  await expect(page.getByText('SQL Data Engineering New Grad', { exact: true })).toBeVisible()
  await expect(page.getByText('JavaScript Frontend Intern', { exact: true })).toBeHidden()
  await expect(page.getByText('Java Quality Assurance Intern', { exact: true })).toBeHidden()
})
