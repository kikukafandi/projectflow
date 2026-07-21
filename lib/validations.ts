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
