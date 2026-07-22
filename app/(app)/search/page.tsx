import { desc, eq, ilike, or } from "drizzle-orm";
import { Search } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import {
  clients,
  featureItems,
  invoices,
  projects,
  quotations,
  tasks,
} from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { invoiceStatus, quotationStatus, taskStatus } from "@/lib/labels";
import { formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

const LIMIT = 10;

type Hit = { href: string; title: string; meta?: string; badge?: React.ReactNode };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  // ilike is case-insensitive by definition (PRD §30.3).
  const pattern = `%${term}%`;

  const groups: { label: string; hits: Hit[] }[] = [];

  if (term.length >= 2) {
    const [
      clientRows,
      projectRows,
      taskRows,
      featureRows,
      quotationRows,
      invoiceRows,
    ] = await Promise.all([
      db
        .select()
        .from(clients)
        .where(
          or(
            ilike(clients.name, pattern),
            ilike(clients.companyName, pattern),
            ilike(clients.email, pattern),
          ),
        )
        .limit(LIMIT),
      db
        .select()
        .from(projects)
        .where(or(ilike(projects.name, pattern), ilike(projects.code, pattern)))
        .limit(LIMIT),
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
          projectId: tasks.projectId,
        })
        .from(tasks)
        .where(ilike(tasks.title, pattern))
        .orderBy(desc(tasks.priorityScore))
        .limit(LIMIT),
      db
        .select({
          id: featureItems.id,
          name: featureItems.name,
          moduleId: featureItems.moduleId,
        })
        .from(featureItems)
        .where(ilike(featureItems.name, pattern))
        .limit(LIMIT),
      db
        .select({
          id: quotations.id,
          number: quotations.number,
          status: quotations.status,
          projectId: quotations.projectId,
          grandTotal: quotations.grandTotal,
        })
        .from(quotations)
        .where(ilike(quotations.number, pattern))
        .limit(LIMIT),
      db
        .select({
          id: invoices.id,
          number: invoices.number,
          status: invoices.status,
          total: invoices.total,
          clientName: clients.name,
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .where(ilike(invoices.number, pattern))
        .limit(LIMIT),
    ]);

    groups.push(
      {
        label: "Klien",
        hits: clientRows.map((c) => ({
          href: `/clients/${c.id}`,
          title: c.name,
          meta: c.companyName ?? c.email ?? undefined,
        })),
      },
      {
        label: "Proyek",
        hits: projectRows.map((p) => ({
          href: `/projects/${p.id}`,
          title: p.name,
          meta: p.code,
        })),
      },
      {
        label: "Task",
        hits: taskRows.map((t) => ({
          href: `/projects/${t.projectId}/tasks/${t.id}`,
          title: t.title,
          badge: (
            <Badge tone={taskStatus[t.status]?.tone ?? "gray"}>
              {taskStatus[t.status]?.label ?? t.status}
            </Badge>
          ),
        })),
      },
      {
        label: "Feature Library",
        hits: featureRows.map((f) => ({
          href: `/library/modules/${f.moduleId}`,
          title: f.name,
        })),
      },
      {
        label: "Quotation",
        hits: quotationRows.map((qq) => ({
          href: `/projects/${qq.projectId}/quotations/${qq.id}`,
          title: qq.number,
          meta: formatIDR(qq.grandTotal),
          badge: (
            <Badge tone={quotationStatus[qq.status]?.tone ?? "gray"}>
              {quotationStatus[qq.status]?.label ?? qq.status}
            </Badge>
          ),
        })),
      },
      {
        label: "Invoice",
        hits: invoiceRows.map((i) => ({
          href: `/invoices/${i.id}`,
          title: i.number,
          meta: [i.clientName, formatIDR(i.total)].filter(Boolean).join(" · "),
          badge: (
            <Badge tone={invoiceStatus[i.status]?.tone ?? "gray"}>
              {invoiceStatus[i.status]?.label ?? i.status}
            </Badge>
          ),
        })),
      },
    );
  }

  const nonEmpty = groups.filter((g) => g.hits.length > 0);

  return (
    <>
      <PageHeader
        title="Pencarian"
        description="Cari klien, proyek, task, fitur, quotation, dan invoice."
      />

      {/* ponytail: a plain GET form — no debounce needed since nothing fires
          until submit. Swap for a client input if type-ahead is ever wanted. */}
      <form method="get" className="mb-5 flex gap-2">
        <Input
          name="q"
          defaultValue={term}
          placeholder="Ketik nama, kode, atau nomor dokumen…"
          aria-label="Kata kunci pencarian"
          autoFocus
        />
        <Button type="submit">
          <Search /> Cari
        </Button>
      </form>

      {term.length < 2 ? (
        <EmptyState
          icon={Search}
          title="Mulai mengetik"
          description="Masukkan minimal 2 karakter untuk mencari."
        />
      ) : nonEmpty.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`Tidak ada hasil untuk "${term}"`}
          description="Coba kata kunci lain atau nomor dokumen."
        />
      ) : (
        <div className="space-y-5">
          {nonEmpty.map((g) => (
            <section key={g.label}>
              <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-muted">
                {g.label}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-line">
                    {g.hits.map((h) => (
                      <li key={h.href}>
                        <Link
                          href={h.href}
                          className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-soft"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm text-ink">{h.title}</div>
                            {h.meta && (
                              <div className="truncate text-[12px] text-ink-muted">
                                {h.meta}
                              </div>
                            )}
                          </div>
                          {h.badge}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
