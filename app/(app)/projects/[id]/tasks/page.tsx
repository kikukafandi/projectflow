import { asc, eq } from "drizzle-orm";
import { AlertTriangle, ArrowLeft, ListChecks, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, taskChecklists, tasks } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskMoveSelect } from "@/components/task-move-select";
import { priorityLabels, taskBoardColumns, taskStatus } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { generateTasksFromScope, moveTask } from "./actions";

export const dynamic = "force-dynamic";

export default async function TaskBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ wip?: string }>;
}) {
  const { id } = await params;
  const { wip } = await searchParams;
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const [rows, checks] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .orderBy(asc(tasks.position), asc(tasks.createdAt)),
    db.select().from(taskChecklists),
  ]);

  const checkOf = (taskId: string) => {
    const cs = checks.filter((c) => c.taskId === taskId);
    return { total: cs.length, done: cs.filter((c) => c.done).length };
  };
  const colTasks = (status: string) => rows.filter((t) => t.status === status);

  return (
    <>
      <Link
        href={`/projects/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> {project.name}
      </Link>
      <PageHeader
        title="Task Board"
        description="Kelola pekerjaan. Batasi task In Progress agar tetap fokus."
        actions={
          <div className="flex gap-2">
            <form action={generateTasksFromScope.bind(null, id)}>
              <Button type="submit" variant="secondary">
                Generate dari Scope
              </Button>
            </form>
            <Button asChild>
              <Link href={`/projects/${id}/tasks/new`}>
                <Plus /> Task
              </Link>
            </Button>
          </div>
        }
      />

      {wip && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-warning-soft px-3 py-2 text-[13px] text-[#a9760f]">
          <AlertTriangle className="size-4 shrink-0" />
          WIP limit tercapai (maks {wip} task In Progress). Selesaikan task aktif
          dulu, atau paksa mulai dari halaman task.
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Belum ada task"
          description="Generate task dari scope proyek, atau buat manual."
          action={
            <form action={generateTasksFromScope.bind(null, id)}>
              <Button type="submit">Generate dari Scope</Button>
            </form>
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {taskBoardColumns.map((col) => {
            const ct = colTasks(col);
            return (
              <div key={col} className="w-[300px] shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-ink">
                    {taskStatus[col].label}
                  </span>
                  <span className="text-[13px] text-ink-muted">{ct.length}</span>
                </div>
                <div className="space-y-2 rounded-[16px] bg-surface-muted/60 p-2">
                  {ct.length === 0 ? (
                    <p className="px-2 py-6 text-center text-[12px] text-ink-muted">
                      Kosong
                    </p>
                  ) : (
                    ct.map((t) => {
                      const c = checkOf(t.id);
                      return (
                        <div
                          key={t.id}
                          className="rounded-[12px] border border-[#ECECE8] bg-surface p-3 shadow-[0_1px_2px_rgba(24,24,27,0.04)]"
                        >
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Badge tone={priorityLabels[t.priority].tone}>
                              {priorityLabels[t.priority].label}
                            </Badge>
                            {t.priorityScore !== 0 && (
                              <span className="text-[11px] text-ink-muted">
                                skor {t.priorityScore}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/projects/${id}/tasks/${t.id}`}
                            className="line-clamp-2 text-sm font-medium text-ink hover:text-primary"
                          >
                            {t.title}
                          </Link>
                          <div className="mt-2 flex items-center gap-3 text-[12px] text-ink-muted">
                            {t.deadline && <span>{formatDate(t.deadline)}</span>}
                            {c.total > 0 && (
                              <span>
                                {c.done}/{c.total} checklist
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <TaskMoveSelect
                              current={t.status}
                              action={moveTask.bind(null, id, t.id)}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
