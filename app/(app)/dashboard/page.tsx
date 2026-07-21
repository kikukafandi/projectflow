import { count, desc, eq, inArray } from "drizzle-orm";
import {
  ArrowRight,
  FolderKanban,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { activityLogs, clients, projects } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { projectStatus } from "@/lib/labels";
import { formatDate, formatIDR } from "@/lib/utils";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function Metric({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-[0_4px_14px_rgba(24,24,27,0.06)]">
        <CardContent className="flex items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
            <Icon className="size-[22px]" strokeWidth={1.9} />
          </span>
          <div>
            <div className="text-[13px] text-ink-muted">{label}</div>
            <div className="text-[22px] font-semibold text-ink">{value}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [[clientCount], [projectCount], activeProjects, recent] =
    await Promise.all([
      db.select({ v: count() }).from(clients),
      db.select({ v: count() }).from(projects),
      db
        .select({
          id: projects.id,
          name: projects.name,
          code: projects.code,
          status: projects.status,
          deadline: projects.deadline,
          progress: projects.progress,
          value: projects.projectValue,
          clientName: clients.name,
        })
        .from(projects)
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .where(
          inArray(projects.status, ["in_progress", "approved", "client_review"]),
        )
        .orderBy(desc(projects.updatedAt))
        .limit(5),
      db
        .select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.createdAt))
        .limit(6),
    ]);

  const firstName = (user.name ?? "").split(" ")[0] || "kembali";

  return (
    <>
      <PageHeader
        title={`Selamat datang, ${firstName}`}
        description="Ringkasan pekerjaan dan bisnis Anda hari ini."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric
          icon={Users}
          label="Total Klien"
          value={String(clientCount.v)}
          href="/clients"
        />
        <Metric
          icon={FolderKanban}
          label="Total Proyek"
          value={String(projectCount.v)}
          href="/projects"
        />
        <Metric
          icon={Wallet}
          label="Proyek Aktif"
          value={String(activeProjects.length)}
          href="/projects"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-ink">
                Proyek Aktif
              </h3>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
              >
                Lihat semua <ArrowRight className="size-3.5" />
              </Link>
            </div>
            {activeProjects.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">
                Belum ada proyek aktif.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {activeProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between gap-3 py-3 hover:text-primary"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {p.name}
                        </div>
                        <div className="text-[13px] text-ink-muted">
                          {p.clientName ?? p.code} · {formatDate(p.deadline)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular hidden text-[13px] text-ink-secondary sm:inline">
                          {p.progress}%
                        </span>
                        <StatusBadge map={projectStatus} value={p.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="mb-3 text-[17px] font-semibold text-ink">
              Aktivitas Terbaru
            </h3>
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">
                Belum ada aktivitas.
              </p>
            ) : (
              <ul className="space-y-3">
                {recent.map((a) => (
                  <li key={a.id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <div className="text-ink">{a.action}</div>
                      <div className="text-[12px] text-ink-muted">
                        {formatDate(a.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
