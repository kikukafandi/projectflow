import { and, desc, eq, inArray, notInArray } from "drizzle-orm";
import { AlertTriangle, Check, Plus, Target, X } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { dailyFocusItems, projects, tasks } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { priorityLabels, taskStatus } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { addFocus, removeFocus, toggleFocusDone } from "./actions";

export const dynamic = "force-dynamic";

export default async function FocusPage({
  searchParams,
}: {
  searchParams: Promise<{ full?: string }>;
}) {
  const { full } = await searchParams;
  const date = new Date().toISOString().slice(0, 10);

  const focusRows = await db
    .select({
      id: dailyFocusItems.id,
      done: dailyFocusItems.done,
      taskId: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      deadline: tasks.deadline,
      projectId: projects.id,
      projectName: projects.name,
    })
    .from(dailyFocusItems)
    .innerJoin(tasks, eq(dailyFocusItems.taskId, tasks.id))
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(dailyFocusItems.focusDate, date));

  const focusedTaskIds = focusRows.map((f) => f.taskId);

  const candidates = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      priorityScore: tasks.priorityScore,
      deadline: tasks.deadline,
      projectName: projects.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        inArray(tasks.status, ["backlog", "ready", "in_progress", "review", "testing"]),
        focusedTaskIds.length
          ? notInArray(tasks.id, focusedTaskIds)
          : undefined,
      ),
    )
    .orderBy(desc(tasks.priorityScore))
    .limit(12);

  return (
    <>
      <PageHeader
        title="Daily Focus"
        description="Pilih maksimal tiga task untuk diselesaikan hari ini."
      />

      {full && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-warning-soft px-3 py-2 text-[13px] text-[#a9760f]">
          <AlertTriangle className="size-4 shrink-0" />
          Fokus hari ini sudah penuh (maks {full}). Selesaikan atau hapus salah
          satu dulu.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-[17px] font-semibold text-ink">
            Fokus Hari Ini
          </h2>
          {focusRows.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Belum ada fokus hari ini"
              description="Pilih maksimal tiga task yang ingin diselesaikan."
            />
          ) : (
            <div className="space-y-2">
              {focusRows.map((f) => (
                <Card key={f.id}>
                  <CardContent className="flex items-center gap-3">
                    <form action={toggleFocusDone.bind(null, f.id, !f.done)}>
                      <button
                        type="submit"
                        aria-label={f.done ? "Batalkan" : "Selesai"}
                        className={
                          "flex size-6 items-center justify-center rounded-[8px] border " +
                          (f.done
                            ? "border-primary bg-primary text-white"
                            : "border-line-strong")
                        }
                      >
                        {f.done && <Check className="size-4" />}
                      </button>
                    </form>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/projects/${f.projectId}/tasks/${f.taskId}`}
                        className={
                          "block truncate text-sm font-medium hover:text-primary " +
                          (f.done ? "text-ink-muted line-through" : "text-ink")
                        }
                      >
                        {f.title}
                      </Link>
                      <div className="truncate text-[12px] text-ink-muted">
                        {f.projectName} · {formatDate(f.deadline)}
                      </div>
                    </div>
                    <Badge tone={priorityLabels[f.priority].tone}>
                      {priorityLabels[f.priority].label}
                    </Badge>
                    <form action={removeFocus.bind(null, f.id)}>
                      <button type="submit" aria-label="Hapus dari fokus" className="text-ink-muted hover:text-danger">
                        <X className="size-4" />
                      </button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-[17px] font-semibold text-ink">
            Rekomendasi
          </h2>
          {candidates.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Tidak ada task tersedia. Buat task di proyek dulu.
            </p>
          ) : (
            <div className="space-y-2">
              {candidates.map((c) => (
                <Card key={c.id}>
                  <CardContent className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">
                        {c.title}
                      </div>
                      <div className="flex items-center gap-2 truncate text-[12px] text-ink-muted">
                        <StatusBadge map={taskStatus} value={c.status} />
                        {c.projectName} · skor {c.priorityScore}
                      </div>
                    </div>
                    <form action={addFocus}>
                      <input type="hidden" name="taskId" value={c.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        <Plus className="size-4" /> Fokus
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
