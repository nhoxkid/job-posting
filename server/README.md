# @job-posting/server

Express + TypeScript REST API **scaffold** for the job posting platform. The
structure, routing, and layering are in place; the handler/service/repository
bodies are `TODO` stubs ready for you to implement.

## Layered architecture

```
src/
├── server.ts                  # Entrypoint: connects DB, binds port, graceful shutdown
├── app.ts                     # Express app factory (middleware + routes)
├── config/
│   └── env.ts                 # Loads .env into a typed config object
├── db/
│   └── index.ts               # PostgreSQL connection component (pool helpers)
├── middleware/                # validate (stub), errorHandler, notFound
├── utils/                     # ApiError, asyncHandler
├── models/                    # Domain types (plain TypeScript)
├── repositories/              # Data access — JobRepository interface + SQL stub
├── services/                  # Business logic (depends on repository interface)
├── controllers/               # HTTP boundary (return 501 until implemented)
└── routes/                    # Route definitions (wired to controllers)
```

Intended request flow: **route → (validate) → controller → service → repository**.
Errors bubble up to the central `errorHandler`.

## What's wired vs. what to fill in

- ✅ Express app, middleware (helmet, cors, json, logging), routing, 404 + error
  handling, graceful shutdown.
- ✅ PostgreSQL connection component (`src/db/index.ts`) — pool + `query()` helper.
- ⏳ Controllers return `501 Not Implemented` — add the logic.
- ⏳ `SqlJobRepository` methods throw `Not implemented` — write the SQL.
- ⏳ `validate` middleware is a pass-through — plug in zod/joi/etc.

## Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start with hot reload (tsx watch) |
| `npm run build`     | Compile TypeScript to `dist/`     |
| `npm start`         | Run the compiled server           |
| `npm run typecheck` | Type-check without emitting       |
| `npm run lint`      | Lint the source                   |

## Database

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Uncomment `await connectToDatabase()` in `src/server.ts`.
3. Implement the queries in `repositories/job.repository.ts` using the `query()`
   helper from `src/db`. Swap the driver (Prisma, Knex, …) by reimplementing
   `JobRepository` — nothing else changes.

## Endpoints (routes already mounted)

Base path: `/api`

| Method   | Path        | Description      |
| -------- | ----------- | ---------------- |
| `GET`    | `/health`   | Health check     |
| `GET`    | `/jobs`     | List jobs        |
| `POST`   | `/jobs`     | Create a job     |
| `GET`    | `/jobs/:id` | Get a single job |
| `PATCH`  | `/jobs/:id` | Update a job     |
| `DELETE` | `/jobs/:id` | Delete a job     |
