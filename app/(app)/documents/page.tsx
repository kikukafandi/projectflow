import { desc, eq } from "drizzle-orm";
import { Printer, Receipt } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import {
  clients,
  invoices,
  payments,
  projects,
  quotations,
  rabs,
  receipts,
} from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import type { DocType } from "@/lib/documents";
import type { Tone } from "@/lib/labels";
import { formatDate, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DOC_META: Record<DocType, { label: string; tone: Tone }> = {
  rab: { label: "RAB", tone: "gray" },
  quotation: { label: "Quotation", tone: "blue" },
  invoice: { label: "Invoice", tone: "orange" },
  receipt: { label: "Kuitansi", tone: "green" },
};

type Row = {
  id: string;
  docType: DocType;
  number: string;
  date: Date | string | null;
  context: string;
  amount: string | null;
  /** Editor page for the document, if it has one (kuitansi does not). */
  editHref: string | null;
};

/** Archive of every printable document (PRD §27.2), newest first. */
export default async function DocumentsPage() {
  const [rabRows, quotationRows, invoiceRows, receiptRows] = await Promise.all([
    db
      .select({
        id: rabs.id,
        number: rabs.number,
        createdAt: rabs.createdAt,
        grandTotal: rabs.grandTotal,
        projectId: rabs.projectId,
        projectName: projects.name,
      })
      .from(rabs)
      .leftJoin(projects, eq(rabs.projectId, projects.id))
      .orderBy(desc(rabs.createdAt)),
    db
      .select({
        id: quotations.id,
        number: quotations.number,
        createdAt: quotations.createdAt,
        grandTotal: quotations.grandTotal,
        projectId: quotations.projectId,
        projectName: projects.name,
      })
      .from(quotations)
      .leftJoin(projects, eq(quotations.projectId, projects.id))
      .orderBy(desc(quotations.createdAt)),
    db
      .select({
        id: invoices.id,
        number: invoices.number,
        issueDate: invoices.issueDate,
        createdAt: invoices.createdAt,
        total: invoices.total,
        clientName: clients.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.createdAt)),
    db
      .select({
        id: receipts.id,
        number: receipts.number,
        createdAt: receipts.createdAt,
        amount: receipts.amount,
        status: receipts.status,
        invoiceId: invoices.id,
        invoiceNumber: invoices.number,
        clientName: clients.name,
      })
      .from(receipts)
      .leftJoin(payments, eq(receipts.paymentId, payments.id))
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(receipts.createdAt)),
  ]);

  const rows: Row[] = [
    ...rabRows.map((r) => ({
      id: r.id,
      docType: "rab" as const,
      number: r.number,
      date: r.createdAt,
      context: r.projectName ?? "—",
      amount: r.grandTotal,
      editHref: `/projects/${r.projectId}/rab/${r.id}`,
    })),
    ...quotationRows.map((q) => ({
      id: q.id,
      docType: "quotation" as const,
      number: q.number,
      date: q.createdAt,
      context: q.projectName ?? "—",
      amount: q.grandTotal,
      editHref: `/projects/${q.projectId}/quotations/${q.id}`,
    })),
    ...invoiceRows.map((i) => ({
      id: i.id,
      docType: "invoice" as const,
      number: i.number,
      date: i.issueDate ?? i.createdAt,
      context: i.clientName ?? "—",
      amount: i.total,
      editHref: `/invoices/${i.id}`,
    })),
    ...receiptRows.map((rc) => ({
      id: rc.id,
      docType: "receipt" as const,
      number: rc.number,
      date: rc.createdAt,
      context: [rc.clientName, rc.invoiceNumber].filter(Boolean).join(" · ") || "—",
      amount: rc.amount,
      editHref: rc.invoiceId ? `/invoices/${rc.invoiceId}` : null,
    })),
  ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

  return (
    <>
      <PageHeader
        title="Documents"
        description="Semua dokumen yang bisa dicetak: RAB, quotation, invoice, dan kuitansi."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Belum ada dokumen"
          description="Dokumen muncul di sini setelah RAB, quotation, invoice, atau kuitansi dibuat."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Jenis</TH>
              <TH>Nomor</TH>
              <TH>Terkait</TH>
              <TH>Tanggal</TH>
              <TH className="text-right">Nilai</TH>
              <TH className="text-right">Aksi</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((d) => (
              <TR key={`${d.docType}-${d.id}`}>
                <TD>
                  <Badge tone={DOC_META[d.docType].tone}>
                    {DOC_META[d.docType].label}
                  </Badge>
                </TD>
                <TD>
                  {d.editHref ? (
                    <Link href={d.editHref} className="text-ink hover:text-primary">
                      {d.number}
                    </Link>
                  ) : (
                    d.number
                  )}
                </TD>
                <TD className="text-ink-secondary">{d.context}</TD>
                <TD className="text-ink-secondary">{formatDate(d.date)}</TD>
                <TD className="tabular text-right">{formatIDR(d.amount)}</TD>
                <TD className="text-right">
                  <Link
                    href={`/print/${d.docType}/${d.id}?back=/documents`}
                    className="inline-flex items-center gap-1 text-[13px] text-primary hover:underline"
                  >
                    <Printer className="size-3.5" /> Cetak
                  </Link>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
