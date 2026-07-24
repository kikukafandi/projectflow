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

export const taskStatusValues = [
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "testing",
  "client_review",
  "done",
  "cancelled",
] as const;

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Judul task wajib diisi"),
  description: optionalStr,
  status: z.enum(taskStatusValues).default("backlog"),
  priority: priorityEnum.default("medium"),
  estimateHours: optionalMoney,
  deadline: optionalStr,
  definitionOfDone: optionalStr,
  notes: optionalStr,
});
export type TaskInput = z.input<typeof taskSchema>;

const factor = z.coerce.number().int().min(1).max(5).default(3);
export const priorityFactorsSchema = z.object({
  businessValue: factor,
  urgency: factor,
  dependencyImportance: factor,
  clientImpact: factor,
  revenueImpact: factor,
  complexity: factor,
  effort: factor,
  risk: factor,
});
export type PriorityFactorsInput = z.input<typeof priorityFactorsSchema>;

export const invoiceMetaSchema = z.object({
  issueDate: optionalStr,
  dueDate: optionalStr,
  discount: optionalMoney,
  taxPercent: optionalMoney,
  bankAccountId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: optionalStr,
});
export type InvoiceMetaInput = z.input<typeof invoiceMetaSchema>;

export const invoiceItemSchema = z.object({
  name: z.string().trim().min(1, "Nama item wajib diisi"),
  description: optionalStr,
  quantity: optionalMoney,
  unit: optionalStr,
  unitPrice: optionalMoney,
});
export type InvoiceItemInput = z.input<typeof invoiceItemSchema>;

export const paymentSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Nominal wajib diisi")
    .refine((v) => Number(v) > 0, "Nominal harus lebih dari 0"),
  paidAt: z.string().trim().min(1, "Tanggal wajib diisi"),
  method: z
    .enum(["transfer", "cash", "qris", "ewallet", "gateway", "other"])
    .default("transfer"),
  bankAccountId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  reference: optionalStr,
  notes: optionalStr,
});
export type PaymentInput = z.input<typeof paymentSchema>;

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
  // Document identity images (PRD §27.3). URLs — hosting is out of scope for now.
  logoUrl: optionalStr,
  signatureUrl: optionalStr,
  stampUrl: optionalStr,
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

/**
 * Document number prefixes (PRD §33.4). "/" is the segment separator, so it is
 * not allowed inside a prefix — that would make numbers ambiguous.
 */
const docPrefix = z
  .string()
  .trim()
  .min(1, "Prefix wajib diisi")
  .max(10, "Prefix maksimal 10 karakter")
  .regex(/^[A-Za-z0-9-]+$/, "Prefix hanya boleh huruf, angka, dan tanda hubung");

export const numberingSchema = z.object({
  project: docPrefix,
  rab: docPrefix,
  quotation: docPrefix,
  invoice: docPrefix,
  receipt: docPrefix,
});
export type NumberingInput = z.input<typeof numberingSchema>;

export const accountProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama terlalu panjang"),
});
export type AccountProfileInput = z.input<typeof accountProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "Password baru harus berbeda dari password saat ini",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

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
  profitPercent: optionalMoney,
  notes: optionalStr,
});
export type RabMetaInput = z.input<typeof rabMetaSchema>;

export const rabItemSchema = z.object({
  name: z.string().trim().min(1, "Nama pekerjaan wajib diisi"),
  description: optionalStr,
  quantity: optionalMoney,
  unit: optionalStr,
  unitPrice: optionalMoney,
  // weight (bobot) dihitung otomatis di tampilan RAB, bukan diinput.
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
