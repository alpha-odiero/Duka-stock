# DukaStock

A mobile-first inventory, sales, and expense management system for small Kenyan shops (dukas). Track products, stock, sales, purchases, suppliers, expenses, and notifications — with a clean POS-style checkout and printable receipts.

Built as an npm workspaces monorepo with a React client and an Express/Prisma/PostgreSQL API.

## Stack

| Layer | Tech |
| ----- | ---- |
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 3.4, React Router 6, TanStack Query, React Hook Form, Zod, Recharts, Lucide |
| Backend | Node.js, Express 4, TypeScript, Prisma (PostgreSQL), Zod, JSON Web Tokens, Helmet, express-rate-limit |
| Testing | Vitest + Supertest (server) |

## Features

- Multi-tenant: each registration creates an isolated shop; users in one shop can never access another shop's data.
- Product catalog with categories, SKU, buy/sell prices, barcode, stock tracking, and low-stock alerts.
- Stock management: stock-in, stock-out, manual adjustments, and full movement history per product.
- POS checkout with an in-memory cart, bulk/discounted items, and cash/MPESA payment slots.
- Printable receipts tucked to A4/80mm columns (`window.print` with receipt-scoped print CSS).
- Sales history, purchase orders with line items, expenses ledger, supplier directory.
- Reports: sales summary, profit & loss, stock valuation, and per-product top sellers.
- Dashboard with KPIs, sales chart, top products, low-stock alerts, and recent activity.
- Notifications for low stock, replenishments, and buy-back reminders.

## Project layout

```
dukastock/
├── client/     # React + Vite web application (src/, tailwind, eslint, prettier)
├── server/     # Express + Prisma API (src/, prisma/, tests/)
├── .env.example
├── package.json
└── README.md
```

## Prerequisites

