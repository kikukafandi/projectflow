/**
 * Loads any printable document (PRD §27) into one normalized shape so a single
 * A4 template renders RAB, Quotation, Invoice, and Kuitansi.
 * Values are read straight from the stored rows — the paper must equal the DB.
 */
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  businessBankAccounts,
  businessProfiles,
  clients,
  invoiceItems,
  invoices,
  payments,
  projects,
  quotationItems,
  quotationSections,
  quotations,
  rabItems,
  rabSections,
  rabs,
  receipts,
} from "@/db/schema";
import { computeRabTotals, toNum } from "@/lib/money";
import { terbilangRupiah } from "@/lib/terbilang";
import {
  invoiceStatus,
  paymentMethodLabels,
  quotationStatus,
  rabStatus,
  receiptStatus,
} from "@/lib/labels";
import { formatDate, formatIDR } from "@/lib/utils";

export const DOC_TYPES = ["rab", "quotation", "invoice", "receipt"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export function isDocType(v: string): v is DocType {
  return (DOC_TYPES as readonly string[]).includes(v);
}

export type DocLine = {
  name: string;
  description?: string | null;
  quantity?: string | number | null;
  unit?: string | null;
  unitPrice?: string | number | null;
  subtotal?: string | number | null;
};

export type DocSection = { name: string; items: DocLine[] };

export type DocTotal = { label: string; value: string; strong?: boolean };

export type DocData = {
  docLabel: string;
  number: string;
  status?: { label: string; tone: "neutral" | "positive" | "attention" | "critical" };
  meta: { label: string; value: string }[];
  recipient: { name: string; lines: string[] } | null;
  sections: DocSection[];
  totals: DocTotal[];
  showPrice?: boolean;
  amountInWords?: string | null;
  notes?: string | null;
  terms?: string | null;
  bank?: { bankName: string; accountNumber: string; accountHolder: string } | null;
  /** Signature block caption, e.g. "Diterima oleh" on a receipt. */
  signedLabel: string;
};

export type BusinessProfile = typeof businessProfiles.$inferSelect;

async function getProfile(): Promise<BusinessProfile | null> {
  const [p] = await db.select().from(businessProfiles).limit(1);
  return p ?? null;
}

async function primaryBank() {
  const banks = await db.select().from(businessBankAccounts);
  return banks.find((b) => b.isPrimary) ?? banks[0] ?? null;
}

function bankOf(b: typeof businessBankAccounts.$inferSelect | null | undefined) {
  return b
    ? {
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        accountHolder: b.accountHolder,
      }
    : null;
}

function documentStatus(
  value: string,
  labels: Record<string, { label: string; tone: string }>,
): DocData["status"] {
  const status = labels[value];
  if (!status) return undefined;
  const tones: Record<string, NonNullable<DocData["status"]>["tone"]> = {
    green: "positive",
    yellow: "attention",
    orange: "attention",
    red: "critical",
  };
  return { label: status.label, tone: tones[status.tone] ?? "neutral" };
}

function clientBlock(c: typeof clients.$inferSelect | undefined) {
  if (!c) return null;
  return {
    name: c.companyName || c.name,
    lines: [
      c.companyName ? c.name : "",
      c.address ?? "",
      [c.city, c.province, c.postalCode].filter(Boolean).join(", "),
      c.phone || c.whatsapp || "",
      c.email ?? "",
    ].filter(Boolean),
  };
}

/** Returns null when the document does not exist (caller renders notFound). */
export async function loadDocument(
  docType: DocType,
  id: string,
): Promise<{ profile: BusinessProfile | null; doc: DocData } | null> {
  const profile = await getProfile();

  if (docType === "rab") {
    const [rab] = await db.select().from(rabs).where(eq(rabs.id, id));
    if (!rab) return null;
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, rab.projectId));
    const [client] = project
      ? await db.select().from(clients).where(eq(clients.id, project.clientId))
      : [];
    const sections = await db
      .select()
      .from(rabSections)
      .where(eq(rabSections.rabId, rab.id))
      .orderBy(asc(rabSections.position));
    const docSections: DocSection[] = [];
    const allItems: DocLine[] = [];
    for (const s of sections) {
      const its = await db
        .select()
        .from(rabItems)
        .where(eq(rabItems.sectionId, s.id))
        .orderBy(asc(rabItems.position));
      allItems.push(...its);
      docSections.push({
        name: s.code ? `${s.code}. ${s.name}` : s.name,
        items: its,
      });
    }
    const t = computeRabTotals({
      items: allItems,
      discount: rab.discount,
      taxPercent: rab.taxPercent,
      additionalCost: rab.additionalCost,
      profitPercent: rab.profitPercent,
    });
    return {
      profile,
      doc: {
        docLabel: "Rencana Anggaran Biaya",
        number: rab.number ?? "DRAFT",
        status: documentStatus(rab.status, rabStatus),
        meta: [
          { label: "Tanggal", value: formatDate(rab.createdAt) },
          { label: "Proyek", value: project?.name ?? "—" },
          { label: "Versi", value: String(rab.currentVersion) },
        ],
        recipient: clientBlock(client),
        sections: docSections,
        totals: totalsRows(
          t,
          rab.discount,
          rab.taxPercent,
          rab.additionalCost,
          rab.profitPercent,
        ),
         showPrice: rab.showPrice,
         amountInWords: rab.showPrice ? terbilangRupiah(t.grandTotal) : null,
         notes: rab.notes,
        bank: null,
        signedLabel: "Disusun oleh",
      },
    };
  }

  if (docType === "quotation") {
    const [q] = await db.select().from(quotations).where(eq(quotations.id, id));
    if (!q) return null;
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, q.projectId));
    const [client] = project
      ? await db.select().from(clients).where(eq(clients.id, project.clientId))
      : [];
    const sections = await db
      .select()
      .from(quotationSections)
      .where(eq(quotationSections.quotationId, q.id))
      .orderBy(asc(quotationSections.position));
    const docSections: DocSection[] = [];
    for (const s of sections) {
      const its = await db
        .select()
        .from(quotationItems)
        .where(eq(quotationItems.sectionId, s.id))
        .orderBy(asc(quotationItems.position));
      docSections.push({ name: s.name, items: its });
    }
    return {
      profile,
      doc: {
        docLabel: q.showPrice ? "Penawaran Harga" : "Penawaran Ruang Lingkup",
        number: q.number,
        status: documentStatus(q.status, quotationStatus),
        meta: [
          { label: "Tanggal", value: formatDate(q.createdAt) },
          { label: "Proyek", value: project?.name ?? "—" },
          { label: "Berlaku s/d", value: formatDate(q.validUntil) },
        ],
        recipient: clientBlock(client),
        sections: docSections,
        showPrice: q.showPrice,
        amountInWords: q.showPrice ? terbilangRupiah(q.grandTotal ?? "0") : null,
        totals: [
          { label: "Subtotal", value: formatIDR(q.subtotal) },
          { label: "Grand Total", value: formatIDR(q.grandTotal), strong: true },
        ],
        notes: q.notes,
        terms: q.terms,
        bank: bankOf(await primaryBank()),
        signedLabel: "Hormat kami",
      },
    };
  }

  if (docType === "invoice") {
    const [inv] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!inv) return null;
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, inv.clientId));
    const [project] = inv.projectId
      ? await db.select().from(projects).where(eq(projects.id, inv.projectId))
      : [];
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, inv.id))
      .orderBy(asc(invoiceItems.position));
    const [bank] = inv.bankAccountId
      ? await db
          .select()
          .from(businessBankAccounts)
          .where(eq(businessBankAccounts.id, inv.bankAccountId))
      : [];
    const paid = toNum(inv.paidAmount);
    const totals: DocTotal[] = [
      { label: "Subtotal", value: formatIDR(inv.subtotal) },
    ];
    if (toNum(inv.discount) > 0)
      totals.push({ label: "Diskon", value: `−${formatIDR(inv.discount)}` });
    if (toNum(inv.taxPercent) > 0)
      totals.push({
        label: `Pajak (${Number(inv.taxPercent)}%)`,
        value: formatIDR(
          Math.max(0, toNum(inv.total) - (toNum(inv.subtotal) - toNum(inv.discount))),
        ),
      });
    totals.push({ label: "Total", value: formatIDR(inv.total), strong: true });
    if (paid > 0) {
      totals.push({ label: "Sudah dibayar", value: formatIDR(paid) });
      totals.push({
        label: "Sisa tagihan",
        value: formatIDR(toNum(inv.total) - paid),
        strong: true,
      });
    }
    return {
      profile,
      doc: {
        docLabel: "Invoice",
        number: inv.number,
        status: documentStatus(inv.status, invoiceStatus),
        meta: [
          { label: "Tanggal", value: formatDate(inv.issueDate) },
          { label: "Jatuh tempo", value: formatDate(inv.dueDate) },
          { label: "Proyek", value: project?.name ?? "—" },
        ],
        recipient: clientBlock(client),
        sections: items.reduce<DocSection[]>((sections, item) => {
          const name = item.sectionName ?? "Item";
          const section = sections.find((entry) => entry.name === name);
          if (section) section.items.push(item);
          else sections.push({ name, items: [item] });
          return sections;
        }, []),
        totals,
        amountInWords: terbilangRupiah(inv.total ?? "0"),
        notes: inv.notes,
        bank: bankOf(bank ?? (await primaryBank())),
        signedLabel: "Hormat kami",
      },
    };
  }

  // receipt
  const [rc] = await db.select().from(receipts).where(eq(receipts.id, id));
  if (!rc) return null;
  const [pay] = await db.select().from(payments).where(eq(payments.id, rc.paymentId));
  const [inv] = pay
    ? await db.select().from(invoices).where(eq(invoices.id, pay.invoiceId))
    : [];
  const [client] = inv
    ? await db.select().from(clients).where(eq(clients.id, inv.clientId))
    : [];
  return {
    profile,
      doc: {
        docLabel: "Kuitansi",
        number: rc.number,
        status: documentStatus(rc.status, receiptStatus),
        meta: [
          { label: "Tanggal", value: formatDate(pay?.paidAt) },
        { label: "Invoice", value: inv?.number ?? "—" },
        {
          label: "Metode",
          value: pay ? (paymentMethodLabels[pay.method] ?? pay.method) : "—",
        },
      ],
      recipient: clientBlock(client),
      sections: [
        {
          name: "",
          items: [
            {
              name: `Pembayaran invoice ${inv?.number ?? ""}`.trim(),
              description: pay?.reference ? `Ref: ${pay.reference}` : null,
              quantity: 1,
              unitPrice: rc.amount,
              subtotal: rc.amount,
            },
          ],
        },
      ],
      totals: [
        { label: "Jumlah diterima", value: formatIDR(rc.amount), strong: true },
      ],
      amountInWords: rc.amountInWords,
      notes: pay?.notes ?? null,
      bank: null,
      signedLabel: "Diterima oleh",
    },
  };
}

function totalsRows(
  t: ReturnType<typeof computeRabTotals>,
  discount: string | null,
  taxPercent: string | null,
  additionalCost: string | null,
  profitPercent: string | null,
): DocTotal[] {
  const rows: DocTotal[] = [
    { label: "Biaya Operasional", value: formatIDR(t.subtotal) },
  ];
  if (toNum(discount) > 0)
    rows.push({ label: "Diskon", value: `−${formatIDR(discount)}` });
  if (toNum(profitPercent) > 0)
    rows.push({
      label: `Keuntungan (${Number(profitPercent)}%)`,
      value: `+${formatIDR(t.profit)}`,
    });
  if (toNum(taxPercent) > 0)
    rows.push({ label: `Pajak (${Number(taxPercent)}%)`, value: formatIDR(t.tax) });
  if (toNum(additionalCost) > 0)
    rows.push({ label: "Biaya tambahan", value: formatIDR(additionalCost) });
  rows.push({ label: "Harga Jual", value: formatIDR(t.grandTotal), strong: true });
  return rows;
}
