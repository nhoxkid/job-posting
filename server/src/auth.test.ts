/**
 * Auth API tests.
 *
 * Run against the in-memory repository (vitest.config.ts pins DB_DRIVER=memory),
 * so no database is required. Google verification is stubbed at the
 * `GoogleVerifier` seam — these tests never reach the network.
 */

import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app'
import { env } from './config/env'
import { setGoogleVerifier, type GoogleIdentity } from './services/google.service'
import { InMemoryUserRepository } from './repositories/user.repository'
import { authService } from './services/auth.service'

const app = createApp()

/** Reach into the default service's repository to isolate tests. */
const repo = (authService as unknown as { repo: InMemoryUserRepository }).repo

const CREDENTIALS = { email: 'ada@university.edu', password: 'correct-horse' }

/** Pull the session cookie out of a response, if one was set. */
function sessionCookie(res: request.Response): string | undefined {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined
  return raw?.find((c) => c.startsWith(`${env.sessionCookieName}=`))
}

beforeEach(() => {
  repo.reset()
})

describe('POST /api/auth/register', () => {
  it('creates an account and starts a session', async () => {
    const res = await request(app).post('/api/auth/register').send(CREDENTIALS)

    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe(CREDENTIALS.email)
    expect(sessionCookie(res)).toBeDefined()
  })

  it('never returns the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(CREDENTIALS)

    expect(JSON.stringify(res.body)).not.toContain('$2')
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('sets the session cookie as httpOnly', async () => {
    const res = await request(app).post('/api/auth/register').send(CREDENTIALS)

    expect(sessionCookie(res)?.toLowerCase()).toContain('httponly')
  })

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(CREDENTIALS)
    const res = await request(app).post('/api/auth/register').send(CREDENTIALS)

    expect(res.status).toBe(409)
  })

  it('treats email as case-insensitive when detecting duplicates', async () => {
    await request(app).post('/api/auth/register').send(CREDENTIALS)
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...CREDENTIALS, email: 'ADA@University.edu' })

    expect(res.status).toBe(409)
  })

  it('rejects a password shorter than 8 characters with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@university.edu', password: 'abc123' })

    expect(res.status).toBe(400)
  })

  it('rejects a malformed email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'correct-horse' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(CREDENTIALS)
  })

  it('signs in with the right password', async () => {
    const res = await request(app).post('/api/auth/login').send(CREDENTIALS)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(CREDENTIALS.email)
    expect(sessionCookie(res)).toBeDefined()
  })

  it('rejects a wrong password with 401 and no session', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...CREDENTIALS, password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(sessionCookie(res)).toBeUndefined()
  })

  it('does not reveal whether an account exists', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ ...CREDENTIALS, password: 'wrong-password' })
    const noSuchUser = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@university.edu', password: 'wrong-password' })

    expect(noSuchUser.status).toBe(wrongPassword.status)
    expect(noSuchUser.body.error.message).toBe(wrongPassword.body.error.message)
  })
})

describe('GET /api/auth/me', () => {
  it('rejects an anonymous request with 401', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
  })

  it('rejects a forged session cookie with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `${env.sessionCookieName}=not.a.real.token`)

    expect(res.status).toBe(401)
  })

  it('returns the signed-in user for a valid session', async () => {
    const login = await request(app).post('/api/auth/register').send(CREDENTIALS)
    const res = await request(app).get('/api/auth/me').set('Cookie', sessionCookie(login)!)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(CREDENTIALS.email)
  })
})

describe('POST /api/auth/logout', () => {
  it('clears the session so /me stops authenticating', async () => {
    const login = await request(app).post('/api/auth/register').send(CREDENTIALS)
    const logout = await request(app).post('/api/auth/logout').set('Cookie', sessionCookie(login)!)

    expect(logout.status).toBe(204)

    // The browser applies the cleared cookie; replay it against /me.
    const cleared = sessionCookie(logout)!
    const res = await request(app).get('/api/auth/me').set('Cookie', cleared)
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/google', () => {
  const identity: GoogleIdentity = {
    googleId: 'google-sub-123',
    email: 'ada@university.edu',
    emailVerified: true,
    displayName: 'Ada Lovelace',
    avatarUrl: 'https://example.test/ada.png',
  }

  beforeEach(() => {
    env.googleClientId = 'test-client-id'
    setGoogleVerifier({ verify: async () => identity })
  })

  it('creates an account on first Google sign-in', async () => {
    const res = await request(app).post('/api/auth/google').send({ idToken: 'stub' })

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(identity.email)
    expect(res.body.user.displayName).toBe('Ada Lovelace')
    expect(sessionCookie(res)).toBeDefined()
  })

  it('reuses the same account on a second Google sign-in', async () => {
    const first = await request(app).post('/api/auth/google').send({ idToken: 'stub' })
    const second = await request(app).post('/api/auth/google').send({ idToken: 'stub' })

    expect(second.body.user.userId).toBe(first.body.user.userId)
  })

  it('links to an existing password account with the same email', async () => {
    const registered = await request(app).post('/api/auth/register').send(CREDENTIALS)
    const google = await request(app).post('/api/auth/google').send({ idToken: 'stub' })

    expect(google.body.user.userId).toBe(registered.body.user.userId)
  })

  it('still allows password login after linking Google', async () => {
    await request(app).post('/api/auth/register').send(CREDENTIALS)
    await request(app).post('/api/auth/google').send({ idToken: 'stub' })

    const res = await request(app).post('/api/auth/login').send(CREDENTIALS)
    expect(res.status).toBe(200)
  })

  it('rejects an unverified Google email with 401', async () => {
    setGoogleVerifier({ verify: async () => ({ ...identity, emailVerified: false }) })
    const res = await request(app).post('/api/auth/google').send({ idToken: 'stub' })

    expect(res.status).toBe(401)
  })

  it('rejects a token Google will not verify with 401', async () => {
    setGoogleVerifier({
      verify: async () => {
        throw new Error('Invalid token signature')
      },
    })
    const res = await request(app).post('/api/auth/google').send({ idToken: 'stub' })

    expect(res.status).toBe(401)
  })

  it('requires an idToken', async () => {
    const res = await request(app).post('/api/auth/google').send({})

    expect(res.status).toBe(400)
  })

  it('reports 503 when Google sign-in is not configured', async () => {
    env.googleClientId = ''
    const res = await request(app).post('/api/auth/google').send({ idToken: 'stub' })

    expect(res.status).toBe(503)
  })
})
