import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { booleanColumn, idColumn, timestampColumns } from "./common";

export const users = sqliteTable(
  "users",
  {
    id: idColumn(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    role: text("role", {
      enum: ["customer", "owner", "admin", "order_manager", "content_manager", "marketing"],
    })
      .notNull()
      .default("customer"),
    status: text("status", { enum: ["active", "invited", "suspended", "deleted"] })
      .notNull()
      .default("active"),
    emailVerifiedAt: text("email_verified_at"),
    lastLoginAt: text("last_login_at"),
    totpEnabled: booleanColumn("totp_enabled"),
    totpSecretEncrypted: text("totp_secret_encrypted"),
    marketingEmailOptIn: booleanColumn("marketing_email_opt_in"),
    marketingSmsOptIn: booleanColumn("marketing_sms_opt_in"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email), index("users_role_idx").on(table.role)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: idColumn(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    lastSeenAt: text("last_seen_at").notNull(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("sessions_token_hash_unique").on(table.tokenHash), index("sessions_user_idx").on(table.userId)],
);

export const oauthAccounts = sqliteTable(
  "oauth_accounts",
  {
    id: idColumn(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider", { enum: ["google"] }).notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    email: text("email"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("oauth_provider_account_unique").on(table.provider, table.providerAccountId), index("oauth_user_idx").on(table.userId)],
);

export const accountTokens = sqliteTable(
  "account_tokens",
  {
    id: idColumn(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["email_verification", "password_reset", "admin_invite", "two_factor_recovery"] }).notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    consumedAt: text("consumed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("account_tokens_hash_unique").on(table.tokenHash), index("account_tokens_user_idx").on(table.userId)],
);

export const addresses = sqliteTable(
  "addresses",
  {
    id: idColumn(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Adresim"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),
    company: text("company"),
    taxOffice: text("tax_office"),
    taxNumber: text("tax_number"),
    line1: text("line1").notNull(),
    line2: text("line2"),
    district: text("district").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code"),
    countryCode: text("country_code").notNull().default("TR"),
    isDefaultShipping: booleanColumn("is_default_shipping"),
    isDefaultBilling: booleanColumn("is_default_billing"),
    ...timestampColumns(),
  },
  (table) => [index("addresses_user_idx").on(table.userId)],
);

export const adminAuditLogs = sqliteTable(
  "admin_audit_logs",
  {
    id: idColumn(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    summary: text("summary").notNull(),
    beforeJson: text("before_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    afterJson: text("after_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    ipHash: text("ip_hash"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("audit_actor_idx").on(table.actorUserId), index("audit_entity_idx").on(table.entityType, table.entityId)],
);

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    id: idColumn(),
    keyHash: text("key_hash").notNull(),
    action: text("action").notNull(),
    windowStartedAt: text("window_started_at").notNull(),
    count: integer("count").notNull().default(0),
    blockedUntil: text("blocked_until"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("rate_limit_key_action_unique").on(table.keyHash, table.action)],
);
