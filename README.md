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

- Node.js >= 20
- PostgreSQL >= 14

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the database and secrets. Copy the example env file and edit it:

   ```bash
   cp .env.example .env
   ```

   At minimum set `DATABASE_URL` (PostgreSQL), plus strong random `SESSION_SECRET` and `COOKIE_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

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

Set your real `DATABASE_URL` and secrets via the environment/secrets manager; never commit them.

### Production database (cloud PostgreSQL)

Development uses the local PostgreSQL on `127.0.0.1:5432` (see `server/.env`). For **production**, point the backend at a cloud PostgreSQL provider (e.g. Neon) instead of the local `db` service:

1. Create a cloud PostgreSQL project/database (e.g. Neon, database `neondb`).
2. Configure a gitignored `server/.env.production` with the cloud `DATABASE_URL` (see below), OR set the same `DATABASE_URL` as a secret in your deployment platform.
3. Deploy and set `NODE_ENV=production`.

Production `server/.env.production` (NEVER commit — this file is gitignored):

```dotenv
NODE_ENV=production
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&pgbouncer=true"
SESSION_SECRET="<strong random>"
COOKIE_SECRET="<strong random>"
COOKIE_SECURE=true
```

Notes:
- When the backend runs with `NODE_ENV=production` it loads `server/.env.production`; otherwise it loads `server/.env`. Platform-set environment variables still take precedence.
- For Neon's PgBouncer pooler endpoint, append `?pgbouncer=true` to the connection string so Prisma can connect. Prisma must talk to PostgreSQL over TLS (`sslmode=require`).
- Never put production credentials in source code, `.env.example`, README files, or the frontend (client-side) bundle.
- Apply schema changes only through the established Prisma migration workflow (`npm run db:deploy` / `prisma migrate deploy`). Do NOT run `prisma db push` against production.

## Environment variables

See `.env.example` for the full list. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
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
