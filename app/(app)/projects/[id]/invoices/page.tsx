import { desc, eq } from "drizzle-orm";
import { ArrowLeft, Plus, Receipt } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { clients, invoices } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { invoiceStatus } from "@/lib/labels";
import { toNum } from "@/lib/money";
import { formatDate, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectInvoicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await db
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
    .where(eq(invoices.projectId, id))
    .orderBy(desc(invoices.createdAt));

  return (
    <>
      <Link
        href={`/projects/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Proyek
      </Link>
      <PageHeader
        title="Invoices"
        description="Invoice yang terkait proyek ini."
        actions={
          <Button asChild>
            <Link href="/invoices/new">
              <Plus /> Invoice
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Belum ada invoice"
          description="Invoice untuk proyek ini akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((i) => (
            <Link key={i.id} href={`/invoices/${i.id}`}>
              <Card className="transition-shadow hover:shadow-[0_4px_14px_rgba(24,24,27,0.06)]">
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{i.number}</span>
                      <StatusBadge map={invoiceStatus} value={i.status} />
                    </div>
                    <div className="text-[13px] text-ink-muted">
                      {i.clientName ?? "—"} · Jatuh tempo {formatDate(i.dueDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-lg font-semibold text-primary">
                      {formatIDR(i.total)}
                    </div>
                    <div className="text-[12px] text-ink-muted">
                      Sisa {formatIDR(toNum(i.total) - toNum(i.paidAmount))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
