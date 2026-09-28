import { desc, eq } from "drizzle-orm";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { clients, invoices, projects, quotations } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { invoiceStatus } from "@/lib/labels";
import { toNum } from "@/lib/money";
import { formatDate, formatIDR } from "@/lib/utils";
import { createInvoiceFromQuotation } from "./actions";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const [rows, approvedQuotations] = await Promise.all([
    db
      .select({
        id: invoices.id,
        number: invoices.number,
        status: invoices.status,
        total: invoices.total,
        paidAmount: invoices.paidAmount,
        dueDate: invoices.dueDate,
        clientName: clients.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.createdAt)),
    db
      .select({ id: quotations.id, number: quotations.number, projectName: projects.name })
      .from(quotations)
      .leftJoin(projects, eq(quotations.projectId, projects.id))
      .where(eq(quotations.status, "approved"))
      .orderBy(desc(quotations.createdAt)),
  ]);

  const createControls = (
    <div className="flex flex-wrap items-center gap-2">
      {approvedQuotations.length > 0 && (
        <form action={createInvoiceFromQuotation} className="flex items-center gap-2">
          <Select name="quotationId" className="h-[42px] w-auto">
            {approvedQuotations.map((q) => (
              <option key={q.id} value={q.id}>
                {q.number} — {q.projectName}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Dari Quotation
          </Button>
        </form>
      )}
      <Button asChild>
        <Link href="/invoices/new">
          <Plus /> Invoice Manual
        </Link>
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Tagihan ke klien. Dibuat dari quotation yang disetujui atau manual."
        actions={createControls}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada invoice"
          description="Invoice dapat dibuat dari quotation atau termin pembayaran."
          action={createControls}
        />
      ) : (
        <>
          <div className="mb-3 flex justify-end gap-2 text-sm">
            <span className="text-ink-muted">Subtotal</span>
            <span className="tabular font-semibold text-ink">
              {formatIDR(rows.reduce((sum, i) => sum + toNum(i.total), 0))}
            </span>
          </div>
          <div className="hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH>Nomor</TH>
                  <TH>Klien</TH>
                  <TH>Jatuh Tempo</TH>
                  <TH className="text-right">Total</TH>
                  <TH className="text-right">Sisa</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <tbody>
                {rows.map((i) => (
                  <TR key={i.id}>
                    <TD>
                      <Link href={`/invoices/${i.id}`} className="font-medium text-ink hover:text-primary">
                        {i.number}
                      </Link>
                    </TD>
                    <TD className="text-ink-secondary">{i.clientName ?? "—"}</TD>
                    <TD className="text-ink-secondary">{formatDate(i.dueDate)}</TD>
                    <TD className="tabular text-right">{formatIDR(i.total)}</TD>
                    <TD className="tabular text-right">
                      {formatIDR(toNum(i.total) - toNum(i.paidAmount))}
                    </TD>
                    <TD>
                      <StatusBadge map={invoiceStatus} value={i.status} />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="space-y-3 md:hidden">
            {rows.map((i) => (
              <Link
                key={i.id}
                href={`/invoices/${i.id}`}
                className="block rounded-[16px] border border-[#ECECE8] bg-surface p-4 shadow-[0_2px_8px_rgba(24,24,27,0.04)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{i.number}</span>
                  <StatusBadge map={invoiceStatus} value={i.status} />
                </div>
                <div className="mt-1 text-[13px] text-ink-muted">{i.clientName}</div>
                <div className="mt-1 tabular text-sm text-ink">{formatIDR(i.total)}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
