import { z } from "zod";

const optionalStr = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalMoney = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v))
  .refine((v) => v === undefined || !Number.isNaN(Number(v)), "Nominal tidak valid");

export const clientSchema = z.object({
  type: z.enum(["individu", "perusahaan", "instansi", "organisasi"]),
  name: z.string().trim().min(1, "Nama wajib diisi"),
  companyName: optionalStr,
  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  whatsapp: optionalStr,
  phone: optionalStr,
  address: optionalStr,
  city: optionalStr,
  province: optionalStr,
  postalCode: optionalStr,
  npwp: optionalStr,
  picName: optionalStr,
  picRole: optionalStr,
  notes: optionalStr,
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});
export type ClientInput = z.input<typeof clientSchema>;

const complexityEnum = z.enum(["very_low", "low", "medium", "high", "very_high"]);
const priorityEnum = z.enum(["critical", "high", "medium", "low", "someday"]);

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi"),
  isActive: z.coerce.boolean().default(true),
});
export type CategoryInput = z.input<typeof categorySchema>;

export const moduleSchema = z.object({
  categoryId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  name: z.string().trim().min(1, "Nama modul wajib diisi"),
  description: optionalStr,
  defaultEstimateHours: optionalMoney,
  defaultPrice: optionalMoney,
  complexity: complexityEnum.default("medium"),
  isActive: z.coerce.boolean().default(true),
  notes: optionalStr,
});
export type ModuleInput = z.input<typeof moduleSchema>;

export const featureItemSchema = z.object({
  name: z.string().trim().min(1, "Nama fitur wajib diisi"),
  description: optionalStr,
  estimateHours: optionalMoney,
  fixedPrice: optionalMoney,
  hourlyRate: optionalMoney,
  unit: optionalStr,
  defaultQuantity: optionalMoney,
  pricingMethod: z
    .enum(["fixed", "hourly", "daily", "quantity", "complexity", "manual"])
    .default("fixed"),
  complexity: complexityEnum.default("medium"),
  defaultPriority: priorityEnum.default("medium"),
  definitionOfDone: optionalStr,
  isActive: z.coerce.boolean().default(true),
});
export type FeatureItemInput = z.input<typeof featureItemSchema>;

export const businessProfileSchema = z.object({
  businessName: z.string().trim().min(1, "Nama bisnis wajib diisi"),
  ownerName: optionalStr,
  address: optionalStr,
  city: optionalStr,
  province: optionalStr,
  postalCode: optionalStr,
  email: z
    .string()
    .trim()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: optionalStr,
  whatsapp: optionalStr,
  website: optionalStr,
  npwp: optionalStr,
  slogan: optionalStr,
  primaryColor: optionalStr,
  defaultNote: optionalStr,
  paymentTerms: optionalStr,
  documentFooter: optionalStr,
});
export type BusinessProfileInput = z.input<typeof businessProfileSchema>;

export const bankAccountSchema = z.object({
  bankName: z.string().trim().min(1, "Nama bank wajib diisi"),
  accountNumber: z.string().trim().min(1, "Nomor rekening wajib diisi"),
  accountHolder: z.string().trim().min(1, "Nama pemilik rekening wajib diisi"),
  branch: optionalStr,
  isPrimary: z.coerce.boolean().default(false),
});
export type BankAccountInput = z.input<typeof bankAccountSchema>;

export const generalSettingsSchema = z.object({
  // Pricing (PRD §33.2)
  hourlyRate: optionalMoney,
  dailyRate: optionalMoney,
  defaultTaxPercent: optionalMoney,
  defaultDiscount: optionalMoney,
  riskReserve: optionalMoney,
  // Productivity (PRD §33.3 / §22)
  maxActiveProjects: optionalMoney,
  maxInProgressTasks: optionalMoney,
  maxDailyFocus: optionalMoney,
  workHoursPerDay: optionalMoney,
});
export type GeneralSettingsInput = z.input<typeof generalSettingsSchema>;

export const scopeFeatureSchema = z.object({
  name: z.string().trim().min(1, "Nama fitur wajib diisi"),
  description: optionalStr,
  quantity: optionalMoney,
  unit: optionalStr,
  estimateHours: optionalMoney,
  unitPrice: optionalMoney,
  complexity: complexityEnum.default("medium"),
  status: z
    .enum(["draft", "included", "optional", "excluded", "approved", "cancelled"])
    .default("included"),
  notes: optionalStr,
});
export type ScopeFeatureInput = z.input<typeof scopeFeatureSchema>;

export const rabMetaSchema = z.object({
  title: optionalStr,
  discount: optionalMoney,
  taxPercent: optionalMoney,
  additionalCost: optionalMoney,
  notes: optionalStr,
});
export type RabMetaInput = z.input<typeof rabMetaSchema>;

export const rabItemSchema = z.object({
  name: z.string().trim().min(1, "Nama pekerjaan wajib diisi"),
  description: optionalStr,
  quantity: optionalMoney,
  unit: optionalStr,
  unitPrice: optionalMoney,
  weight: optionalMoney,
  estimateHours: optionalMoney,
  notes: optionalStr,
});
export type RabItemInput = z.input<typeof rabItemSchema>;

export const quotationMetaSchema = z.object({
  validUntil: optionalStr,
  notes: optionalStr,
  terms: optionalStr,
});
export type QuotationMetaInput = z.input<typeof quotationMetaSchema>;

export const paymentTermSchema = z.object({
  name: z.string().trim().min(1, "Nama termin wajib diisi"),
  description: optionalStr,
  type: z
    .enum(["full", "dp_settlement", "milestone", "percentage", "fixed"])
    .default("percentage"),
  percent: optionalMoney,
  amount: optionalMoney,
  dueDate: optionalStr,
  trigger: optionalStr,
});
export type PaymentTermInput = z.input<typeof paymentTermSchema>;

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Nama proyek wajib diisi"),
  clientId: z.string().uuid("Klien wajib dipilih"),
  type: z.enum([
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
  ]),
  description: optionalStr,
  goal: optionalStr,
  targetUsers: optionalStr,
  startDate: optionalStr,
  deadline: optionalStr,
  clientBudget: optionalMoney,
  projectValue: optionalMoney,
  status: z.enum([
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
  ]),
  priority: z.enum(["critical", "high", "medium", "low", "someday"]),
  internalNotes: optionalStr,
});
export type ProjectInput = z.input<typeof projectSchema>;
