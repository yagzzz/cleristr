import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { booleanColumn, idColumn, optionalPublishWindow, timestampColumns } from "./common";
import { users } from "./identity";

export const contacts = sqliteTable(
  "contacts",
  {
    id: idColumn(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email"),
    phone: text("phone"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    status: text("status", { enum: ["active", "unsubscribed", "suppressed", "bounced"] }).notNull().default("active"),
    lastSeenAt: text("last_seen_at"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("contacts_email_unique").on(table.email), uniqueIndex("contacts_phone_unique").on(table.phone), index("contacts_user_idx").on(table.userId)],
);

export const consents = sqliteTable(
  "consents",
  {
    id: idColumn(),
    contactId: text("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    purpose: text("purpose", { enum: ["email_marketing", "sms_marketing", "analytics", "advertising", "terms", "privacy"] }).notNull(),
    granted: booleanColumn("granted"),
    source: text("source").notNull(),
    policyVersion: text("policy_version").notNull(),
    grantedAt: text("granted_at"),
    withdrawnAt: text("withdrawn_at"),
    metadataJson: text("metadata_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("consents_contact_purpose_idx").on(table.contactId, table.purpose), index("consents_user_purpose_idx").on(table.userId, table.purpose)],
);

export const marketingTags = sqliteTable("marketing_tags", {
  id: idColumn(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  color: text("color"),
  ...timestampColumns(),
}, (table) => [uniqueIndex("marketing_tags_slug_unique").on(table.slug)]);

export const contactTags = sqliteTable("contact_tags", {
  contactId: text("contact_id").notNull().references(() => contacts.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => marketingTags.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("contact_tag_unique").on(table.contactId, table.tagId)]);

export const segments = sqliteTable(
  "segments",
  {
    id: idColumn(),
    name: text("name").notNull(),
    description: text("description"),
    kind: text("kind", { enum: ["dynamic", "static"] }).notNull().default("dynamic"),
    rulesJson: text("rules_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    isActive: booleanColumn("is_active", true),
    lastCalculatedAt: text("last_calculated_at"),
    estimatedCount: integer("estimated_count").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [index("segments_active_idx").on(table.isActive)],
);

export const marketingEvents = sqliteTable(
  "marketing_events",
  {
    id: idColumn(),
    eventName: text("event_name").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    contactId: text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    anonymousId: text("anonymous_id"),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    payloadJson: text("payload_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    idempotencyKey: text("idempotency_key"),
    occurredAt: text("occurred_at").notNull(),
    processedAt: text("processed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("marketing_event_idempotency_unique").on(table.idempotencyKey), index("marketing_events_name_time_idx").on(table.eventName, table.occurredAt), index("marketing_events_contact_idx").on(table.contactId)],
);

export const automationFlows = sqliteTable(
  "automation_flows",
  {
    id: idColumn(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status", { enum: ["draft", "active", "paused", "archived"] }).notNull().default("draft"),
    triggerEvent: text("trigger_event").notNull(),
    version: integer("version").notNull().default(1),
    definitionJson: text("definition_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    publishedAt: text("published_at"),
    ...timestampColumns(),
  },
  (table) => [index("automation_flows_status_trigger_idx").on(table.status, table.triggerEvent)],
);

export const automationNodes = sqliteTable(
  "automation_nodes",
  {
    id: idColumn(),
    flowId: text("flow_id").notNull().references(() => automationFlows.id, { onDelete: "cascade" }),
    nodeKey: text("node_key").notNull(),
    type: text("type", {
      enum: ["trigger", "delay", "condition", "branch", "filter", "segment", "email", "sms", "popup", "coupon", "tag_add", "tag_remove", "list_add", "list_remove", "webhook", "ab_test", "exit"],
    }).notNull(),
    positionX: integer("position_x").notNull().default(0),
    positionY: integer("position_y").notNull().default(0),
    configJson: text("config_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("automation_node_key_unique").on(table.flowId, table.nodeKey), index("automation_nodes_flow_idx").on(table.flowId)],
);

export const automationEdges = sqliteTable(
  "automation_edges",
  {
    id: idColumn(),
    flowId: text("flow_id").notNull().references(() => automationFlows.id, { onDelete: "cascade" }),
    sourceNodeKey: text("source_node_key").notNull(),
    targetNodeKey: text("target_node_key").notNull(),
    sourceHandle: text("source_handle"),
    label: text("label"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("automation_edge_unique").on(table.flowId, table.sourceNodeKey, table.targetNodeKey, table.sourceHandle)],
);

export const automationRuns = sqliteTable(
  "automation_runs",
  {
    id: idColumn(),
    flowId: text("flow_id").notNull().references(() => automationFlows.id, { onDelete: "cascade" }),
    flowVersion: integer("flow_version").notNull(),
    eventId: text("event_id").references(() => marketingEvents.id, { onDelete: "set null" }),
    contactId: text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    status: text("status", { enum: ["running", "waiting", "completed", "failed", "cancelled"] }).notNull().default("running"),
    currentNodeKey: text("current_node_key"),
    contextJson: text("context_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    nextRunAt: text("next_run_at"),
    lastError: text("last_error"),
    startedAt: text("started_at").notNull(),
    completedAt: text("completed_at"),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("automation_runs_due_idx").on(table.status, table.nextRunAt), index("automation_runs_contact_idx").on(table.contactId)],
);

export const messageTemplates = sqliteTable(
  "message_templates",
  {
    id: idColumn(),
    name: text("name").notNull(),
    channel: text("channel", { enum: ["email", "sms", "onsite", "transactional_email", "transactional_sms"] }).notNull(),
    subject: text("subject"),
    preheader: text("preheader"),
    contentJson: text("content_json", { mode: "json" }).$type<Array<Record<string, unknown>>>().notNull(),
    textContent: text("text_content"),
    status: text("status", { enum: ["draft", "active", "archived"] }).notNull().default("draft"),
    ...timestampColumns(),
  },
  (table) => [index("message_templates_channel_idx").on(table.channel, table.status)],
);

export const campaigns = sqliteTable(
  "campaigns",
  {
    id: idColumn(),
    name: text("name").notNull(),
    channel: text("channel", { enum: ["email", "sms", "onsite", "multi"] }).notNull(),
    status: text("status", { enum: ["draft", "scheduled", "sending", "sent", "paused", "cancelled"] }).notNull().default("draft"),
    templateId: text("template_id").references(() => messageTemplates.id, { onDelete: "set null" }),
    segmentId: text("segment_id").references(() => segments.id, { onDelete: "set null" }),
    scheduledAt: text("scheduled_at"),
    sentAt: text("sent_at"),
    abTestJson: text("ab_test_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    statsJson: text("stats_json", { mode: "json" }).$type<Record<string, number> | null>(),
    ...timestampColumns(),
  },
  (table) => [index("campaigns_status_schedule_idx").on(table.status, table.scheduledAt)],
);

export const popups = sqliteTable(
  "popups",
  {
    id: idColumn(),
    name: text("name").notNull(),
    type: text("type", { enum: ["newsletter", "discount", "coupon", "cart_abandonment", "exit_intent", "campaign", "announcement", "new_product"] }).notNull(),
    status: text("status", { enum: ["draft", "active", "paused", "archived"] }).notNull().default("draft"),
    contentJson: text("content_json", { mode: "json" }).$type<Array<Record<string, unknown>>>().notNull(),
    targetingJson: text("targeting_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    frequencyCount: integer("frequency_count").notNull().default(1),
    frequencyWindowDays: integer("frequency_window_days").notNull().default(7),
    ...optionalPublishWindow(),
    ...timestampColumns(),
  },
  (table) => [index("popups_active_window_idx").on(table.status, table.startsAt, table.endsAt)],
);

export const popupImpressions = sqliteTable(
  "popup_impressions",
  {
    id: idColumn(),
    popupId: text("popup_id").notNull().references(() => popups.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    visitorHash: text("visitor_hash").notNull(),
    action: text("action", { enum: ["view", "dismiss", "convert"] }).notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("popup_impressions_cap_idx").on(table.popupId, table.visitorHash, table.createdAt)],
);

export const backgroundJobs = sqliteTable(
  "background_jobs",
  {
    id: idColumn(),
    type: text("type").notNull(),
    payloadJson: text("payload_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    status: text("status", { enum: ["pending", "running", "completed", "failed", "cancelled"] }).notNull().default("pending"),
    idempotencyKey: text("idempotency_key"),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    runAt: text("run_at").notNull(),
    lockedAt: text("locked_at"),
    lockedBy: text("locked_by"),
    lastError: text("last_error"),
    completedAt: text("completed_at"),
    ...timestampColumns(),
  },
  (table) => [uniqueIndex("background_jobs_idempotency_unique").on(table.idempotencyKey), index("background_jobs_due_idx").on(table.status, table.runAt)],
);

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: idColumn(),
    eventName: text("event_name").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    anonymousId: text("anonymous_id"),
    sessionId: text("session_id"),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    valueAmount: integer("value_amount"),
    currency: text("currency"),
    propertiesJson: text("properties_json", { mode: "json" }).$type<Record<string, unknown> | null>(),
    occurredAt: text("occurred_at").notNull(),
  },
  (table) => [index("analytics_event_name_time_idx").on(table.eventName, table.occurredAt), index("analytics_entity_idx").on(table.entityType, table.entityId)],
);
