import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { notificationUrgencyEnum } from "./enums";

/** Single-row key/value app settings (PRD §33). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value"),
  ...timestamps,
});

/** Per-document-type running sequence, e.g. INV/2026/{seq} (PRD §33.4). */
export const documentSequences = pgTable(
  "document_sequences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    docType: text("doc_type").notNull(), // project | rab | quotation | invoice | receipt
    year: integer("year").notNull(),
    lastSequence: integer("last_sequence").default(0).notNull(),
    ...timestamps,
  },
  (t) => [unique("doc_sequences_type_year").on(t.docType, t.year)],
);

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  isPrivate: boolean("is_private").default(true).notNull(),
  ...timestamps,
});

export const documentTemplates = pgTable("document_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  docType: text("doc_type").notNull(),
  name: text("name").notNull(),
  config: jsonb("config"),
  ...timestamps,
});

export const generatedDocuments = pgTable("generated_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  docType: text("doc_type").notNull(),
  number: text("number"),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  fileUrl: text("file_url"),
  ...timestamps,
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  urgency: notificationUrgencyEnum("urgency").default("low").notNull(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...timestamps,
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
