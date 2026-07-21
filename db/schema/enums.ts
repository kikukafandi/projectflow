import { pgEnum } from "drizzle-orm/pg-core";

export const clientTypeEnum = pgEnum("client_type", [
  "individu",
  "perusahaan",
  "instansi",
  "organisasi",
]);
export const clientStatusEnum = pgEnum("client_status", [
  "active",
  "inactive",
  "archived",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "website",
  "web_app",
  "company_profile",
  "ecommerce",
  "sistem_informasi",
  "saas",
  "mobile_app",
  "uiux",
  "maintenance",
  "konsultasi",
  "custom",
]);
export const projectStatusEnum = pgEnum("project_status", [
  "lead",
  "draft",
  "proposal",
  "approved",
  "in_progress",
  "on_hold",
  "client_review",
  "completed",
  "cancelled",
  "archived",
]);

export const complexityEnum = pgEnum("complexity", [
  "very_low",
  "low",
  "medium",
  "high",
  "very_high",
]);
export const pricingMethodEnum = pgEnum("pricing_method", [
  "fixed",
  "hourly",
  "daily",
  "quantity",
  "complexity",
  "manual",
]);

export const scopeStatusEnum = pgEnum("scope_status", [
  "draft",
  "included",
  "optional",
  "excluded",
  "approved",
  "cancelled",
]);

export const rabStatusEnum = pgEnum("rab_status", [
  "draft",
  "final",
  "archived",
  "cancelled",
]);
export const quotationStatusEnum = pgEnum("quotation_status", [
  "draft",
  "sent",
  "viewed",
  "revised",
  "approved",
  "rejected",
  "expired",
  "cancelled",
]);
export const paymentTermTypeEnum = pgEnum("payment_term_type", [
  "full",
  "dp_settlement",
  "milestone",
  "percentage",
  "fixed",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "testing",
  "client_review",
  "done",
  "cancelled",
]);
export const priorityLevelEnum = pgEnum("priority_level", [
  "critical",
  "high",
  "medium",
  "low",
  "someday",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "void",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "confirmed",
  "cancelled",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "transfer",
  "cash",
  "qris",
  "ewallet",
  "gateway",
  "other",
]);
export const receiptStatusEnum = pgEnum("receipt_status", ["issued", "void"]);

export const notificationUrgencyEnum = pgEnum("notification_urgency", [
  "low",
  "medium",
  "high",
]);
