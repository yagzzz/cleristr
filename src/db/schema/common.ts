import { integer, text } from "drizzle-orm/sqlite-core";

export const idColumn = () => text("id").primaryKey();

export const timestampColumns = () => ({
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const optionalPublishWindow = () => ({
  startsAt: text("starts_at"),
  endsAt: text("ends_at"),
});

export const booleanColumn = (name: string, defaultValue = false) =>
  integer(name, { mode: "boolean" }).notNull().default(defaultValue);
