import { asc, eq } from "drizzle-orm";
import { AlertTriangle, ArrowLeft, ListChecks, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, taskChecklists, tasks } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TaskBoard } from "@/components/task-board";
import { TaskTimeline } from "@/components/task-timeline";
import { taskBoardColumns } from "@/lib/labels";
import {
  generateTasksFromScope,
  moveTask,
  moveTaskBoard,
  quickCreateTask,
  renameTask,
  setTaskDates,
} from "./actions";

export const dynamic = "force-dynamic";

const views = [
  { key: "board", label: "Board" },
  { key: "timeline", label: "Timeline" },
] as const;

export default async function TaskBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ wip?: string; view?: string }>;
}) {
  const { id } = await params;
  const { wip, view: viewParam } = await searchParams;
  const view = views.find((v) => v.key === viewParam)?.key ?? "board";

  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const [rows, checks] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, id))
      .orderBy(asc(tasks.position), asc(tasks.createdAt)),
    db
      .select({ taskId: taskChecklists.taskId, done: taskChecklists.done })
      .from(taskChecklists)
      .innerJoin(tasks, eq(tasks.id, taskChecklists.taskId))
      .where(eq(tasks.projectId, id)),
  ]);

  const boardTasks = rows.map((t) => {
    const cs = checks.filter((c) => c.taskId === t.id);
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      priorityScore: t.priorityScore,
      deadline: t.deadline,
      checkTotal: cs.length,
      checkDone: cs.filter((c) => c.done).length,
    };
  });

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

      <div className="mb-4 flex flex-wrap gap-2">
        {views.map((v) => (
          <Link
            key={v.key}
            href={`/projects/${id}/tasks?view=${v.key}`}
            className={
              "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors " +
              (view === v.key
                ? "bg-primary text-white"
                : "bg-surface text-ink-secondary hover:bg-surface-muted")
            }
          >
            {v.label}
          </Link>
        ))}
      </div>

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
      ) : view === "timeline" ? (
        <TaskTimeline
          projectId={id}
          projectDeadline={project.deadline}
          tasks={rows.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            startDate: t.startDate,
            deadline: t.deadline,
          }))}
          setDates={setTaskDates.bind(null, id)}
        />
      ) : (
        <TaskBoard
          projectId={id}
          columns={taskBoardColumns}
          tasks={boardTasks}
          move={moveTaskBoard.bind(null, id)}
          quickAdd={quickCreateTask.bind(null, id)}
          rename={renameTask.bind(null, id)}
          moveAction={moveTask.bind(null, id)}
        />
      )}
    </>
  );
}
