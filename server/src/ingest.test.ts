import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'
import { jobRepository } from './repositories/job.repository'

describe('POST /api/ingest', () => {
  const app = createApp()

  it('ingests job postings from local listings.json file', async () => {
    const res = await request(app).post('/api/ingest').send({})
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('created')
    expect(res.body).toHaveProperty('updated')
    expect(res.body).toHaveProperty('total')
    expect(typeof res.body.total).toBe('number')
    expect(res.body.total).toBeGreaterThan(0)

    // Verify jobs are listed in repository
    const listRes = await jobRepository.list({ pageSize: 10 })
    expect(listRes.total).toBeGreaterThan(0)
    expect(listRes.items[0]).toHaveProperty('employerName')
    expect(listRes.items[0]).toHaveProperty('position')
  })
})
