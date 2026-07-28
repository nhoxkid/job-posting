import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../app'

describe('Backend routing', () => {
  const app = createApp()

  it('mounts the health route', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('mounts the preferences route', async () => {
    const response = await request(app).get('/api/preferences')

    expect(response.status).toBe(200)
    expect(response.body.theme).toBeDefined()
  })

  it('lists jobs through GET /api/jobs', async () => {
    const response = await request(app).get('/api/jobs?page=1&pageSize=5')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.page).toBe(1)
    expect(response.body.pageSize).toBe(5)
  })

  it('supports create, read, update, and delete job routes', async () => {
    const created = await request(app).post('/api/jobs').send({
      title: 'Backend Intern',
      company: 'RoleVault',
      location: 'Waterloo, ON',
      remote: true,
      employmentType: 'internship',
      description: 'Help build and test the Express API.',
      tags: ['Node.js', 'Express', 'TypeScript'],
      salaryMin: null,
      salaryMax: null,
      currency: 'CAD',
      status: 'open',
    })

    expect(created.status).toBe(201)
    const id = created.body.id as string
    expect(id).toBeDefined()

    const fetched = await request(app).get(`/api/jobs/${id}`)
    expect(fetched.status).toBe(200)
    expect(fetched.body.title).toBe('Backend Intern')

    const updated = await request(app).patch(`/api/jobs/${id}`).send({ status: 'closed' })
    expect(updated.status).toBe(200)
    expect(updated.body.status).toBe('closed')

    const removed = await request(app).delete(`/api/jobs/${id}`)
    expect(removed.status).toBe(204)

    const missing = await request(app).get(`/api/jobs/${id}`)
    expect(missing.status).toBe(404)
  })

  it('rejects invalid list query parameters', async () => {
    const response = await request(app).get('/api/jobs?remote=maybe&pageSize=500')

    expect(response.status).toBe(400)
    expect(response.body.error.message).toBeDefined()
  })

  it('returns the standard error envelope for unknown routes', async () => {
    const response = await request(app).get('/api/not-a-route')

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBeDefined()
  })
})
