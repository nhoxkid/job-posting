/**
 * Preferences service: business logic layer (HTTP- and storage-agnostic).
 *
 * Validates input and delegates to the `PreferencesRepository`. Kept tiny on
 * purpose — it exists so the controller never talks to the repository directly
 * and so validation lives in one place as more settings are added.
 */

import {
  DEFAULT_PREFERENCES_ID,
  THEME_PREFERENCES,
  type Preferences,
  type ThemePreference,
  type UpdatePreferencesInput,
} from '../models/preferences'
import {
  preferencesRepository,
  type PreferencesRepository,
} from '../repositories/preferences.repository'
import { ApiError } from '../utils/ApiError'

/** Validate and normalise an update payload coming off the wire. */
function parseUpdateInput(body: unknown): Required<UpdatePreferencesInput> {
  if (typeof body !== 'object' || body === null) {
    throw ApiError.badRequest('Request body must be a JSON object')
  }
  const theme = (body as Record<string, unknown>).theme
  if (typeof theme !== 'string' || !THEME_PREFERENCES.includes(theme as ThemePreference)) {
    throw ApiError.badRequest(`"theme" must be one of: ${THEME_PREFERENCES.join(', ')}`)
  }
  return { theme: theme as ThemePreference }
}

export class PreferencesService {
  constructor(private readonly repo: PreferencesRepository = preferencesRepository) {}

  async get(id: string = DEFAULT_PREFERENCES_ID): Promise<Preferences> {
    return this.repo.get(id)
  }

  async update(input: unknown, id: string = DEFAULT_PREFERENCES_ID): Promise<Preferences> {
    const { theme } = parseUpdateInput(input)
    return this.repo.setTheme(id, theme)
  }
}

/** Default service instance. */
export const preferencesService = new PreferencesService()
