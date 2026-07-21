import { desc, eq } from "drizzle-orm";
import { ArrowLeft, FileSpreadsheet, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, rabs } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rabStatus } from "@/lib/labels";
import { formatDate, formatIDR } from "@/lib/utils";
import { generateRabFromScope } from "./actions";

export const dynamic = "force-dynamic";

export default async function RabListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const rows = await db
    .select()
    .from(rabs)
    .where(eq(rabs.projectId, id))
    .orderBy(desc(rabs.createdAt));

  const generate = generateRabFromScope.bind(null, id);

  return (
    <>
      <Link
        href={`/projects/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> {project.name}
      </Link>
      <PageHeader
        title="RAB"
        description="Rincian anggaran biaya dari scope proyek. Semua total dihitung di server."
        actions={
          <form action={generate}>
            <Button type="submit">
              <Plus /> Generate dari Scope
            </Button>
          </form>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="Belum ada RAB"
          description="Buat RAB dari scope proyek. Pastikan scope sudah terisi."
          action={
            <div className="flex gap-2">
              <form action={generate}>
                <Button type="submit">
                  <Plus /> Generate dari Scope
                </Button>
              </form>
              <Button asChild variant="secondary">
                <Link href={`/projects/${id}/scope`}>Buka Scope</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Link key={r.id} href={`/projects/${id}/rab/${r.id}`}>
              <Card className="transition-shadow hover:shadow-[0_4px_14px_rgba(24,24,27,0.06)]">
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{r.number}</span>
                      <StatusBadge map={rabStatus} value={r.status} />
                    </div>
                    <div className="text-[13px] text-ink-muted">
                      {r.title ?? "—"} · {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <span className="tabular text-lg font-semibold text-primary">
                    {formatIDR(r.grandTotal)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
