# CLERIS product requirements

## Product

CLERIS is a modern, mobile-first commerce platform for clothing, accessories, jewelry, and future physical product categories. The initial catalog contains one real product: **Baggy Eşofman**. The data model and administration must support hundreds of products without filling the storefront with fake catalog entries.

## Product principles

- Empty sections remain configurable in administration and stay hidden on the storefront until they contain valid content.
- The storefront and administration share one catalog, inventory, pricing, campaign, order, content, and customer source of truth.
- Every financial value is recalculated server-side.
- Customer consent, security, accessibility, SEO, performance, and operational auditability are part of each feature.
- External services are behind provider interfaces so payment, email, SMS, storage, analytics, and shipping integrations can change without rewriting core business rules.

## Required modules

### Storefront

- Announcement bar, responsive header, category/menu system, search, account, wishlist, cart, banners, campaigns, product groups, collections, editorial blocks, brand story, trust blocks, reviews, newsletter, social area, and footer.
- Product listing, categories, subcategories, collections, filters, sorting, search suggestions, recent searches, and empty states.
- Product detail with gallery, thumbnails, mobile swipe, zoom/lightbox, video, variants, size guide, stock, quantity, cart, buy now, wishlist, shipping estimate, accordions, FAQ, reviews, related items, and recently viewed items.
- Cart drawer and cart page with variants, quantity, removal, move to wishlist, coupon, shipping threshold, discounts, and server-authoritative totals.
- Mobile-first checkout with customer, address, shipping, payment, legal consent, and status steps.

### Catalog and inventory

- Products, categories, nested categories, collections, tags, brand, target group, product type, attributes, options, variants, media, SEO, draft/published/archived state, and scheduling.
- Product and variant SKU, barcode, price, sale windows, tax, stock, low-stock threshold, preorder, weight, shipping properties, status, and image.
- Inventory movements and order reservation/release history.

### Customers and accounts

- Registration, login, logout, email verification, password reset, secure sessions, profile, addresses, invoice details, orders, tracking, wishlist, returns, complaints, support tickets, consent, notification preferences, and password change.
- Guest wishlist/cart stored locally and mergeable after login.

### Orders, payment, shipping, and returns

- Unique order number, item/variant snapshots, quantity, discounts, coupon, shipping, tax, totals, payment state, fulfillment state, shipping state, address snapshots, notes, timestamps, and PAYTR references.
- PAYTR iFrame token creation, verified callback, status inquiry, full/partial refund history, duplicate protection, and admin authorization.
- Shipping methods, regional rules, thresholds, delivery estimates, tracking URL templates, shipment tracking, and carrier management.
- Return, cancellation, exchange, complaint, and support requests with evidence uploads, workflow state, and admin response.

### Administration

- Dashboard; catalog; orders; customers; returns/support; marketing; content; analytics; SEO; shipping; payments; integrations; and settings.
- Owner, Admin, Order Manager, Content Manager, and Marketing roles with server-side permissions.
- Audit log for price, order, refund, coupon, customer, campaign, and setting changes.
- Media library with metadata, alt text, search, reuse, and optimization derivatives.
- Page, banner, announcement, menu, homepage-section, and legal-content management.

### Marketing and automation

- Campaigns, coupons, dynamic segments, email/SMS templates, onsite popups, provider settings, and event history.
- Visual flow builder with Trigger, Delay, Condition, If/Else, Branch, Filter, Segment Check, Email, SMS, Popup, Coupon, Tag, List, Webhook, A/B Test, and Exit nodes.
- Database-backed event/outbox/job model for retryable automation.
- Consent checks and frequency caps before marketing delivery.
- Block-based email content with variables such as `{{ first_name }}`, `{{ order_number }}`, `{{ product_name }}`, and `{{ coupon_code }}`.

### Analytics, tracking, and SEO

- Revenue, orders, average order value, conversion funnel, product views, cart adds, checkout starts, payment outcomes, coupon use, refunds, abandonment, new customers, and repeat customers with date filters.
- Consent-gated GA4, GTM, Google Ads, Meta Pixel, and TikTok Pixel configuration.
- Global and per-entity metadata, canonical, index controls, OG metadata, sitemap, robots, redirects, alt text, and Product/Breadcrumb/Organization/WebSite structured data.

## Cross-cutting acceptance criteria

- Loading, empty, error, success, offline, timeout, and retry states exist for every networked flow.
- Keyboard navigation, visible focus, labels, semantic HTML, contrast, alt text, reduced motion, and responsive behavior are tested.
- Source, dependency, auth, access-control, injection, upload, rate-limit, payment, coupon, cart, refund, and admin authorization checks are part of release testing.
- Core Web Vitals, Lighthouse/PageSpeed, code splitting, optimized media, font loading, caching, SEO rendering, and database indexes are measured before release.
