import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import {
  invoiceStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
  receiptStatusEnum,
} from "./enums";
import { businessBankAccounts } from "./business";
import { clients } from "./clients";
import { projects } from "./projects";
import { paymentTerms, quotations } from "./sales";

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: text("number").notNull().unique(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  quotationId: uuid("quotation_id").references(() => quotations.id, {
    onDelete: "set null",
  }),
  paymentTermId: uuid("payment_term_id").references(() => paymentTerms.id, {
    onDelete: "set null",
  }),
  bankAccountId: uuid("bank_account_id").references(
    () => businessBankAccounts.id,
    { onDelete: "set null" },
  ),
  issueDate: date("issue_date").defaultNow(),
  dueDate: date("due_date"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  discount: numeric("discount", { precision: 14, scale: 2 }).default("0"),
  taxPercent: numeric("tax_percent", { precision: 5, scale: 2 }).default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 14, scale: 2 }).default("0"),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  notes: text("notes"),
  ...timestamps,
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).default("1"),
  unit: text("unit"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).default("0"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).default("0"),
  position: integer("position").default(0).notNull(),
  ...timestamps,
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paidAt: date("paid_at").notNull(),
  method: paymentMethodEnum("method").default("transfer").notNull(),
  bankAccountId: uuid("bank_account_id").references(
    () => businessBankAccounts.id,
    { onDelete: "set null" },
  ),
  reference: text("reference"),
  proofFileId: uuid("proof_file_id"),
  status: paymentStatusEnum("status").default("confirmed").notNull(),
  notes: text("notes"),
  ...timestamps,
});

export const receipts = pgTable("receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: text("number").notNull().unique(),
  paymentId: uuid("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "restrict" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  amountInWords: text("amount_in_words"),
  purpose: text("purpose"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow(),
  status: receiptStatusEnum("status").default("issued").notNull(),
  notes: text("notes"),
  ...timestamps,
});
