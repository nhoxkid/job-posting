/**
 * Preferences repository: the data-access boundary for user preferences.
 *
 * Mirrors the job repository: a single `PreferencesRepository` interface with
 * two implementations chosen by `DB_DRIVER`:
 *
 *   - `InMemoryPreferencesRepository` — default; no database required. Data
 *     resets on restart (like the in-memory jobs store).
 *   - `SqlPreferencesRepository` — PostgreSQL-backed, used when
 *     `DB_DRIVER=postgres`. Upserts a single row per profile id.
 */

import { env } from '../config/env'
import { query } from '../db'
import {
  DEFAULT_PREFERENCES_ID,
  type Preferences,
  type ThemePreference,
} from '../models/preferences'

const DEFAULT_THEME: ThemePreference = 'light'

export interface PreferencesRepository {
  /** Get preferences for a profile, returning sensible defaults if unset. */
  get(id: string): Promise<Preferences>
  /** Persist the theme for a profile (creates the record if needed). */
  setTheme(id: string, theme: ThemePreference): Promise<Preferences>
}

function defaults(id: string): Preferences {
  return { id, theme: DEFAULT_THEME, updatedAt: new Date().toISOString() }
}

/* -------------------------------------------------------------------------- */
/* In-memory implementation                                                   */
/* -------------------------------------------------------------------------- */

export class InMemoryPreferencesRepository implements PreferencesRepository {
  private store = new Map<string, Preferences>()

  async get(id: string): Promise<Preferences> {
    return this.store.get(id) ?? defaults(id)
  }

  async setTheme(id: string, theme: ThemePreference): Promise<Preferences> {
    const next: Preferences = { id, theme, updatedAt: new Date().toISOString() }
    this.store.set(id, next)
    return next
  }
}

/* -------------------------------------------------------------------------- */
/* PostgreSQL implementation                                                  */
/* -------------------------------------------------------------------------- */

interface PreferencesRow {
  id: string
  theme: ThemePreference
  updated_at: Date | string
}

function rowToPreferences(row: PreferencesRow): Preferences {
  return {
    id: row.id,
    theme: row.theme,
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export class SqlPreferencesRepository implements PreferencesRepository {
  async get(id: string): Promise<Preferences> {
    const result = await query<PreferencesRow>('SELECT * FROM user_preferences WHERE id = $1', [id])
    const row = result.rows[0]
    return row ? rowToPreferences(row) : defaults(id)
  }

  async setTheme(id: string, theme: ThemePreference): Promise<Preferences> {
    const result = await query<PreferencesRow>(
      `INSERT INTO user_preferences (id, theme)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET theme = EXCLUDED.theme, updated_at = now()
       RETURNING *`,
      [id, theme],
    )
    return rowToPreferences(result.rows[0])
  }
}

/* -------------------------------------------------------------------------- */
/* Default instance — chosen by DB_DRIVER (defaults to in-memory).            */
/* -------------------------------------------------------------------------- */

export const preferencesRepository: PreferencesRepository =
  env.dbDriver === 'postgres' ? new SqlPreferencesRepository() : new InMemoryPreferencesRepository()

export { DEFAULT_PREFERENCES_ID }
