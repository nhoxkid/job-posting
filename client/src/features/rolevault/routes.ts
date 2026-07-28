/**
 * The screen ↔ URL mapping.
 *
 * The screens were written against a `go(screen)` callback rather than links, so
 * this table lets `App` keep that API while the URL becomes the real source of
 * truth. That is what makes refresh, deep links and the back button work.
 */

import type { RoleVaultScreen } from './types'

/** Screens with a fixed URL. `detail` is excluded — it needs a job id, see `jobPath`. */
export type StaticScreen = Exclude<RoleVaultScreen, 'detail'>

export const PATH_BY_SCREEN: Record<StaticScreen, string> = {
  landing: '/',
  browse: '/jobs',
  login: '/login',
  register: '/register',
  onboarding: '/onboarding',
  recommended: '/recommended',
  profile: '/profile',
  faq: '/faq',
}

export const jobPath = (id: number | string) => `/jobs/${id}`

const JOB_DETAIL = /^\/jobs\/[^/]+$/

/** Reverse lookup, so the nav can highlight the active item from the URL alone. */
export function screenFromPath(pathname: string): RoleVaultScreen {
  if (JOB_DETAIL.test(pathname)) return 'detail'
  const match = (Object.keys(PATH_BY_SCREEN) as StaticScreen[]).find(
    (screen) => PATH_BY_SCREEN[screen] === pathname,
  )
  return match ?? 'landing'
}

/** Screens that require a session. Anything else is browsable as a guest. */
export const PROTECTED_PATHS: ReadonlySet<string> = new Set([
  PATH_BY_SCREEN.recommended,
  PATH_BY_SCREEN.profile,
])
