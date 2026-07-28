/**
 * User repository: the data-access boundary for accounts.
 *
 * Mirrors the job and preferences repositories: one `UserRepository` interface
 * with two implementations chosen by `DB_DRIVER`:
 *
 *   - `InMemoryUserRepository` — default; no database required. Accounts reset
 *     on restart, which is fine for local development.
 *   - `SqlUserRepository` — PostgreSQL-backed, used when `DB_DRIVER=postgres`.
 *
 * Email is treated as case-insensitive throughout: it is normalised to
 * lowercase on write and compared lowercased on read, so `A@b.com` and
 * `a@b.com` are the same account.
 */

import { env } from '../config/env'
import { query } from '../db'
import type { CreateGoogleUserInput, CreateUserInput, User, UserRole } from '../models/user'

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findByGoogleId(googleId: string): Promise<User | null>
  findById(userId: number): Promise<User | null>
  create(input: CreateUserInput): Promise<User>
  createFromGoogle(input: CreateGoogleUserInput): Promise<User>
  /** Attach a Google identity to an existing account (account linking). */
  linkGoogle(userId: number, input: Omit<CreateGoogleUserInput, 'email'>): Promise<User>
}

/** Canonical form used for storage and lookup. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/* -------------------------------------------------------------------------- */
/* In-memory implementation                                                   */
/* -------------------------------------------------------------------------- */

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = []
  private nextId = 1

  async findByEmail(email: string): Promise<User | null> {
    const target = normaliseEmail(email)
    return this.users.find((u) => u.email === target) ?? null
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.users.find((u) => u.googleId === googleId) ?? null
  }

  async findById(userId: number): Promise<User | null> {
    return this.users.find((u) => u.userId === userId) ?? null
  }

  async create(input: CreateUserInput): Promise<User> {
    const user: User = {
      userId: this.nextId++,
      email: normaliseEmail(input.email),
      passwordHash: input.passwordHash,
      googleId: null,
      displayName: input.displayName ?? null,
      avatarUrl: null,
      role: 'applicant',
      createdAt: new Date().toISOString(),
    }
    this.users.push(user)
    return user
  }

  async createFromGoogle(input: CreateGoogleUserInput): Promise<User> {
    const user: User = {
      userId: this.nextId++,
      email: normaliseEmail(input.email),
      passwordHash: null,
      googleId: input.googleId,
      displayName: input.displayName ?? null,
      avatarUrl: input.avatarUrl ?? null,
      role: 'applicant',
      createdAt: new Date().toISOString(),
    }
    this.users.push(user)
    return user
  }

  async linkGoogle(userId: number, input: Omit<CreateGoogleUserInput, 'email'>): Promise<User> {
    const user = this.users.find((u) => u.userId === userId)
    if (!user) throw new Error(`User ${userId} not found`)
    user.googleId = input.googleId
    user.displayName ??= input.displayName ?? null
    user.avatarUrl ??= input.avatarUrl ?? null
    return user
  }

  /** Test helper: drop all accounts. */
  reset(): void {
    this.users = []
    this.nextId = 1
  }
}

/* -------------------------------------------------------------------------- */
/* PostgreSQL implementation                                                  */
/* -------------------------------------------------------------------------- */

interface UserRow {
  user_id: string | number
  email: string
  password_hash: string | null
  google_id: string | null
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: Date | string
}

function rowToUser(row: UserRow): User {
  return {
    userId: Number(row.user_id),
    email: row.email,
    passwordHash: row.password_hash,
    googleId: row.google_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

const SELECT_COLUMNS =
  'user_id, email, password_hash, google_id, display_name, avatar_url, role, created_at'

export class SqlUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const res = await query<UserRow>(
      `SELECT ${SELECT_COLUMNS} FROM users WHERE LOWER(email) = $1`,
      [normaliseEmail(email)],
    )
    return res.rows[0] ? rowToUser(res.rows[0]) : null
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const res = await query<UserRow>(`SELECT ${SELECT_COLUMNS} FROM users WHERE google_id = $1`, [
      googleId,
    ])
    return res.rows[0] ? rowToUser(res.rows[0]) : null
  }

  async findById(userId: number): Promise<User | null> {
    const res = await query<UserRow>(`SELECT ${SELECT_COLUMNS} FROM users WHERE user_id = $1`, [
      userId,
    ])
    return res.rows[0] ? rowToUser(res.rows[0]) : null
  }

  async create(input: CreateUserInput): Promise<User> {
    const res = await query<UserRow>(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING ${SELECT_COLUMNS}`,
      [normaliseEmail(input.email), input.passwordHash, input.displayName ?? null],
    )
    return rowToUser(res.rows[0])
  }

  async createFromGoogle(input: CreateGoogleUserInput): Promise<User> {
    const res = await query<UserRow>(
      `INSERT INTO users (email, google_id, display_name, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [
        normaliseEmail(input.email),
        input.googleId,
        input.displayName ?? null,
        input.avatarUrl ?? null,
      ],
    )
    return rowToUser(res.rows[0])
  }

  async linkGoogle(userId: number, input: Omit<CreateGoogleUserInput, 'email'>): Promise<User> {
    const res = await query<UserRow>(
      `UPDATE users
          SET google_id    = $2,
              display_name = COALESCE(display_name, $3),
              avatar_url   = COALESCE(avatar_url, $4)
        WHERE user_id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [userId, input.googleId, input.displayName ?? null, input.avatarUrl ?? null],
    )
    return rowToUser(res.rows[0])
  }
}

/* -------------------------------------------------------------------------- */
/* Default instance — chosen by DB_DRIVER (defaults to in-memory).            */
/* -------------------------------------------------------------------------- */

export const userRepository: UserRepository =
  env.dbDriver === 'postgres' ? new SqlUserRepository() : new InMemoryUserRepository()
