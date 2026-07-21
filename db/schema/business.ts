import { boolean, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";

export const businessProfiles = pgTable("business_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name"),
  logoUrl: text("logo_url"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  website: text("website"),
  npwp: text("npwp"),
  slogan: text("slogan"),
  // Document identity
  primaryColor: text("primary_color").default("#FF7A1A"),
  signatureUrl: text("signature_url"),
  stampUrl: text("stamp_url"),
  defaultNote: text("default_note"),
  paymentTerms: text("payment_terms"),
  documentFooter: text("document_footer"),
  ...timestamps,
});

export const businessBankAccounts = pgTable("business_bank_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountHolder: text("account_holder").notNull(),
  branch: text("branch"),
  qrisUrl: text("qris_url"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  ...timestamps,
});

export const businessAssets = pgTable("business_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(), // logo | signature | stamp | qris
  url: text("url").notNull(),
  meta: jsonb("meta"),
  ...timestamps,
});
