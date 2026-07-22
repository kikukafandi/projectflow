import { and, desc, eq, ne } from "drizzle-orm";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { priorityLabels, taskStatus } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Cross-project task list, ordered by priority score (PRD §21.5). */
export default async function AllTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const filters = [
    { key: "open", label: "Aktif" },
    { key: "in_progress", label: "In Progress" },
    { key: "blocked", label: "Blocked" },
    { key: "all", label: "Semua" },
  ] as const;

  const { status } = await searchParams;
  const filter: (typeof filters)[number]["key"] =
    filters.find((f) => f.key === status)?.key ?? "open";

  const where =
    filter === "open"
      ? and(ne(tasks.status, "done"), ne(tasks.status, "cancelled"))
      : filter === "all"
        ? undefined
        : eq(tasks.status, filter);

  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      priorityScore: tasks.priorityScore,
      deadline: tasks.deadline,
      projectId: tasks.projectId,
      projectName: projects.name,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(where)
    .orderBy(desc(tasks.priorityScore), desc(tasks.createdAt))
    .limit(200);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Semua task lintas proyek, diurutkan berdasarkan skor prioritas."
        actions={
          <Button asChild variant="secondary">
            <Link href="/focus">Daily Focus</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/tasks?status=${f.key}`}
            className={
              "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors " +
              (filter === f.key
                ? "bg-primary text-white"
                : "bg-surface text-ink-secondary hover:bg-surface-muted")
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Tidak ada task"
          description="Task dibuat dari scope proyek, atau manual di board proyek."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Task</TH>
              <TH>Proyek</TH>
              <TH>Prioritas</TH>
              <TH className="text-right">Skor</TH>
              <TH>Deadline</TH>
              <TH>Status</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((t) => {
              const overdue =
                t.deadline && t.deadline < today && t.status !== "done";
              return (
                <TR key={t.id}>
                  <TD>
                    <Link
                      href={`/projects/${t.projectId}/tasks/${t.id}`}
                      className="text-ink hover:text-primary"
                    >
                      {t.title}
                    </Link>
                  </TD>
                  <TD className="text-ink-secondary">
                    {t.projectName ? (
                      <Link
                        href={`/projects/${t.projectId}/tasks`}
                        className="hover:text-primary"
                      >
                        {t.projectName}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TD>
                  <TD>
                    <Badge tone={priorityLabels[t.priority]?.tone ?? "gray"}>
                      {priorityLabels[t.priority]?.label ?? t.priority}
                    </Badge>
                  </TD>
                  <TD className="tabular text-right">{t.priorityScore}</TD>
                  <TD className={overdue ? "text-danger" : "text-ink-secondary"}>
                    {formatDate(t.deadline)}
                  </TD>
                  <TD>
                    <StatusBadge map={taskStatus} value={t.status} />
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      )}
    </>
  );
}
