import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { preferencesApi, type Preferences } from '../api/preferences'
import { ThemeProvider } from './ThemeProvider'
import { useTheme, type Theme } from './theme-context'

vi.mock('../api/preferences', () => ({
  preferencesApi: { get: vi.fn(), update: vi.fn() },
}))

const mockedApi = vi.mocked(preferencesApi)

/** jsdom has no matchMedia; stub it with a controllable `prefers-color-scheme`. */
function stubMatchMedia(systemPrefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: systemPrefersDark,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    })),
  )
}

function serverPreferences(theme: Theme): Preferences {
  return { id: 'default', theme, updatedAt: '2026-07-27T00:00:00.000Z' }
}

function ThemeProbe() {
  const { theme, resolvedTheme } = useTheme()
  return <span data-testid="probe">{`${theme}/${resolvedTheme}`}</span>
}

function renderWithProvider(ui = <ThemeProbe />) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  stubMatchMedia(false)
  mockedApi.get.mockResolvedValue(serverPreferences('light'))
  mockedApi.update.mockResolvedValue(serverPreferences('light'))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('ThemeProvider persistence', () => {
  it('keeps the stored local choice when the backend disagrees', async () => {
    // The in-memory repository forgets its state on restart and answers
    // "light"; a returning dark-mode visitor must not be flipped back.
    localStorage.setItem('theme', 'dark')
    mockedApi.get.mockResolvedValue(serverPreferences('light'))

    renderWithProvider()

    await waitFor(() => expect(mockedApi.update).toHaveBeenCalledWith('dark'))
    expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark')
    expect(document.documentElement).toHaveClass('dark')
    // The local choice is authoritative, so the server is never even queried.
    expect(mockedApi.get).not.toHaveBeenCalled()
  })

  it('adopts the backend value when this browser has no stored choice', async () => {
    mockedApi.get.mockResolvedValue(serverPreferences('dark'))

    renderWithProvider()

    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark'))
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('follows the OS when neither the cache nor the backend has a choice', async () => {
    stubMatchMedia(true)
    mockedApi.get.mockRejectedValue(new Error('offline'))

    renderWithProvider()

    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('system/dark'))
  })

  it('ignores an unrecognised stored value rather than trusting it', async () => {
    localStorage.setItem('theme', 'neon')
    mockedApi.get.mockResolvedValue(serverPreferences('dark'))

    renderWithProvider()

    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark'))
    expect(mockedApi.get).toHaveBeenCalled()
  })

  it('survives an unreachable API when a local choice exists', async () => {
    localStorage.setItem('theme', 'dark')
    mockedApi.update.mockRejectedValue(new Error('offline'))

    renderWithProvider()

    await waitFor(() => expect(screen.getByTestId('probe')).toHaveTextContent('dark/dark'))
  })
})

describe('ThemeToggle', () => {
  it('flips the theme, the html class, and mirrors the change to the backend', async () => {
    const user = userEvent.setup()
    renderWithProvider(<ThemeToggle />)

    const toggle = screen.getByRole('switch')
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'false'))

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    await waitFor(() => expect(mockedApi.update).toHaveBeenCalledWith('dark'))

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
