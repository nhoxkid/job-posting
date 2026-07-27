import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'

describe('Preferences API', () => {
  const app = createApp()

  it('GET /api/preferences returns the default theme', async () => {
    const res = await request(app).get('/api/preferences')
    expect(res.status).toBe(200)
    expect(res.body.theme).toBe('light')
  })

  it('PUT /api/preferences persists a valid theme', async () => {
    const res = await request(app).put('/api/preferences').send({ theme: 'dark' })
    expect(res.status).toBe(200)
    expect(res.body.theme).toBe('dark')

    const after = await request(app).get('/api/preferences')
    expect(after.body.theme).toBe('dark')
  })

  it('PUT /api/preferences accepts "system"', async () => {
    // The client stores 'system' when the visitor has made no explicit choice,
    // so the API has to round-trip it like any other theme.
    const res = await request(app).put('/api/preferences').send({ theme: 'system' })
    expect(res.status).toBe(200)
    expect(res.body.theme).toBe('system')
  })

  it('PUT /api/preferences rejects an invalid theme', async () => {
    const res = await request(app).put('/api/preferences').send({ theme: 'neon' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})
