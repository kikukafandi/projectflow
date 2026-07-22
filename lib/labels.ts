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

export const taskStatus: Record<string, { label: string; tone: Tone }> = {
  backlog: { label: "Backlog", tone: "gray" },
  ready: { label: "Ready", tone: "blue" },
  in_progress: { label: "In Progress", tone: "blue" },
  blocked: { label: "Blocked", tone: "red" },
  review: { label: "Review", tone: "purple" },
  testing: { label: "Testing", tone: "cyan" },
  client_review: { label: "Client Review", tone: "purple" },
  done: { label: "Done", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

/** Kanban column order for the board (DESIGN.MD §16). */
export const taskBoardColumns = [
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "testing",
  "done",
] as const;

export const scopeStatus: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "gray" },
  included: { label: "Included", tone: "green" },
  optional: { label: "Optional", tone: "orange" },
  excluded: { label: "Excluded", tone: "gray" },
  approved: { label: "Approved", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const rabStatus: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "gray" },
  final: { label: "Final", tone: "green" },
  archived: { label: "Archived", tone: "gray" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const quotationStatus: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "gray" },
  sent: { label: "Sent", tone: "blue" },
  viewed: { label: "Viewed", tone: "purple" },
  revised: { label: "Revised", tone: "yellow" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  expired: { label: "Expired", tone: "gray" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const paymentTermTypeLabels: Record<string, string> = {
  full: "Pembayaran penuh",
  dp_settlement: "DP & pelunasan",
  milestone: "Milestone",
  percentage: "Persentase",
  fixed: "Nominal tetap",
};

export const invoiceStatus: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "gray" },
  sent: { label: "Sent", tone: "blue" },
  partially_paid: { label: "Partially Paid", tone: "yellow" },
  paid: { label: "Paid", tone: "green" },
  overdue: { label: "Overdue", tone: "red" },
  cancelled: { label: "Cancelled", tone: "gray" },
  void: { label: "Void", tone: "red" },
};

export const paymentMethodLabels: Record<string, string> = {
  transfer: "Transfer Bank",
  cash: "Tunai",
  qris: "QRIS",
  ewallet: "E-wallet",
  gateway: "Payment Gateway",
  other: "Lainnya",
};

export const receiptStatus: Record<string, { label: string; tone: Tone }> = {
  issued: { label: "Terbit", tone: "green" },
  void: { label: "Void", tone: "red" },
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

/** Human label for an activity-log action (PRD §32.2). */
const activityLabels: Record<string, string> = {
  "business_profile.saved": "Profil bisnis disimpan",
  "client.archived": "Klien diarsipkan",
  "client.deleted": "Klien dihapus",
  "client.unarchived": "Klien dikembalikan dari arsip",
  "client.created": "Klien dibuat",
  "client.updated": "Klien diperbarui",
  "invoice.created": "Invoice dibuat",
  "numbering.saved": "Format nomor dokumen diubah",
  "payment.cancelled": "Pembayaran dibatalkan",
  "payment.recorded": "Pembayaran dicatat",
  "project.archived": "Proyek diarsipkan",
  "project.deleted": "Proyek dihapus",
  "project.unarchived": "Proyek dikembalikan dari arsip",
  "project.created": "Proyek dibuat",
  "project.updated": "Proyek diperbarui",
  "quotation.approved": "Quotation disetujui",
  "quotation.generated": "Quotation dibuat dari RAB",
  "rab.generated": "RAB dibuat dari scope",
  "receipt.created": "Kuitansi diterbitkan",
  "scope.module_added": "Modul ditambahkan ke scope",
  "task.done": "Task diselesaikan",
  "tasks.generated": "Task dibuat dari scope",
  "wip.override": "WIP limit ditembus",
};

export function activityLabel(action: string): string {
  return activityLabels[action] ?? action;
}

/**
 * Route for an entity referenced by a log/notification. Returns null for types
 * whose route needs a parent id (task, quotation) — those are resolved by the
 * caller that already knows the project.
 */
export function entityHref(
  entityType: string | null,
  entityId: string | null,
): string | null {
  if (!entityId) return null;
  switch (entityType) {
    case "client":
      return `/clients/${entityId}`;
    case "project":
      return `/projects/${entityId}`;
    case "invoice":
      return `/invoices/${entityId}`;
    default:
      return null;
  }
}
