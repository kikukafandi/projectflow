import { desc, eq } from "drizzle-orm";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { clients, invoices, payments } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { paymentMethodLabels } from "@/lib/labels";
import { toNum } from "@/lib/money";
import { formatDate, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const rows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      paidAt: payments.paidAt,
      method: payments.method,
      status: payments.status,
      invoiceId: invoices.id,
      invoiceNumber: invoices.number,
      clientName: clients.name,
    })
    .from(payments)
    .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(payments.paidAt));

  return (
    <>
      <PageHeader
        title="Payments"
        description="Riwayat seluruh pembayaran yang tercatat."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Belum ada pembayaran"
          description="Pembayaran dicatat dari halaman invoice."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>Tanggal</TH>
                <TH>Invoice</TH>
                <TH>Klien</TH>
                <TH>Metode</TH>
                <TH className="text-right">Nominal</TH>
                <TH>Status</TH>
              </tr>
            </THead>
            <tbody>
              {rows.map((p) => (
                <TR key={p.id}>
                  <TD className="text-ink-secondary">{formatDate(p.paidAt)}</TD>
                  <TD>
                    {p.invoiceId ? (
                      <Link href={`/invoices/${p.invoiceId}`} className="text-ink hover:text-primary">
                        {p.invoiceNumber}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD className="text-ink-secondary">{p.clientName ?? "—"}</TD>
                  <TD className="text-ink-secondary">{paymentMethodLabels[p.method]}</TD>
                  <TD className="tabular text-right">{formatIDR(p.amount)}</TD>
                  <TD>
                    <Badge tone={p.status === "confirmed" ? "green" : "red"}>
                      {p.status === "confirmed" ? "Confirmed" : "Cancelled"}
                    </Badge>
                  </TD>
                </TR>
              ))}
              <TR className="bg-surface-soft font-semibold">
                <TD colSpan={4}>Subtotal</TD>
                <TD className="tabular text-right">
                  {formatIDR(rows.reduce((sum, p) => sum + toNum(p.amount), 0))}
                </TD>
                <TD />
              </TR>
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
}
