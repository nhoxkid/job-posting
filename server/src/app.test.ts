import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'

describe('API', () => {
  const app = createApp()

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('unknown routes return a 404 envelope', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.error).toBeDefined()
  })
})
