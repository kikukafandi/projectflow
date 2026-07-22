import { eq } from "drizzle-orm";
import { Archive, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  priorityLabels,
  projectStatus,
  projectTypeLabels,
} from "@/lib/labels";
import { formatDate, formatIDR } from "@/lib/utils";
import { archiveProject } from "../actions";

export const dynamic = "force-dynamic";

const TABS: { label: string; href?: string }[] = [
  { label: "Overview" },
  { label: "Scope", href: "scope" },
  { label: "RAB", href: "rab" },
  { label: "Quotations", href: "quotations" },
  { label: "Tasks", href: "tasks" },
  { label: "Invoices" },
  { label: "Files" },
  { label: "Activity" },
];

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-0 sm:flex-row sm:items-center">
      <span className="w-40 shrink-0 text-[13px] text-ink-muted">{label}</span>
      <span className="text-sm text-ink">{value || "—"}</span>
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db
    .select({ project: projects, clientName: clients.name, clientId: clients.id })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.id, id));
  if (!row) notFound();
  const p = row.project;
  const archive = archiveProject.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={p.name}
        description={p.code}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/projects/${id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            {p.status !== "archived" && (
              <form action={archive}>
                <Button type="submit" variant="ghost">
                  <Archive /> Arsipkan
                </Button>
              </form>
            )}
          </>
        }
      />

      {/* Project header card (DESIGN.MD §18) */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge map={projectStatus} value={p.status} />
            <Badge tone={priorityLabels[p.priority].tone}>
              {priorityLabels[p.priority].label}
            </Badge>
            <Badge tone="cyan">{projectTypeLabels[p.type]}</Badge>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-[13px] text-ink-muted">Klien</div>
              {row.clientId ? (
                <Link
                  href={`/clients/${row.clientId}`}
                  className="text-sm font-medium text-ink hover:text-primary"
                >
                  {row.clientName}
                </Link>
              ) : (
                <div className="text-sm text-ink">—</div>
              )}
            </div>
            <div>
              <div className="text-[13px] text-ink-muted">Deadline</div>
              <div className="text-sm font-medium text-ink">
                {formatDate(p.deadline)}
              </div>
            </div>
            <div>
              <div className="text-[13px] text-ink-muted">Nilai Proyek</div>
              <div className="tabular text-sm font-medium text-ink">
                {formatIDR(p.projectValue)}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-ink-muted">Progress</span>
              <span className="tabular font-medium text-ink">{p.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${p.progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs — Overview active, rest arrive in later phases */}
      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t, i) =>
          i === 0 ? (
            <span
              key={t.label}
              className="border-b-2 border-primary px-3 pb-2.5 text-sm font-medium text-ink"
            >
              {t.label}
            </span>
          ) : t.href ? (
            <Link
              key={t.label}
              href={`/projects/${id}/${t.href}`}
              className="whitespace-nowrap px-3 pb-2.5 text-sm text-ink-secondary hover:text-primary"
            >
              {t.label}
            </Link>
          ) : (
            <span
              key={t.label}
              className="whitespace-nowrap px-3 pb-2.5 text-sm text-ink-muted"
            >
              {t.label}
              <span className="ml-1 text-[10px] text-ink-muted">soon</span>
            </span>
          ),
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <CardTitle className="mb-2">Detail</CardTitle>
            <Row label="Tujuan" value={p.goal} />
            <Row label="Target Pengguna" value={p.targetUsers} />
            <Row label="Tanggal Mulai" value={formatDate(p.startDate)} />
            <Row label="Budget Klien" value={formatIDR(p.clientBudget)} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <CardTitle className="mb-2">Deskripsi</CardTitle>
            <p className="whitespace-pre-wrap text-sm text-ink-secondary">
              {p.description || "Belum ada deskripsi."}
            </p>
          </CardContent>
        </Card>
      </div>

      {p.internalNotes && (
        <Card className="mt-4">
          <CardContent>
            <CardTitle className="mb-2">Catatan Internal</CardTitle>
            <p className="whitespace-pre-wrap text-sm text-ink-secondary">
              {p.internalNotes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
