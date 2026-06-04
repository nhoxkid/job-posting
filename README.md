# Job Posting Platform

A full-stack **scaffold** for a job posting application, organized as an
**npm workspaces monorepo**: a React + TypeScript client and an Express +
TypeScript REST API backed by PostgreSQL.

> This is a structural scaffold. The folders, routing, wiring, config, and
> Docker setup are in place; the API/data bodies are `TODO` stubs ready to be
> filled in. The UI design system, theming, and tooling are fully implemented.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · TanStack Query ·
React Hook Form · React Router · Express · PostgreSQL · Vitest.

```
job-posting/
├── client/                 # Frontend (React + Vite + TypeScript)
│   ├── Dockerfile          # Builds static site, served by nginx
│   ├── nginx.conf          # SPA fallback routing
│   └── src/
│       ├── api/            # HTTP client + per-resource calls (stubs)
│       ├── components/     # ui/ design system, layout/, ErrorBoundary, ThemeToggle
│       ├── features/       # Feature modules (jobs/: components, hooks)
│       ├── lib/            # Helpers (cn, env, formatting)
│       ├── pages/          # Route-level pages
│       ├── providers/      # ThemeProvider, QueryProvider
│       ├── styles/         # Tailwind entry + design tokens
│       ├── test/           # Vitest setup
│       └── types/          # Domain types
│
├── server/                 # Backend (Express + TypeScript REST API)
│   ├── Dockerfile
│   └── src/
│       ├── config/         # env.ts — typed env loader
│       ├── db/             # PostgreSQL connection component
│       ├── middleware/     # validate (stub), errorHandler, notFound
│       ├── utils/          # ApiError, asyncHandler
│       ├── models/         # Domain types
│       ├── repositories/   # Data access (JobRepository interface + SQL stub)
│       ├── services/       # Business logic
│       ├── controllers/    # HTTP boundary
│       ├── routes/         # Route definitions (wired)
│       ├── app.ts          # Express app factory
│       └── server.ts       # Entrypoint
│
├── docker-compose.yml      # postgres + server + client
├── .env.example            # Compose configuration template
├── package.json            # Workspace root + orchestration scripts
└── .prettierrc.json        # Shared Prettier config
```

Intended backend request flow:
**route → (validate) → controller → service → repository**, with all errors
funnelled through a central error handler.

## Prerequisites

- Node.js >= 20
- (Optional) Docker + Docker Compose

## Getting started (local)

```bash
# Install all workspace dependencies (from the repo root)
npm install

# Create env files from the templates
cp server/.env.example server/.env
cp client/.env.example client/.env

# Run client + server together (client on :5173, API on :4000)
npm run dev
```

## Getting started (Docker)

```bash
cp .env.example .env          # compose settings (DB creds, ports)
docker compose up --build     # starts postgres, server, client
```

- Client → http://localhost:5173
- API → http://localhost:4000/api
- PostgreSQL → localhost:5432

## Root scripts

| Script                 | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Run client and server concurrently      |
| `npm run dev:client`   | Run only the frontend (Vite dev server) |
| `npm run dev:server`   | Run only the backend (tsx watch)        |
| `npm run build`        | Build server then client for production |
| `npm start`            | Start the compiled API server           |
| `npm run typecheck`    | Type-check every workspace              |
| `npm run test`         | Run unit/integration tests (Vitest)     |
| `npm run lint`         | Lint every workspace (ESLint)           |
| `npm run lint:fix`     | Lint and auto-fix                       |
| `npm run format`       | Format the repo with Prettier           |
| `npm run format:check` | Check formatting without writing        |

## Frontend & UI

- **Tailwind CSS v4** via `@tailwindcss/vite`; design tokens + class-based dark
  mode live in `client/src/styles/index.css`.
- **Design system** in `client/src/components/ui/` (Button, Input, Textarea,
  Select, Label, Card, Badge, Alert, Spinner, Skeleton) with a `cn()` helper.
- **Theming** via `ThemeProvider` (light/dark/system) + a navbar toggle.
- **TanStack Query** for data fetching/caching (`features/jobs/hooks`).
- **React Hook Form** for forms (`features/jobs/components/JobForm.tsx`).
- **ErrorBoundary** wraps the app for graceful failure.

## Testing

- **Client:** Vitest + React Testing Library (jsdom). Sample: `Button.test.tsx`.
- **Server:** Vitest + supertest. Sample: `app.test.ts` (health + 404).
- Run all tests with `npm run test` from the root.

## Environment & secrets

- `server/.env` — runtime config: `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, and a
  place for API keys / secrets (see `server/.env.example`).
- `client/.env` — `VITE_API_BASE_URL`.
- `.env` (root) — `docker compose` settings.

All `.env` files are git-ignored; only the `.env.example` templates are committed.

## Connecting to PostgreSQL

The connection lives in `server/src/db/index.ts`. Set `DATABASE_URL`, enable
`connectToDatabase()` in `server/src/server.ts`, then implement the queries in
`server/src/repositories/job.repository.ts`. See
[`server/README.md`](server/README.md) for details.

## Linting & formatting

- **ESLint** (flat config) per workspace — TypeScript-aware, React rules on the client.
- **Prettier**, integrated via `eslint-config-prettier` so the two never fight,
  with `prettier-plugin-tailwindcss` to auto-sort Tailwind classes.
- Run `npm run lint` and `npm run format` from the root to cover both workspaces.
