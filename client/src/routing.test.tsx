/**
 * Routing and session integration.
 *
 * Covers the reported bug: a signed-in user clicking the RoleVault wordmark
 * landed on the home page and appeared to be signed out. Two independent causes
 * — there were no URLs at all (so nothing survived a refresh), and the nav chose
 * its buttons from the current screen rather than from the session.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { AuthUser } from './api/auth'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'

const USER: AuthUser = {
  userId: 1,
  email: 'student@university.edu',
  displayName: null,
  avatarUrl: null,
  role: 'applicant',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const { me, login, logout, config } = vi.hoisted(() => ({
  me: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  config: vi.fn(),
}))

vi.mock('./api/auth', () => ({
  authApi: { me, login, logout, config, register: vi.fn(), google: vi.fn() },
}))

// The landing and browse screens pull the job list on mount; keep it empty and
// deterministic so these tests only exercise routing and session state.
vi.mock('./api/clientApi', () => ({ fetchJobs: vi.fn().mockResolvedValue([]) }))

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  // jsdom implements neither of these; App scrolls to the top on every
  // navigation and ThemeProvider reads matchMedia for the OS colour scheme.
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  )
  config.mockResolvedValue({ googleEnabled: false })
  me.mockResolvedValue(null)
})

describe('session-aware navigation', () => {
  it('keeps a signed-in user signed in after clicking through to the home page', async () => {
    me.mockResolvedValue(USER)
    const user = userEvent.setup()
    renderAt('/recommended')

    // The wordmark is what people clicked to trigger the bug.
    const wordmark = await screen.findByText('RoleVault')
    await user.click(wordmark)

    // The home page must offer account controls, not a login prompt.
    expect(await screen.findByRole('button', { name: /sign out/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^log in$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^sign up$/i })).not.toBeInTheDocument()
  })

  it('offers log in and sign up to an anonymous visitor', async () => {
    renderAt('/')

    expect(await screen.findByRole('button', { name: /^log in$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
  })

  it('drops the session and returns home on sign out', async () => {
    me.mockResolvedValue(USER)
    logout.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderAt('/')

    await user.click(await screen.findByRole('button', { name: /sign out/i }))

    expect(logout).toHaveBeenCalledOnce()
    expect(await screen.findByRole('button', { name: /^log in$/i })).toBeInTheDocument()
  })
})

describe('protected routes', () => {
  it('sends an anonymous visitor to the login screen', async () => {
    renderAt('/recommended')

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('lets a signed-in user load a protected URL directly, as on a refresh', async () => {
    me.mockResolvedValue(USER)
    renderAt('/profile')

    // The bug this guards against is bouncing to login while `me()` is still in
    // flight, which is what made a refresh look like a logout.
    await waitFor(() => expect(me).toHaveBeenCalled())
    expect(screen.queryByRole('heading', { name: /welcome back/i })).not.toBeInTheDocument()
  })

  it('returns you to the page you were denied once you sign in', async () => {
    const user = userEvent.setup()
    renderAt('/profile')

    await screen.findByRole('heading', { name: /welcome back/i })

    // Signing in flips the session, so re-render as the signed-in user.
    login.mockImplementation(async () => {
      me.mockResolvedValue(USER)
      return { user: USER }
    })

    await user.type(screen.getByPlaceholderText(/you@university.edu/i), USER.email)
    await user.type(screen.getByPlaceholderText('••••••••'), 'correct-horse')
    await user.click(screen.getByRole('button', { name: /^log in$/i }))

    await waitFor(() => expect(login).toHaveBeenCalledWith(USER.email, 'correct-horse'))

    // Assert the destination, not merely that login went away: both /profile and
    // the default /recommended clear the login heading, so checking only for its
    // absence passes even when you land on the wrong page.
    expect(await screen.findByRole('heading', { name: /^profile$/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /recommended for you/i })).not.toBeInTheDocument()
  })

  it('redirects an unknown URL home instead of rendering a blank screen', async () => {
    renderAt('/this-page-does-not-exist')

    expect(await screen.findByRole('button', { name: /^log in$/i })).toBeInTheDocument()
  })
})
