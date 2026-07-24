import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import {
  paymentTermTypeEnum,
  quotationStatusEnum,
  rabStatusEnum,
} from "./enums";
import { projects } from "./projects";

// ---- RAB ----
export const rabs = pgTable("rabs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  // Nullable: draft internal belum bernomor. Nomor RAB/2026/00x baru diambil saat
  // di-"finalkan". Postgres mengizinkan banyak NULL pada kolom unique.
  number: text("number").unique(),
  title: text("title"),
  status: rabStatusEnum("status").default("draft").notNull(),
  currentVersion: integer("current_version").default(1).notNull(),
  discount: numeric("discount", { precision: 14, scale: 2 }).default("0"),
  taxPercent: numeric("tax_percent", { precision: 5, scale: 2 }).default("0"),
  // Margin keuntungan (%) di atas biaya operasional — internal, untuk hitung harga jual.
  profitPercent: numeric("profit_percent", { precision: 5, scale: 2 }).default("0"),
  additionalCost: numeric("additional_cost", {
    precision: 14,
    scale: 2,
  }).default("0"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).default("0"),
  notes: text("notes"),
  ...timestamps,
});

export const rabVersions = pgTable("rab_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  rabId: uuid("rab_id")
    .notNull()
    .references(() => rabs.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  snapshot: text("snapshot"), // JSON snapshot of sections+items
  ...timestamps,
});

export const rabSections = pgTable("rab_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  rabId: uuid("rab_id")
    .notNull()
    .references(() => rabs.id, { onDelete: "cascade" }),
  code: text("code"),
  name: text("name").notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const rabItems = pgTable("rab_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => rabSections.id, { onDelete: "cascade" }),
  code: text("code"),
  name: text("name").notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1"),
  unit: text("unit"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).default("0"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  weight: numeric("weight", { precision: 5, scale: 2 }),
  estimateHours: numeric("estimate_hours", { precision: 10, scale: 2 }),
  notes: text("notes"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

// ---- Quotation ----
export const quotations = pgTable("quotations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  rabId: uuid("rab_id").references(() => rabs.id, { onDelete: "set null" }),
  number: text("number").notNull().unique(),
  status: quotationStatusEnum("status").default("draft").notNull(),
  currentVersion: integer("current_version").default(1).notNull(),
  validUntil: date("valid_until"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms"),
  ...timestamps,
});

export const quotationVersions = pgTable("quotation_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  snapshot: text("snapshot"),
  ...timestamps,
});

export const quotationSections = pgTable("quotation_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => quotationSections.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1"),
  unit: text("unit"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).default("0"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const paymentTerms = pgTable("payment_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").references(() => quotations.id, {
    onDelete: "cascade",
  }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  type: paymentTermTypeEnum("type").default("percentage").notNull(),
  percent: numeric("percent", { precision: 5, scale: 2 }),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  dueDate: date("due_date"),
  trigger: text("trigger"),
  position: integer("position").default(0).notNull(),
  status: text("status").default("pending"),
  ...timestamps,
});