- Node.js >= 24
- A Neon PostgreSQL database (cloud). A local PostgreSQL server is only needed if you want to run the test suite against a throwaway local test database instead of a Neon test branch.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the database and secrets. Copy the example env file and edit it:

   ```bash
   cp .env.example .env
   ```

   At minimum set `DATABASE_URL` (Neon PostgreSQL), plus strong random `SESSION_SECRET` and `COOKIE_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   For development, put your Neon connection string in the gitignored `server/.env` (`DATABASE_URL`). Use the **pooled** endpoint with `?pgbouncer=true` so Prisma works through Neon's connection pooler. See [Production database](#production-database-cloud-postgresql) for details.

3. Create the database schema and generate the Prisma client:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   Optionally seed demo data:

   ```bash
   npm run db:seed
   ```

## Running locally

Start both the API (`:4000`) and the client dev server (`:5173`) together:

```bash
npm run dev
```

Vite proxies `/api` and `/health` to the API, so the browser only talks to the client origin. Open http://localhost:5173.

Individual services:

```bash
npm run dev:server   # API only
npm run dev:client   # client only
```

## Scripts (root)

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Run API + client concurrently |
| `npm run build` | Type-check and build both workspaces |
| `npm run test` | Run server tests (Vitest) |
| `npm run lint` | ESLint both workspaces |
| `npm run typecheck` | TypeScript check both workspaces |
| `npm run format` | Prettier both workspaces |
| `npm run db:migrate` | Run Prisma migrations |

## API overview

The API is served under `/api/v1` with JSON responses wrapped as `{ success, data }` (or `{ success, error }` on failure). Auth uses a signed HttpOnly cookie session.

| Module | Endpoints (prefix) | Notes |
| ------ | ------------------ | ----- |
| Auth | `/auth` | `register`, `login`, `logout`, `me` |
| Products | `/products` | CRUD + list w/ pagination & search |
| Categories | `/categories` | CRUD |
| Stock | `/stock` | stock-in, stock-out, adjustments, movements |
| Sales | `/sales` | create sale, list, by-id; transaction-safe with stock rollback |
| Purchases | `/purchases` | create purchase orders (line items), list, by-id |
| Suppliers | `/suppliers` | CRUD |
| Expenses | `/expenses` | CRUD by category/date |
| Reports | `/reports` | sales, pnl, stock-valuation, top-products |
| Dashboard | `/dashboard` | KPIs + widgets |
| Notifications | `/notifications` | list, mark-read |
| Shops | `/shops` | update shop profile |

## Testing

```bash
npm run test            # server unit + integration tests (Vitest)
npm install -g @playwright/test  # optional: add e2e later
```

The server suite covers money handling (DECIMAL-as-string), input validation, and end-to-end sale flow with transactional rollback and shop isolation across tenants.

> **Tests are destructive**: the suite re-creates and wipes the database schema, so `npm run test` must NEVER run against a database holding real data. By default it connects to a throwaway local database (`dukastock_test` on `127.0.0.1:5432`; requires local PostgreSQL >= 14). To run against a disposable Neon test branch instead, set `TEST_DATABASE_URL`:

```bash
# point tests at a disposable Neon test database/branch (never one with real data)
export TEST_DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/test_db?sslmode=require&pgbouncer=true"
npm run test
```

## Deployment

### Production build

```bash
npm run build
```

- API entrypoint: `server/dist/server.js` (set `NODE_ENV=production`, `COOKIE_SECURE=true` behind HTTPS).
- Client: `client/dist` is a static bundle.

### Docker

Build and run from the included `Dockerfile` (serves both API and the static client through Express, with the Vite dev proxy target replaced by same-origin serving):

```bash
docker compose up --build -d
```

Set your real `DATABASE_URL` (Neon, with `?pgbouncer=true`) and secrets via the `.env` / secrets manager; never commit them. The compose file no longer bundles a local PostgreSQL — `DATABASE_URL` is required.

### Production database (Neon PostgreSQL)

DukaStock uses **Neon PostgreSQL for both development and production** (the local `db` service was removed; `docker-compose.yml` requires `DATABASE_URL`). Neon gives you a **pooled (PgBouncer)** endpoint and a **direct** endpoint per branch:

1. Create the database in the Neon console (project → branch → database, e.g. `neondb`).
2. Copy the **pooled** connection string into the gitignored `server/.env` (development) or `server/.env.production` (production). Append `?pgbouncer=true` so Prisma runs through the pooler.
3. Apply migrations once against the **direct** endpoint (`prisma migrate deploy`), then let the app use the pooled endpoint at runtime:

Production `server/.env.production` (NEVER commit — this file is gitignored):

```dotenv
NODE_ENV=production
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
SESSION_SECRET="<strong random>"
COOKIE_SECRET="<strong random>"
COOKIE_SECURE=true
```

Notes:
- When the backend runs with `NODE_ENV=production` it loads `server/.env.production`; otherwise it loads `server/.env`. Platform-set environment variables still take precedence.
- Use the **pooled** endpoint (hostname contains `-pooler`, plus `?pgbouncer=true`) for the application and Prisma. Use the **direct** endpoint (drop `-pooler`) for one-off `prisma migrate deploy`, `pg_dump`, or `pg_restore` operations. Prisma talks to PostgreSQL over TLS (`sslmode=require`).
- Never put production credentials in source code, `.env.example`, README files, or the frontend (client-side) bundle.
- Apply schema changes only through the established Prisma migration workflow (`npm run db:deploy` / `prisma migrate deploy`). Do NOT run `prisma db push` against production.

## Environment variables

See `.env.example` for the full list. Key ones:

- `DATABASE_URL` — Neon PostgreSQL connection string (pooled endpoint + `?pgbouncer=true` for the app; direct endpoint for one-off migration/backup commands)
- `PORT` — API port (default `4000`)
- `NODE_ENV` — `development` / `production`
- `SESSION_SECRET`, `COOKIE_SECRET` — random secrets for session signing
- `COOKIE_SECURE` — `true` in production (HTTPS only)
- `CLIENT_URL` — allowed client origin for CORS

## Brand palette

Prime `#166534` · Accent `#F59E0B` · Canvas `#F8FAF9` · Ink `#17201B` · Muted `#647067` · Line `#E5E7EB` · Danger `#DC2626` · Success `#16A34A`

## Contributing

1. Fork and create a feature branch.
2. Run `npm run lint` and `npm run typecheck` before opening a PR.
3. Ensure the server suite passes (`npm run test`).
