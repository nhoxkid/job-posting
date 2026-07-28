/**
 * Guards on `schema.sql`.
 *
 * `ensureSchemaAndSeed()` executes this file on *every* postgres boot, so it
 * must be safe to re-apply. It previously used bare `CREATE TABLE`, which threw
 * `42P07 relation "users" already exists` on the second start and killed the
 * process before `app.listen()` — the API silently never came up.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')

/** Statements only — `--` comments discuss CREATE TABLE without issuing one. */
const statements = schema.replace(/--[^\n]*/g, '')

describe('schema.sql', () => {
  it('creates every table idempotently', () => {
    const bare = [...statements.matchAll(/CREATE TABLE(?!\s+IF NOT EXISTS)\s+(\w+)/gi)].map((m) => m[1])
    expect(bare).toEqual([])
  })

  it('creates every index idempotently', () => {
    const bare = [...statements.matchAll(/CREATE INDEX(?!\s+IF NOT EXISTS)\s+(\w+)/gi)].map((m) => m[1])
    expect(bare).toEqual([])
  })

  it('defines the user_preferences table the preferences repository queries', () => {
    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS user_preferences/i)
  })
})
