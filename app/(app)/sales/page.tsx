import { desc, eq } from "drizzle-orm";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { clients, projects, quotations, rabs } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { quotationStatus, rabStatus } from "@/lib/labels";
import { formatDate, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [rabRows, quotationRows] = await Promise.all([
    db
      .select({
        id: rabs.id,
        number: rabs.number,
        title: rabs.title,
        status: rabs.status,
        grandTotal: rabs.grandTotal,
        createdAt: rabs.createdAt,
        projectId: rabs.projectId,
        projectName: projects.name,
        clientName: clients.name,
      })
      .from(rabs)
      .leftJoin(projects, eq(rabs.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(desc(rabs.createdAt)),
    db
      .select({
        id: quotations.id,
        number: quotations.number,
        status: quotations.status,
        grandTotal: quotations.grandTotal,
        validUntil: quotations.validUntil,
        createdAt: quotations.createdAt,
        projectId: quotations.projectId,
        projectName: projects.name,
        clientName: clients.name,
      })
      .from(quotations)
      .leftJoin(projects, eq(quotations.projectId, projects.id))
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(desc(quotations.createdAt)),
  ]);

  return (
    <>
      <PageHeader
        title="RAB & Quotations"
        description="Seluruh dokumen anggaran dan penawaran lintas proyek. Dibuat dari halaman proyek."
      />

      {rabRows.length === 0 && quotationRows.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="Belum ada RAB atau quotation"
          description="Buka sebuah proyek, isi scope, lalu generate RAB dan quotation dari sana."
        />
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-muted">
              RAB ({rabRows.length})
            </h2>
            {rabRows.length === 0 ? (
              <p className="text-[13px] text-ink-muted">Belum ada RAB.</p>
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Nomor</TH>
                    <TH>Proyek</TH>
                    <TH>Klien</TH>
                    <TH>Tanggal</TH>
                    <TH className="text-right">Grand Total</TH>
                    <TH>Status</TH>
                  </tr>
                </THead>
                <tbody>
                  {rabRows.map((r) => (
                    <TR key={r.id}>
                      <TD>
                        <Link
                          href={`/projects/${r.projectId}/rab/${r.id}`}
                          className="text-ink hover:text-primary"
                        >
                          {r.number}
                        </Link>
                      </TD>
                      <TD className="text-ink-secondary">{r.projectName ?? "—"}</TD>
                      <TD className="text-ink-secondary">{r.clientName ?? "—"}</TD>
                      <TD className="text-ink-secondary">{formatDate(r.createdAt)}</TD>
                      <TD className="tabular text-right">{formatIDR(r.grandTotal)}</TD>
                      <TD>
                        <StatusBadge map={rabStatus} value={r.status} />
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </section>

          <section>
            <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-muted">
              Quotation ({quotationRows.length})
            </h2>
            {quotationRows.length === 0 ? (
              <p className="text-[13px] text-ink-muted">Belum ada quotation.</p>
            ) : (
              <Table>
                <THead>
                  <tr>
                    <TH>Nomor</TH>
                    <TH>Proyek</TH>
                    <TH>Klien</TH>
                    <TH>Berlaku s/d</TH>
                    <TH className="text-right">Grand Total</TH>
                    <TH>Status</TH>
                  </tr>
                </THead>
                <tbody>
                  {quotationRows.map((q) => (
                    <TR key={q.id}>
                      <TD>
                        <Link
                          href={`/projects/${q.projectId}/quotations/${q.id}`}
                          className="text-ink hover:text-primary"
                        >
                          {q.number}
                        </Link>
                      </TD>
                      <TD className="text-ink-secondary">{q.projectName ?? "—"}</TD>
                      <TD className="text-ink-secondary">{q.clientName ?? "—"}</TD>
                      <TD className="text-ink-secondary">{formatDate(q.validUntil)}</TD>
                      <TD className="tabular text-right">{formatIDR(q.grandTotal)}</TD>
                      <TD>
                        <StatusBadge map={quotationStatus} value={q.status} />
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </section>
        </div>
      )}
    </>
  );
}
