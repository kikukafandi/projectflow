/** Human labels + badge tones for enum values (id-ID). Central so UI stays consistent. */

export type Tone =
  | "gray"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "purple"
  | "orange"
  | "cyan";

export const clientTypeLabels: Record<string, string> = {
  individu: "Individu",
  perusahaan: "Perusahaan",
  instansi: "Instansi",
  organisasi: "Organisasi",
};

export const clientStatus: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Aktif", tone: "green" },
  inactive: { label: "Nonaktif", tone: "gray" },
  archived: { label: "Diarsipkan", tone: "gray" },
};

export const projectTypeLabels: Record<string, string> = {
  website: "Website",
  web_app: "Web Application",
  company_profile: "Company Profile",
  ecommerce: "E-commerce",
  sistem_informasi: "Sistem Informasi",
  saas: "SaaS",
  mobile_app: "Mobile Application",
  uiux: "UI/UX Design",
  maintenance: "Maintenance",
  konsultasi: "Konsultasi",
  custom: "Custom",
};

export const projectStatus: Record<string, { label: string; tone: Tone }> = {
  lead: { label: "Lead", tone: "gray" },
  draft: { label: "Draft", tone: "gray" },
  proposal: { label: "Proposal", tone: "blue" },
  approved: { label: "Approved", tone: "green" },
  in_progress: { label: "In Progress", tone: "blue" },
  on_hold: { label: "On Hold", tone: "yellow" },
  client_review: { label: "Client Review", tone: "purple" },
  completed: { label: "Completed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
  archived: { label: "Archived", tone: "gray" },
};

export const complexityLabels: Record<string, { label: string; tone: Tone }> = {
  very_low: { label: "Very Low", tone: "gray" },
  low: { label: "Low", tone: "green" },
  medium: { label: "Medium", tone: "blue" },
  high: { label: "High", tone: "orange" },
  very_high: { label: "Very High", tone: "red" },
};

export const pricingMethodLabels: Record<string, string> = {
  fixed: "Harga tetap",
  hourly: "Per jam",
  daily: "Per hari",
  quantity: "Qty × satuan",
  complexity: "Kompleksitas",
  manual: "Manual",
};

export const priorityLabels: Record<string, { label: string; tone: Tone }> = {
  critical: { label: "Critical", tone: "red" },
  high: { label: "High", tone: "orange" },
  medium: { label: "Medium", tone: "yellow" },
  low: { label: "Low", tone: "gray" },
  someday: { label: "Someday", tone: "gray" },
};
