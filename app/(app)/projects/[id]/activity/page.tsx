import { desc, eq, inArray } from "drizzle-orm";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { activityLogs, invoices, quotations, rabs } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { activityLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Aktivitas proyek = log proyek itu + log dokumen turunannya (RAB, quotation, invoice).
  const [rabRows, qRows, invRows] = await Promise.all([
    db.select({ id: rabs.id }).from(rabs).where(eq(rabs.projectId, id)),
    db.select({ id: quotations.id }).from(quotations).where(eq(quotations.projectId, id)),
    db.select({ id: invoices.id }).from(invoices).where(eq(invoices.projectId, id)),
  ]);
  const ids = [
    id,
    ...rabRows.map((r) => r.id),
    ...qRows.map((r) => r.id),
    ...invRows.map((r) => r.id),
  ];
  const logs = await db
    .select()
    .from(activityLogs)
    .where(inArray(activityLogs.entityId, ids))
    .orderBy(desc(activityLogs.createdAt))
    .limit(100);

  return (
    <>
      <Link
        href={`/projects/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Proyek
      </Link>
      <PageHeader title="Activity" description="Riwayat aktivitas proyek ini." />

      {logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Belum ada aktivitas"
          description="Perubahan pada proyek, RAB, quotation, dan invoice akan tercatat di sini."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <tr>
                  <TH>Waktu</TH>
                  <TH>Aktivitas</TH>
                  <TH>Objek</TH>
                  <TH>Catatan</TH>
                </tr>
              </THead>
              <tbody>
                {logs.map((a) => (
                  <TR key={a.id}>
                    <TD className="whitespace-nowrap text-ink-secondary">
                      {formatDate(a.createdAt)}
                    </TD>
                    <TD>{activityLabel(a.action)}</TD>
                    <TD className="text-ink-secondary">{a.entityType ?? "—"}</TD>
                    <TD className="text-ink-secondary">{a.note ?? "—"}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
