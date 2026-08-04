<div align="center">

# AFC Furniture

**Premium furniture e-commerce — a production-grade TypeScript monorepo**

A Next.js 14 storefront backed by an Express REST API, built with modern best
practices: typed domain models, repository-based data access, secure cookie
authentication, layered validation, and a rich, translated UI.

[Features](#features) · [Tech stack](#tech-stack) · [Architecture](#architecture) ·
[Quick start](#quick-start) · [Docs](#table-of-contents)

</div>

---

## Table of contents

- [Overview](#overview)
- [Highlights](#highlights)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Monorepo layout](#monorepo-layout)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Demo accounts](#demo-accounts)
- [Authentication & sessions](#authentication--sessions)
- [Security](#security)
- [Payment & order flow](#payment--order-flow)
- [AI shopping assistant](#ai-shopping-assistant)
- [Admin panel](#admin-panel)
- [Internationalization](#internationalization)
- [API reference](#api-reference)
- [Moving to a real database](#moving-to-a-real-database)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AFC Furniture is an end-to-end e-commerce platform for a premium furniture
brand. It ships as an **npm-workspaces monorepo**:

- **`backend`** — an Express (MVC) REST API, fully typed, with an in-memory
  repository layer designed to be swapped out for PostgreSQL/Prisma without
  touching services or controllers.
- **`frontend`** — a Next.js 14 (App Router) client with Tailwind CSS, Framer
  Motion, Zustand state and TanStack Query data fetching.

The UI is Spanish-first (Colombia) with an English locale, displays prices in
COP/USD, and integrates WhatsApp, an AI assistant stub, an authenticated cart and
checkout, and a role-protected admin back office.

---

## Highlights

- **Cookie-based JWT auth** — short-lived access token + rotating refresh token in
  HTTP-only, `SameSite=Lax` cookies. No tokens in `localStorage`.
- **Layered architecture** — `controllers → services → repositories` keeps the
  domain decoupled from storage.
- **Defense in depth** — Helmet headers, CORS, body-size limits, global + per-route
  rate limiting, Zod validation at every boundary, and input sanitization.
- **SEO-ready** — per-page metadata, Open Graph tags, `viewport` theme colors, and
  optimized remote images.
- **Offline-aware** — client shows connectivity banners and gracefully degrades.
- **Testable seam** — a repository factory (`container.ts`) is the single point of
  change for swapping persistence.

---

## Features

| Area         | Details                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Storefront** | Hero, featured products, promotions, testimonials, brand strip and category showcase on the home page.              |
| **Catalog**  | Filtering (category, material, color, price), sorting, pagination, and search — all synced to the URL query string.  |
| **Product detail** | Gallery, specs, dimensions, materials, availability, related items, share sheet, and WhatsApp inquiry link.      |
| **Cart**     | Authenticated cart with quantity editing, live totals (subtotal, discount, tax, shipping), coupon preview.            |
| **Checkout** | Two-column flow with saved addresses, shipping-method choice, order/price estimate, and atomic order creation.        |
| **Accounts** | Register/login with password-strength meter, customer dashboard, order history, wishlist, saved addresses, profile.   |
| **Wishlist** | Toggle, list, and remove favorite products.                                                                            |
| **Compare**  | Side-by-side compare of multiple products with a floating compare bar.                                                  |
| **Admin**    | Analytics dashboard, product/category/coupon CRUD, inventory stock adjustment, order-status management, customers.     |
| **AI assistant** | In-browser shopping advisor with typing animation, suggestion chips, and conversation history.                  |
| **WhatsApp** | Product inquiries and order support routed to a WhatsApp line.                                                          |
| **i18n**     | Spanish (default, COP) and English (USD) with localized numbers and dates.                                               |
| **Theming**  | Light/dark/auto theming with no-flash bootstrap script and system preference support.                                 |
| **Responsive** | Mobile menu, adaptive layouts, and touch-friendly controls across breakpoints.                                      |

---

## Tech stack

**Frontend**

| Tool | Version (range) | Purpose                                    |
| ---- | --------------- | ------------------------------------------ |
| Next.js (App Router) | 14.2.x | React framework, SSR/SSG + middleware |
| React        | 18.3.x | UI library              |
| TypeScript  | 5.4.x | Typed JavaScript        |
| Tailwind CSS | 3.4.x | Utility-first styling  |
| Framer Motion | 11.x | Animations / transitions |
| TanStack Query | 5.51.x | Server-state fetching & caching |
| Axios        | 1.7.x  | HTTP client            |
| Zustand      | 4.5.x  | Client state (auth, cart, UI) |
| react-hot-toast | 2.4.x | Toast notifications      |
| clsx + tailwind-merge | 2.x     | Conditional class names   |

**Backend**

| Layer  | Version  | Purpose                              |
| ------ | -------- | ------------------------------------ |
| Node.js | 18.17+ (engines) | Runtime |
| Express | 4.19.x  | HTTP framework (MVC) |
| TypeScript  | 5.4.x  | Typed runtime / build |
| Zod   | 3.23.x  | Request validation at boundaries      |
| jsonwebtoken | 9.0.x | JWT signing/verification        |
| bcryptjs | 2.4.x   | Password hashing        |
| Helmet     | 7.1.x   | Security HTTP headers      |
| express-rate-limit | 7.4.x | Rate limiting            |
| cors       | 2.8.x   | Cross-origin config (credentials)     |
| cookie-parser | 1.4.x | Cookie parsing for JWT cookies |
| dotenv     | 16.4.x  | Environment configuration             |
| tsx        | 4.16.x  | Dev runner (watch mode)                 |

**Tooling:** npm workspaces, ESLint, Prettier conventions, TypeScript strict mode.

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (Next.js 14)"]
        P[Pages & Components]
        Q[TanStack Query]
        Z[Zustand Stores]
        AX[AI Assistant stub]
        EDGE[Edge middleware - route guard]
    end

    subgraph Network
        REW[\next.config rewrites - proxy /api/*/]
        COOKIES[HTTP-only JWT cookies]
    end

    subgraph API["Backend - Express (MVC)"]
        ROUT[Router layer]
        CTRL[Controllers]
        SV[Services]
        MW[Middleware: auth, validate, rate-limit, sanitize, helmet, cors]
    end

    subgraph Data["Storage"]
        IMEM[In-Memory store - seed.ts]
        DB[(PostgreSQL - Prisma blueprint, optional)]
    end

    P --> Q
    P --> Z
    P --> AX
    P --> REW
    REW --> API
    ROUT --> CTRL
    CTRL --> SV
    SV --> REPO[Repository interfaces]
    REPO --> IMEM
    REPO -. future .-> DB
    COOKIES --> ROUT
```

> The frontend proxies `/api/:path*` to the backend during development through
> `next.config.mjs` rewrites, so cookies (HTTP-only) and CORS are handled
> transparently in the same origin.

---

## Monorepo layout

```
.
├── backend/                    # Express REST API (MVC)
│   └── src/
│       ├── app.ts             # Express wiring: helmet, cors, cookies, rate-limit, routes
│       ├── server.ts          # Bootstrap + in-memory store initialization
│       ├── config/            # env.ts, cors.ts, database.ts (Prisma blueprint)
│       ├── constants/         # cookies, thresholds, shipping fees, tax, statuses
│       ├── routes/            # auth, product, cart, user, account, misc, admin
│       ├── controllers/       # request/response handling, calls services
│       ├── services/          # business logic (auth, product, cart, order, misc)
│       ├── repositories/      # data access — interfaces + in-memory + prisma-ready
│       ├── middleware/        # auth (JWT + roles), validate, sanitize, rate-limiter
│       ├── validators/        # Zod schemas per module
│       ├── data/              # seed datasets (products, users, coupons) + store
│       ├── utils/             # jwt, password, errors, helpers
│       └── types/             # shared domain types (User, Product, Order, ...)
└── frontend/                  # Next.js 14 (App Router) client
    └── src/
        ├── app/               # pages: storefront, account, admin, auth, compare, policies
        ├── components/        # ui kit, layout, products, home, auth, support
        ├── store/            # Zustand stores (auth, cart, wishlist, compare, ui, theme)
        ├── services/         # typed API clients (products, cart, orders, account, assistant)
        ├── hooks/            # useProducts, useGeneral, useHydration
        ├── lib/              # api-client (axios + refresh retry), utils, errors
        ├── i18n/             # dictionary (es/en), locale + currency formatting
        ├── types/             # shared domain types
        ├── constants/         # site meta, nav, thresholds, labels
        ├── middleware.ts      # edge route protection (/account, /admin)
        └── providers/        # Query, Theme, Toast providers + bootstrapping
```

---

## Prerequisites

- **Node.js** `>= 18.17.0` (developed against Node 22) — managed via npm
   workspaces.
- **npm** `>= 9` (for workspaces support).
- A package registry access to install dependencies.
- (Optional) PostgreSQL + Prisma CLI only if you enable the database layer.

---

## Quick start

Clone or extract the project, then from the repository root:

```bash
# 1. Install all workspace dependencies (root-level command)
npm install

# 2. Copy environment files (see next section for full reference)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local   # Windows: use `copy` or your editor

# 3. Start the backend API on :5000  (tsx watch, auto-reload)
npm run dev --workspace=backend

# 4. In a second terminal, start the frontend on :3000
npm run dev --workspace=frontend
```

> Alternatively, run **both** from the root with a single command:

```bash
npm run dev            # runs backend + frontend workspaces
```

Open **http://localhost:3000**. The frontend proxies API calls to the backend, so
no CORS configuration is needed locally.

---

## Environment variables

### Backend (`backend/.env`)

```ini
# Server
PORT=5000
NODE_ENV=development

# Client origin allowed by CORS
CLIENT_URL=http://localhost:3000

# JWT — in production use strong random values (>=32 chars)
JWT_ACCESS_SECRET=change-me-access-secret-32-chars-min
JWT_REFRESH_SECRET=change-me-refresh-secret-32-chars-min
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Set to true behind HTTPS (httpOnly+Secure cookies)
COOKIE_SECURE=false

# Optional — PostgreSQL (when Prisma layer is enabled)
# DATABASE_URL=postgresql://user:password@localhost:5432/afc
# PRISMA_ENABLED=false
```

| Variable | Default | Notes                                                          |
| -------- | ------- | ------------------------------------------------------------ |
| `PORT` | `5000`  | API port. |
| `NODE_ENV` | `development` | `production` enables secure cookies + strict env validation. |
| `CLIENT_URL` | `http://localhost:3000` | Allowed CORS origin (credentials allowed). |
| `JWT_ACCESS_SECRET`   | *(required)* | Signs the access token. |
| `JWT_REFRESH_SECRET`  | *(required)* | Signs the refresh token. |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime (>0 required). |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime. |
| `COOKIE_SECURE` | `false` | When `true`, both cookies get the `Secure` flag. |
| `DATABASE_URL` / `PRISMA_ENABLED` | — | Reserved for the optional Prisma/PostgreSQL layer. |

### Frontend (`frontend/.env.local`)

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=15551234567
NEXT_PUBLIC_DEMO_ADMIN_EMAIL=admin@afcfurniture.com
NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL=customer@afcfurniture.com
```

| Variable | Default | Notes |
| -------- | ------- | ----- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Backend base URL used by the dev proxy. |
| `NEXT_PUBLIC_SITE_URL`  | `http://localhost:3000` | Canonical site URL (metadata). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `15551234567` | WhatsApp line for product inquiries & support. |
| `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` / `NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL` | *(demo docs)* | Used in documentation/UI hints — not secrets. |

> Keep `.env` / `.env.local` out of version control (see `.gitignore`); the
> value shown are examples only.

---

## Available scripts

From the **repository root** (npm workspaces):

| Command | Description                                             |
| ------- | ------------------------------------------------------- |
| `npm run dev` | Run both workspaces in dev mode (backend + frontend).             |
| `npm run dev:backend` | Backend `tsx watch` (port 5000). |
| `npm run dev:frontend` | Frontend `next dev` (port 3000).   |
| `npm run build` | Build backend (`tsc`) then frontend (`next build`).   |
| `npm run lint` | Lint all workspaces (ESLint `--max-warnings=0`). |
| `npm run typecheck` | Type-check all workspaces (`tsc --noEmit`).               |

Within a workspace (`npm run <script> --workspace=backend` or `--workspace=frontend`):

| Workspace | Script | Purpose |
| --------- | ------ | ------- |
| backend   | `dev` | Start API in watch mode (`tsx watch src/server.ts`). |
| backend   | `start` | Run compiled `dist/server.js`.             |
| backend   | `build` | Compile TypeScript.                         |
| backend   | `typecheck` | `tsc --noEmit`.                     |
| backend   | `lint` | ESLint `src/**/*.ts`.                        |
| backend   | `seed` | Re-initialize the in-memory demo data.       |
| frontend   | `dev` | `next dev`.                                  |
| frontend   | `build` | `next build`.                              |
| frontend   | `start` | `next start`.                               |
| frontend   | `lint` / `typecheck` | Lint and type-check.          |

---

## Demo accounts

Seeded by default and documented in the UI. Reset with `npm run seed --workspace=backend`.

| Role     | Email                       | Password         |
| -------- | --------------------------- | ---------------- |
| Admin    | `admin@afcfurniture.com`    | `Admin@1234`     |
| Customer | `customer@afcfurniture.com` | `Customer@1234`  |

---

## Authentication & sessions

Flow (JWT with rotating refresh token):

```
Browser                          API
   │  POST /auth/register|login    │
   │───────────────────────────────>│  validate (Zod + rate-limit)
   │                                │  bcrypt-verify / hash
   │  Set-Cookie: afc_access_token  │  signAccessToken  (15m)
   │  Set-Cookie: afc_refresh_token │  signRefreshToken (7d, stored hash)
   │<───────────────────────────────│
   │  GET /auth/me (cookie)          │
   │───────────────────────────────>│  requireAuth → verify access token
   │<────── PublicUser (no secrets) ─│
```

- **Access token** (15 min) and **refresh token** (7 days) live in separate
  HTTP-only cookies, `SameSite=Lax`, `Secure` in production, scoped paths.
- Routes marked `requireAuth` verify the access token; a silent refresh
  endpoint rotates the refresh token when needed.
- Passwords are hashed with `bcryptjs`; the stored hash/refresh token are never
  serialized in API responses (`sanitizeUser`).
- Edge middleware (`frontend/src/middleware.ts`) provides a first UX layer that
  redirects unauthenticated users and non-admins — **real** authorization always
  happens server-side (`requireAuth` / `requireRole('ADMIN')`).

---

## Security

| Measure | Where |
| ------- | ----- |
| Password hashing (bcryptjs)                | `auth.service.ts`, `utils/password.ts` |
| HTTP-only, `SameSite` cookies               | `utils/jwt.ts`                          |
| Helmet HTTP headers                        | `app.ts` + `helmet`                     |
| Strict CORS (credentials)                  | `config/cors.ts`                       |
| Body size limits (256 KB)                  | `app.ts` `express.json`                 |
| Rate limiting (general / auth / newsletter) | `middleware/rateLimiter.ts`            |
| Zod request validation (body/params/query)  | `middleware/validate.ts` + `validators` |
| Input sanitization                           | `middleware/sanitize.ts`                |
| `trust proxy = 1` (accurate IPs behind proxy) | `app.ts`                              |
| Edge route guards (UX) + server-side roles   | `frontend/middleware.ts`, `requireRole` |

Rate-limit windows: general **300 / 15 min** on every request, **30 / 15 min** on
auth endpoints, and **10 / hour** on newsletter subscriptions.

---

## Payment & order flow

Orders are created from the authenticated cart and remain in `PENDING` payment
until fulfilled offline via the WhatsApp/life channels:

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant API
    participant Admin
    Customer->>Frontend: Enter shipping, method, coupon
    Frontend->>API: POST /user/estimate (totals preview)
    API-->>Frontend: subtotal, discount, tax, shipping, total
    Customer->>Frontend: Confirm & pay
    Frontend->>API: POST /user/checkout
    API->>API: validate stock, create order (PENDING), decrement stock, increment coupon usage, clear cart
    API-->>Frontend: order created (totals)
    Frontend->>Admin: appears in admin orders (PENDING)
```

- Order statuses: `PENDING → PROCESSING → SHIPPED → DELIVERED | CANCELLED`.
- Payment statuses: `PENDING / PAID / FAILED / REFUNDED`.
- Payment is intentionally **offline-first**: checkout creates the order in
  `PENDING` and fulfillment happens over WhatsApp/live channels. Real-card / PSE
  finalization is wired at the payment-provider layer, which the API already
  supports via `updatePaymentStatus` and the computed order totals.

Coupon codes apply discounts; the cart computes `tax` (rate 8%) and shipping
with a **free-shipping threshold ($1 499)**. Standard/express shipping methods
are selectable and included in the preview.

---

## AI shopping assistant

The frontend includes a customer-facing chat widget (`components/support/AssistantWidget.tsx`)
with typing animation, conversation history and suggestion chips. It currently uses a
**mock resolver** (`services/assistant.ts`) that returns canned replies for
payments / shipping / product queries.

To connect a real model: replace the `AssistantApi.ask` implementation — either
proxy to a new backend route (`POST /assistant/chat`) or call your provider SDK
(OpenAI, Anthropic, Gemini, …) directly. The UI is already model-agnostic.

---

## Admin panel

Role-protected (`/admin`, ADMIN-only). Modules:

| Module | Capabilities |
| ------ | ------------ |
| **Analytics** | Orders count, revenue, customers, low-stock, top sellers, status breakdown, recent orders. |
| **Products**  | List / create / update / delete, stock adjustment (+/− delta). |
| **Categories** | CRUD. |
| **Orders**   | List (filter by status), detail, update order status. |
| **Customers** | List (sanitized — no password hashes). |
| **Coupons**  | CRUD. |

---

## Internationalization

- Default locale **es** (`<html lang="es">`), secondary locale **en**.
- Dictionary lives in `frontend/src/i18n/dictionary.ts` (`nav`, `auth`, `common`, `trust`).
- Currency per locale: **COP** (Colombia, `$1.250.000 COP`, rate ≈ 4200/USD)
  vs **USD** — `formatCurrency()` and `formatLocalizedDate()` in `i18n/locale.ts`.
- A `LocaleSwitcher` component toggles locale at runtime; prices/formats/footers
  update instantly.

---

## API reference

Base URL: `/api/v1`. Prefix for all routes.

### Health

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/health` | Public | Uptime + status. |

### Auth (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/register` | Public | Create account (email, password, names, phone). |
| POST | `/login` | Public | Sign in; sets cookies. |
| POST | `/refresh` | Cookie | Rotate access token from refresh token. |
| POST | `/logout` | User | Clear cookies. |
| GET | `/me` | User | Current profile. |

### Products (`/api/v1/products`)

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| GET | `/categories` | Public | Category tree. |
| GET | `/featured` | Public | Featured products. |
| GET | `/bestsellers` | Public | Best-sellers. |
| GET | `/price-range` | Public | Min/max price helper for filters. |
| GET | `/` | Public | List / search `/page`+`limit`, filters, sort. |
| GET | `/:slug` | Public | Product detail + related. |

### Cart (`/api/v1/cart`) — requires auth

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/` | View cart lines. |
| POST | `/items` | Add item (productId, quantity). |
| PUT | `/items` | Update quantity (id). |
| DELETE | `/items` | Remove a cart line (by `productId`). |
| DELETE | `/` | Clear cart. |
| POST | `/totals` | Estimate totals (shipping method, coupon). |
| POST | `/coupon/validate` | Validate a coupon code. |

### User operations (`/api/v1/user`) — requires auth

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/checkout` | Create order from cart (address, contact, shipping method, coupon). |
| POST | `/estimate` | Preview totals without creating order. |
| GET | `/orders` | Current user's order list (paginated). |
| GET | `/orders/:id` | Order detail (ownership-checked). |
| GET | `/wishlist` | List wishlist. |
| POST/DELETE | `/wishlist/:productId` | Toggle / remove wishlist item. |

### Account (`/api/v1/account`) — requires auth

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/profile` / PATCH `/profile` | Read / update profile (name, phone, etc.). |
| POST | `/change-password` | Change password (current + new). |
| GET/POST | `/addresses` | List / add addresses. |
| PATCH/DELETE | `/addresses/:addressId` | Update / delete address. |
| POST | `/addresses/:addressId/default` | Set default address. |

### Misc (`/api/v1`) — public

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/newsletter` | Subscribe to newsletter (rate-limited). |
| GET | `/testimonials` | Testimonials. |
| POST | `/contact` | Contact form. |
| GET | `/config` | Global config (categories, price range). |

### Admin (`/api/v1/admin`) — requires ADMIN

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/analytics` | Dashboard summary + top/low-stock. |
| GET/POST | `/products` | List / create products. |
| PATCH/DELETE | `/products/:id` | Update / delete product. |
| POST | `/products/:id/stock` | Adjust stock by delta. |
| GET/POST | `/categories` | List / create categories. |
| PATCH/DELETE | `/categories/:id` | Update / delete category. |
| GET | `/orders` | List orders (optionally by status). |
| GET | `/orders/:id` | Order detail. |
| PATCH | `/orders/:id/status` | Update order status. |
| GET | `/customers` | List customers (sanitized). |
| GET/POST | `/coupons` | List / create coupons. |
| PATCH/DELETE | `/coupons/:id` | Update / delete coupon. |

All admin routes are guarded by `requireAuth` + `requireRole('ADMIN')`.

---

## Moving to a real database

The backend persists nothing — it talks to repository **interfaces**
(`backend/src/repositories/types.ts`) backed by an in-memory store. To switch to
PostgreSQL:

1. `npm install --workspace=backend prisma @prisma/client && npx prisma init`.
2. Port the schema blueprint from `backend/src/config/database.ts` into
   `prisma/schema.prisma`.
3. Implement the interfaces with Prisma-backed classes and update the factory in
   `backend/src/repositories/container.ts`.
4. Set `DATABASE_URL` (and `PRISMA_ENABLED=true` when used).

**No service or controller changes are required** — the domain layer stays
unchanged.

---

## Deployment

- **Build:** `npm run build` produces `frontend/.next` and `backend/dist`.
- **Host** the frontend (Node/Next on a platform such as Vercel/Node) and the
  **backend** (Node + Express on any host that supports Node).
- Set `NODE_ENV=production` and strong JWT secrets, point `CLIENT_URL` at the
  public frontend origin, and set `COOKIE_SECURE=true` behind HTTPS.
- Ensure a reverse proxy forwards HTTPS and that `trust proxy` is configured for
  correct client IP (rate limiting).
- If rendering server-side, configure the frontend domain and headers accordingly
  and place Next.js `_next` static assets on a CDN if desired.

---

## Troubleshooting

| Symptom | Likely cause / fix |
| ------- | ------------------ |
| Ports `3000` / `5000` in use | Change `PORT` in backend `.env` and `NEXT_PUBLIC_API_URL` in frontend. |
| Missing env vars on boot (prod) | JWT secrets must be present when `NODE_ENV=production`. |
| Cookie not sent / CORS errors | Backend `CLIENT_URL` must match frontend origin; cookies are `SameSite=Lax`. |
| Production `.next` cache errors (Windows) | Clear `frontend/.next` (`rm -rf .next`) before `next build`. |
| Seed data seems wrong | `npm run seed --workspace=backend` restores demo data. |
| Prisma complaints | Not enabled by default; set `PRISMA_ENABLED=false` and leave `DATABASE_URL` unset. |
| Type/lint errors after edits | `npm run typecheck` and `npm run lint` at the root. |

---

## Roadmap

- [ ] Wire the real LLM into `assistant.ts`.
- [ ] Enable PostgreSQL/Prisma persistence (see [Migrating to a real DB](#moving-to-a-real-database)).
- [ ] Add admin image upload for products `→` CDN.
- [ ] Payment-provider webhook integration (card / PSE finalization).
- [ ] Email notifications (order status, password reset).
- [ ] Unit/integration test suites for services and repositories.

---

## Contributing

1. **npm install** to install workspace dependencies.
2. Make a branch, keep changes focused and typed; run `npm run lint` +
   `npm run typecheck`.
3. Keep the repository-interface pattern for new data access — add a repository
   method, don't import storage directly into services.
4. For new backend endpoints: validator (Zod) → route → controller → service.
5. Open a pull request with a clear description.

For design/product direction and larger features, reach out first before a large
change.

---

## License

`PRIVATE` — © AFC Furniture. Not licensed for redistribution without written
consent. Replace this section with your preferred license if publishing.