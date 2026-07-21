import { desc, eq } from "drizzle-orm";
import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { priorityLabels, projectStatus, projectTypeLabels } from "@/lib/labels";
import { formatDate, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rows = await db
    .select({
      id: projects.id,
      code: projects.code,
      name: projects.name,
      type: projects.type,
      status: projects.status,
      priority: projects.priority,
      deadline: projects.deadline,
      projectValue: projects.projectValue,
      clientName: clients.name,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .orderBy(desc(projects.createdAt));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Kelola seluruh proyek aktif dan progres pekerjaan."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus /> New Project
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Belum ada proyek"
          description="Buat proyek baru untuk mulai menyusun scope dan RAB."
          action={
            <Button asChild>
              <Link href="/projects/new">
                <Plus /> Buat Proyek
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH>Proyek</TH>
                  <TH>Klien</TH>
                  <TH>Jenis</TH>
                  <TH>Deadline</TH>
                  <TH className="text-right">Nilai</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <tbody>
                {rows.map((p) => (
                  <TR key={p.id}>
                    <TD>
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {p.name}
                      </Link>
                      <div className="text-[13px] text-ink-muted">{p.code}</div>
                    </TD>
                    <TD className="text-ink-secondary">{p.clientName ?? "—"}</TD>
                    <TD>
                      <Badge tone="cyan">{projectTypeLabels[p.type]}</Badge>
                    </TD>
                    <TD className="text-ink-secondary">{formatDate(p.deadline)}</TD>
                    <TD className="tabular text-right text-ink">
                      {formatIDR(p.projectValue)}
                    </TD>
                    <TD>
                      <StatusBadge map={projectStatus} value={p.status} />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {rows.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="block rounded-[16px] border border-[#ECECE8] bg-surface p-4 shadow-[0_2px_8px_rgba(24,24,27,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{p.name}</div>
                    <div className="truncate text-[13px] text-ink-muted">
                      {p.clientName ?? p.code}
                    </div>
                  </div>
                  <StatusBadge map={projectStatus} value={p.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px]">
                  <Badge tone={priorityLabels[p.priority].tone}>
                    {priorityLabels[p.priority].label}
                  </Badge>
                  <span className="tabular text-ink-secondary">
                    {formatIDR(p.projectValue)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
