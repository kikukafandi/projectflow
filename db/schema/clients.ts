import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { clientStatusEnum, clientTypeEnum } from "./enums";

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: clientTypeEnum("type").default("individu").notNull(),
  name: text("name").notNull(),
  companyName: text("company_name"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  npwp: text("npwp"),
  picName: text("pic_name"),
  picRole: text("pic_role"),
  notes: text("notes"),
  status: clientStatusEnum("status").default("active").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
});

export const clientContacts = pgTable("client_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  ...timestamps,
});

export const clientNotes = pgTable("client_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  ...timestamps,
});
