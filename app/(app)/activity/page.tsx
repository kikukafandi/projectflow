import { desc } from "drizzle-orm";
import { History } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { activityLabel, entityHref } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const offset = (current - 1) * PAGE_SIZE;

  // Fetch one extra row to know whether a next page exists (PRD §30.3 pagination).
  const rows = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset(offset);
  const hasNext = rows.length > PAGE_SIZE;
  const visible = rows.slice(0, PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="Riwayat perubahan data di seluruh aplikasi."
      />
      {visible.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum ada aktivitas"
          description="Setiap perubahan data akan tercatat di sini."
        />
      ) : (
        <>
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
              {visible.map((a) => {
                const href = entityHref(a.entityType, a.entityId);
                return (
                  <TR key={a.id}>
                    <TD className="whitespace-nowrap text-ink-secondary">
                      {formatDate(a.createdAt)}
                    </TD>
                    <TD>{activityLabel(a.action)}</TD>
                    <TD className="text-ink-secondary">
                      {href ? (
                        <Link href={href} className="hover:text-primary">
                          {a.entityType}
                        </Link>
                      ) : (
                        (a.entityType ?? "—")
                      )}
                    </TD>
                    <TD className="text-ink-secondary">{a.note ?? "—"}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            {current > 1 ? (
              <Button asChild variant="secondary">
                <Link href={`/activity?page=${current - 1}`}>Sebelumnya</Link>
              </Button>
            ) : (
              <span />
            )}
            <span className="text-[13px] text-ink-muted">Halaman {current}</span>
            {hasNext ? (
              <Button asChild variant="secondary">
                <Link href={`/activity?page=${current + 1}`}>Berikutnya</Link>
              </Button>
            ) : (
              <span />
            )}
          </div>
        </>
      )}
    </>
  );
}
