/**
 * User preferences domain types.
 *
 * Plain TypeScript declarations only — no runtime logic. Currently this holds
 * just the UI theme; it is a natural home for future per-user settings.
 *
 * There is no auth/accounts backend yet (see README §14), so preferences are
 * stored against a single well-known id (`DEFAULT_PREFERENCES_ID`). When users
 * arrive, swap that for the authenticated user id — the rest of the layering
 * (service, repository, routes) stays the same.
 */

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

/** Identifier used while there is no per-user auth (single shared profile). */
export const DEFAULT_PREFERENCES_ID = 'default'

/** Persisted preferences for a profile. */
export interface Preferences {
  id: string
  theme: ThemePreference
  updatedAt: string
}

/** Payload for updating preferences (all fields optional). */
export interface UpdatePreferencesInput {
  theme?: ThemePreference
}
