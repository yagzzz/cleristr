import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { booleanColumn, idColumn, optionalPublishWindow, timestampColumns } from "./common";
import { productVariants, products } from "./catalog";
import { users } from "./identity";

export const carts = sqliteTable(
  "carts",
  {
    id: idColumn(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    guestTokenHash: text("guest_token_hash"),
    currency: text("currency").notNull().default("TRY"),
    expiresAt: text("expires_at"),
    ...timestampColumns(),
  },
  (table) => [index("carts_user_idx").on(table.userId), uniqueIndex("carts_guest_token_unique").on(table.guestTokenHash)],
);

export const cartItems = sqliteTable(
  "cart_items",
  {
    id: idColumn(),
    cartId: text("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    addedAt: text("added_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("cart_item_variant_unique").on(table.cartId, table.productId, table.variantId), index("cart_items_cart_idx").on(table.cartId)],
);

export const wishlists = sqliteTable(
  "wishlists",
  {
    id: idColumn(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestTokenHash: text("guest_token_hash"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("wishlists_user_unique").on(table.userId), uniqueIndex("wishlists_guest_unique").on(table.guestTokenHash)],
);

export const wishlistItems = sqliteTable(
  "wishlist_items",
  {
    id: idColumn(),
    wishlistId: text("wishlist_id").notNull().references(() => wishlists.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("wishlist_item_unique").on(table.wishlistId, table.productId, table.variantId)],
);

export const shippingMethods = sqliteTable(
  "shipping_methods",
  {
    id: idColumn(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    isActive: booleanColumn("is_active", true),
    basePriceAmount: integer("base_price_amount").notNull().default(0),
    freeThresholdAmount: integer("free_threshold_amount"),
    estimatedMinDays: integer("estimated_min_days"),
    estimatedMaxDays: integer("estimated_max_days"),
    trackingUrlTemplate: text("tracking_url_template"),
    regionalRulesJson: text("regional_rules_json", { mode: "json" }).$type<Array<Record<string, unknown>> | null>(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("shipping_methods_code_unique").on(table.code)],
);

export const coupons = sqliteTable(
  "coupons",
  {
    id: idColumn(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    kind: text("kind", { enum: ["percentage", "fixed", "free_shipping"] }).notNull(),
    value: integer("value").notNull(),
    scope: text("scope", { enum: ["cart", "product", "category", "customer"] }).notNull().default("cart"),
    minimumCartAmount: integer("minimum_cart_amount"),
    maximumDiscountAmount: integer("maximum_discount_amount"),
    usageLimit: integer("usage_limit"),
    usagePerCustomer: integer("usage_per_customer").notNull().default(1),
    firstOrderOnly: booleanColumn("first_order_only"),
    automatic: booleanColumn("automatic"),
    isActive: booleanColumn("is_active", true),
    conditionsJson: text("conditions_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    ...optionalPublishWindow(),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("coupons_code_unique").on(table.code), index("coupons_active_window_idx").on(table.isActive, table.startsAt, table.endsAt)],
);

export const couponProducts = sqliteTable("coupon_products", {
  couponId: text("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
}, (table) => [uniqueIndex("coupon_product_unique").on(table.couponId, table.productId)]);

export const couponCategories = sqliteTable("coupon_categories", {
  couponId: text("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull(),
}, (table) => [uniqueIndex("coupon_category_unique").on(table.couponId, table.categoryId)]);

export const orders = sqliteTable(
  "orders",
  {
    id: idColumn(),
    orderNumber: text("order_number").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    currency: text("currency").notNull().default("TRY"),
    subtotalAmount: integer("subtotal_amount").notNull(),
    discountAmount: integer("discount_amount").notNull().default(0),
    shippingAmount: integer("shipping_amount").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    couponCode: text("coupon_code"),
    couponId: text("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    shippingMethodId: text("shipping_method_id").references(() => shippingMethods.id, { onDelete: "set null" }),
    paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "cancelled", "partially_refunded", "refunded"] })
      .notNull()
      .default("pending"),
    orderStatus: text("order_status", { enum: ["payment_pending", "paid", "preparing", "shipped", "delivered", "cancelled", "return_requested", "returned", "partially_refunded"] })
      .notNull()
      .default("payment_pending"),
    shippingStatus: text("shipping_status", { enum: ["not_ready", "ready", "shipped", "delivered", "returned"] })
      .notNull()
      .default("not_ready"),
    shippingAddressJson: text("shipping_address_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    billingAddressJson: text("billing_address_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    customerNote: text("customer_note"),
    adminNote: text("admin_note"),
    checkoutKey: text("checkout_key"),
    quoteHash: text("quote_hash").notNull(),
    quoteExpiresAt: text("quote_expires_at").notNull(),
    inventoryReservedUntil: text("inventory_reserved_until"),
    paidAt: text("paid_at"),
    cancelledAt: text("cancelled_at"),
    ...timestampColumns(),
  },
  (table) => [
    uniqueIndex("orders_number_unique").on(table.orderNumber),
    uniqueIndex("orders_checkout_key_unique").on(table.checkoutKey),
    index("orders_user_idx").on(table.userId),
    index("orders_status_idx").on(table.orderStatus),
    index("orders_created_idx").on(table.createdAt),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: idColumn(),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    variantName: text("variant_name"),
    sku: text("sku").notNull(),
    imageUrl: text("image_url"),
    quantity: integer("quantity").notNull(),
    unitPriceAmount: integer("unit_price_amount").notNull(),
    discountAmount: integer("discount_amount").notNull().default(0),
    taxAmount: integer("tax_amount").notNull().default(0),
    lineTotalAmount: integer("line_total_amount").notNull(),
    metadataJson: text("metadata_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const couponRedemptions = sqliteTable(
  "coupon_redemptions",
  {
    id: idColumn(),
    couponId: text("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    discountAmount: integer("discount_amount").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("coupon_redemption_order_unique").on(table.couponId, table.orderId), index("coupon_redemption_user_idx").on(table.couponId, table.userId)],
);

export const payments = sqliteTable(
  "payments",
  {
    id: idColumn(),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("paytr"),
    providerOrderId: text("provider_order_id").notNull(),
    status: text("status", { enum: ["pending", "processing", "paid", "failed", "cancelled", "partially_refunded", "refunded"] })
      .notNull()
      .default("pending"),
    requestedAmount: integer("requested_amount").notNull(),
    capturedAmount: integer("captured_amount"),
    currency: text("currency").notNull().default("TRY"),
    paymentType: text("payment_type"),
    testMode: booleanColumn("test_mode"),
    providerReference: text("provider_reference"),
    failureCode: text("failure_code"),
    failureMessage: text("failure_message"),
    paidAt: text("paid_at"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("payments_provider_order_unique").on(table.provider, table.providerOrderId), index("payments_order_idx").on(table.orderId)],
);

export const paymentCallbacks = sqliteTable(
  "payment_callbacks",
  {
    id: idColumn(),
    paymentId: text("payment_id").references(() => payments.id, { onDelete: "set null" }),
    provider: text("provider").notNull(),
    providerOrderId: text("provider_order_id").notNull(),
    callbackHash: text("callback_hash").notNull(),
    status: text("status").notNull(),
    amount: integer("amount"),
    payloadJson: text("payload_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    processedAt: text("processed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("payment_callback_dedupe_unique").on(table.provider, table.providerOrderId, table.callbackHash), index("payment_callbacks_order_idx").on(table.providerOrderId)],
);

export const refunds = sqliteTable(
  "refunds",
  {
    id: idColumn(),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    paymentId: text("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
    requestedByUserId: text("requested_by_user_id").references(() => users.id, { onDelete: "set null" }),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).notNull().default("pending"),
    idempotencyKey: text("idempotency_key").notNull(),
    providerReference: text("provider_reference"),
    providerResponseJson: text("provider_response_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    completedAt: text("completed_at"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("refunds_idempotency_unique").on(table.idempotencyKey), index("refunds_order_idx").on(table.orderId)],
);

export const shipments = sqliteTable(
  "shipments",
  {
    id: idColumn(),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    shippingMethodId: text("shipping_method_id").references(() => shippingMethods.id, { onDelete: "set null" }),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    status: text("status", { enum: ["ready", "shipped", "delivered", "returned"] }).notNull().default("ready"),
    shippedAt: text("shipped_at"),
    deliveredAt: text("delivered_at"),
    ...timestampColumns(),
  },
  (table) => [index("shipments_order_idx").on(table.orderId), index("shipments_tracking_idx").on(table.trackingNumber)],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: idColumn(),
    productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    orderItemId: text("order_item_id").references(() => orderItems.id, { onDelete: "set null" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected", "spam"] }).notNull().default("pending"),
    verifiedPurchase: booleanColumn("verified_purchase"),
    helpfulCount: integer("helpful_count").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [index("reviews_product_idx").on(table.productId, table.status), index("reviews_user_idx").on(table.userId)],
);

export const reviewVotes = sqliteTable(
  "review_votes",
  {
    id: idColumn(),
    reviewId: text("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    voterHash: text("voter_hash"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("review_vote_user_unique").on(table.reviewId, table.userId), uniqueIndex("review_vote_hash_unique").on(table.reviewId, table.voterHash)],
);

export const supportTickets = sqliteTable(
  "support_tickets",
  {
    id: idColumn(),
    ticketNumber: text("ticket_number").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
    orderItemId: text("order_item_id").references(() => orderItems.id, { onDelete: "set null" }),
    type: text("type", { enum: ["return", "cancellation", "exchange", "complaint", "support"] }).notNull(),
    subject: text("subject").notNull(),
    reason: text("reason"),
    status: text("status", { enum: ["open", "waiting_customer", "in_review", "approved", "rejected", "resolved", "closed"] })
      .notNull()
      .default("open"),
    priority: text("priority", { enum: ["low", "normal", "high", "urgent"] }).notNull().default("normal"),
    assignedToUserId: text("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("support_ticket_number_unique").on(table.ticketNumber), index("support_tickets_user_idx").on(table.userId), index("support_tickets_status_idx").on(table.status)],
);

export const supportMessages = sqliteTable(
  "support_messages",
  {
    id: idColumn(),
    ticketId: text("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id").references(() => users.id, { onDelete: "set null" }),
    authorType: text("author_type", { enum: ["customer", "admin", "system"] }).notNull(),
    message: text("message").notNull(),
    attachmentsJson: text("attachments_json", { mode: "json" }).$type<string[] | null>(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("support_messages_ticket_idx").on(table.ticketId)],
);

export const feedback = sqliteTable(
  "feedback",
  {
    id: idColumn(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    type: text("type", { enum: ["suggestion", "bug", "complaint", "general"] }).notNull(),
    message: text("message").notNull(),
    pageUrl: text("page_url"),
    attachmentUrl: text("attachment_url"),
    status: text("status", { enum: ["new", "in_review", "resolved", "archived"] }).notNull().default("new"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("feedback_status_idx").on(table.status)],
);
