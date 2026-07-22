import { asc, eq } from "drizzle-orm";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { taskChecklists, tasks } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PriorityFactorsForm } from "@/components/forms/priority-factors-form";
import { priorityLabels, taskStatus } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import {
  addChecklist,
  deleteChecklist,
  deleteTask,
  markTaskDone,
  moveTask,
  setPriorityFactors,
  toggleChecklist,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; taskId: string }>;
  searchParams: Promise<{ dod?: string }>;
}) {
  const { id, taskId } = await params;
  const { dod } = await searchParams;
  const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!t) notFound();

  const checklist = await db
    .select()
    .from(taskChecklists)
    .where(eq(taskChecklists.taskId, taskId))
    .orderBy(asc(taskChecklists.position), asc(taskChecklists.createdAt));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/projects/${id}/tasks`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Task Board
      </Link>
      <PageHeader
        title={t.title}
        actions={
          <>
            {t.status !== "done" && (
              <form action={markTaskDone.bind(null, id, taskId)}>
                <Button type="submit">
                  <CheckCircle2 /> Selesai
                </Button>
              </form>
            )}
            <Button asChild variant="secondary">
              <Link href={`/projects/${id}/tasks/${taskId}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            <form action={deleteTask.bind(null, id, taskId)}>
              <Button type="submit" variant="ghost" className="text-danger hover:bg-danger-soft">
                <Trash2 />
              </Button>
            </form>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge map={taskStatus} value={t.status} />
        <Badge tone={priorityLabels[t.priority].tone}>
          {priorityLabels[t.priority].label} · skor {t.priorityScore}
        </Badge>
        {t.deadline && (
          <span className="text-[13px] text-ink-muted">
            Deadline {formatDate(t.deadline)}
          </span>
        )}
      </div>

      {dod && (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-warning-soft px-3 py-2 text-[13px] text-[#a9760f]">
          <AlertTriangle className="size-4 shrink-0" />
          Checklist wajib belum selesai. Selesaikan dulu sebelum menandai Done.
        </div>
      )}

      {/* Force start when blocked by WIP */}
      {t.status !== "in_progress" && t.status !== "done" && (
        <form action={moveTask.bind(null, id, taskId)} className="mb-4 flex items-end gap-2">
          <input type="hidden" name="status" value="in_progress" />
          <div className="flex-1">
            <label className="mb-1 block text-[12px] text-ink-muted">
              Paksa mulai (override WIP) — alasan
            </label>
            <Input name="override" placeholder="Alasan override…" />
          </div>
          <Button type="submit" variant="secondary">
            <Play className="size-4" /> Mulai
          </Button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Checklist */}
        <Card>
          <CardContent>
            <CardTitle className="mb-3">Checklist</CardTitle>
            {checklist.length === 0 ? (
              <p className="text-[13px] text-ink-muted">Belum ada checklist.</p>
            ) : (
              <ul className="space-y-1.5">
                {checklist.map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <form action={toggleChecklist.bind(null, id, taskId, c.id, !c.done)}>
                      <button
                        type="submit"
                        aria-label={c.done ? "Batalkan" : "Selesaikan"}
                        className={
                          "flex size-5 items-center justify-center rounded-[6px] border " +
                          (c.done
                            ? "border-primary bg-primary text-white"
                            : "border-line-strong")
                        }
                      >
                        {c.done && <Check className="size-3.5" />}
                      </button>
                    </form>
                    <span className={"flex-1 text-sm " + (c.done ? "text-ink-muted line-through" : "text-ink")}>
                      {c.label}
                      {c.required && <span className="ml-1 text-[11px] text-danger">wajib</span>}
                    </span>
                    <form action={deleteChecklist.bind(null, id, taskId, c.id)}>
                      <button type="submit" aria-label="Hapus" className="text-ink-muted hover:text-danger">
                        <Trash2 className="size-3.5" />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
            <form action={addChecklist.bind(null, id, taskId)} className="mt-3 space-y-2">
              <Input name="label" placeholder="Item checklist…" className="h-9" />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[13px] text-ink-secondary">
                  <input type="checkbox" name="required" className="size-4 accent-[#FF7A1A]" />
                  Wajib
                </label>
                <Button type="submit" size="sm" variant="secondary">
                  Tambah
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Priority factors */}
        <Card>
          <CardContent>
            <CardTitle className="mb-3">Priority Score</CardTitle>
            <PriorityFactorsForm action={setPriorityFactors.bind(null, id, taskId)} />
          </CardContent>
        </Card>
      </div>

      {(t.description || t.definitionOfDone) && (
        <Card className="mt-4">
          <CardContent className="space-y-3">
            {t.description && (
              <div>
                <CardTitle className="mb-1">Deskripsi</CardTitle>
                <p className="whitespace-pre-wrap text-sm text-ink-secondary">{t.description}</p>
              </div>
            )}
            {t.definitionOfDone && (
              <div>
                <CardTitle className="mb-1">Definition of Done</CardTitle>
                <p className="whitespace-pre-wrap text-sm text-ink-secondary">{t.definitionOfDone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
