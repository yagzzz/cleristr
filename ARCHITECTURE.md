# CLERIS architecture

## Decision

CLERIS will start as a **modular monolith**: one deployable Next.js application with strict domain boundaries. This keeps hosting and operations simple while supporting storefront, admin, APIs, background jobs, and PAYTR callbacks in one codebase. Services may be split later only if measured load or operational isolation requires it.

## Technology

- **Next.js 16 App Router + React 19 + TypeScript** for SSR/SSG, SEO, server routes, streaming, and one deployable Node application.
- **Tailwind CSS 4** with project-owned design tokens and components.
- **Drizzle ORM + libSQL/SQLite** for a zero-service local database and easy hosted libSQL/Turso production option. Database access stays behind repositories so a future PostgreSQL migration remains bounded.
- **Zod** at all HTTP/form trust boundaries.
- **Node `crypto`** for scrypt password hashing, random session tokens, HMAC, and constant-time comparisons; no authentication secrets in client code.
- **Vitest + Testing Library** for unit/component tests and **Playwright** for browser flows.
- **Motion** only for bounded storefront/admin interactions that need it.
- **XYFlow/React Flow** only in the route-split admin automation builder where a purpose-built canvas is justified.

## Deployment model

- Node runtime deployment on a platform that supports Next.js server routes.
- Local database: `file:./data/cleris.db`.
- Production database: remote libSQL URL/token or a persistent SQLite volume for a single-node deployment.
- Product media: local public assets in development; production uses an S3-compatible adapter when credentials are configured.
- Background work: database-backed jobs consumed by a protected cron endpoint. No Redis is required initially.
- CDN/cache support through framework cache headers and immutable media derivatives.

## Module boundaries

```text
src/
  app/                    routes, layouts, route handlers
  components/             reusable UI primitives and composed sections
  db/                     schema, migrations, seed, client
  lib/                    money, validation, security, IDs, dates
  modules/
    auth/                  users, sessions, verification, reset, RBAC
    catalog/               products, variants, categories, collections, inventory
    pricing/               prices, campaigns, coupons, tax, shipping totals
    cart/                  guest/account carts and merge
    wishlist/              guest/account wishlist and merge
    checkout/              checkout state and order creation
    orders/                orders, items, fulfillment, history
    payments/              provider interface, PAYTR, callbacks, refunds
    shipping/              methods, rules, shipments, tracking
    content/               pages, menus, banners, announcements, homepage
    media/                 metadata and storage provider
    reviews/               reviews, moderation, votes
    support/               returns, exchanges, complaints, tickets, feedback
    marketing/             contacts, consent, segments, flows, campaigns, jobs
    analytics/             internal commerce events and aggregates
    seo/                   metadata, sitemap, structured data, redirects
    admin/                 dashboard, audit, management actions
```

## Data rules

- Money is integer kuruş (`priceAmount = 119900` means ₺1.199,00).
- Time is stored as UTC ISO timestamps.
- Slugs, SKU, barcode, order number, payment provider IDs, callback event IDs, coupon codes, and idempotency keys have database uniqueness constraints where applicable.
- Orders store immutable item, address, tax, shipping, discount, and total snapshots.
- Inventory changes are append-only movements plus a current counter.
- Customer marketing consent stores purpose, source, policy version, timestamp, and withdrawal timestamp.
- Audit records are append-only and must not contain raw secrets, passwords, full payment data, or sensitive form bodies.

## Authentication and authorization

- Passwords use scrypt with a unique random salt and versioned parameters.
- Session tokens are random; only a SHA-256 hash is stored in the database.
- Cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- State-changing requests verify origin and use server-side authorization.
- Login/reset/verification endpoints use database-backed rate limits.
- Admin roles map to explicit permissions. Hiding a control in the UI is never authorization.
- Admin 2FA columns and recovery-code records exist from the start; activation can follow after core admin flows.

## Commerce invariants

- Client cart values are identifiers and quantities only. Server loads current variants, prices, campaigns, tax, and shipping.
- A quote has an expiry and hash; order creation recalculates again inside a transaction.
- Coupon eligibility and usage limits are checked atomically.
- Inventory is reserved when an order enters payment pending and released on expiry/failure/cancellation.
- Payment callbacks transition orders using guarded state transitions and idempotency records.
- Refund totals cannot exceed captured total minus completed refunds. Each refund request has a unique idempotency key and admin audit entry.

## PAYTR

- Credentials: `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` server-only.
- Token creation posts to the official PAYTR token endpoint using a server-calculated basket and amount.
- Browser success/fail routes only display current order status; they never mark payment paid/failed.
- Callback verifies HMAC with timing-safe comparison, looks up by `merchant_oid`, processes the first terminal transition transactionally, stores the callback, and returns plain `OK` for valid duplicates.
- Status inquiry and refund calls are admin/server-only and recorded in payment/refund history.
- Test and production behavior is selected by environment and explicit PAYTR settings.

## Marketing automation

- Business events are written to an outbox in the same transaction as the source action.
- A worker converts events into automation runs and scheduled jobs.
- Flow definitions are versioned JSON plus normalized node/edge rows for validation and reporting.
- Actions are provider-independent (`email`, `sms`, `webhook`, `popup`, `coupon`).
- Every job has status, attempts, next attempt, lock, idempotency key, and last error.
- Marketing actions require matching consent and frequency-cap checks at execution time, not only when a flow is created.

## Performance

- Storefront pages are server-rendered and progressively enhanced.
- Admin-only editors/canvas are dynamically imported and never included in initial storefront bundles.
- Only one primary product image is eager-loaded; gallery/reels are lazy and use responsive derivatives.
- Product video is click-to-play with poster; no autoplay audio.
- Fonts are self-hosted and limited to required weights.
- Motion uses transform/opacity and respects reduced motion.

## Security verification

1. Unit tests for pricing, coupon, inventory, state transitions, PAYTR HMAC, refunds, permissions, and consent.
2. Integration tests for database uniqueness, transactions, callback retries, and order totals.
3. Browser tests for auth, cart, checkout status, admin authorization, responsive layout, and accessibility.
4. Dependency/secret scan.
5. Strix source review; then local/staging web/API review when a runnable authorized target and prerequisites exist.
6. Fix root causes and repeat the exact PoC/scan.

## Deliberate limits of the first implementation

- Real PAYTR payment, refund, email, SMS, object storage, and analytics delivery require merchant/provider credentials. The project supplies provider interfaces, environment validation, test-safe disabled states, and documented setup.
- No fake products, reviews, orders, revenue, or customers are generated. Empty admin/storefront sections remain functional and hidden or show intentional empty states.
