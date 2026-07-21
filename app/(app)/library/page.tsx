import { asc, desc } from "drizzle-orm";
import { Boxes, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { featureCategories, featureItems, featureModules } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { complexityLabels } from "@/lib/labels";
import { cn, formatIDR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, modules, items] = await Promise.all([
    db.select().from(featureCategories).orderBy(asc(featureCategories.name)),
    db.select().from(featureModules).orderBy(desc(featureModules.createdAt)),
    db.select({ moduleId: featureItems.moduleId }).from(featureItems),
  ]);

  const featureCount = (moduleId: string) =>
    items.filter((i) => i.moduleId === moduleId).length;

  const shown = category
    ? modules.filter((m) => m.categoryId === category)
    : modules;

  return (
    <>
      <PageHeader
        title="Feature Library"
        description="Modul dan fitur yang dapat digunakan berulang untuk menyusun scope & RAB."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/library/categories/new">
                <Plus /> Kategori
              </Link>
            </Button>
            <Button asChild>
              <Link href="/library/modules/new">
                <Plus /> Modul
              </Link>
            </Button>
          </>
        }
      />

      {modules.length === 0 && categories.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Feature Library masih kosong"
          description="Buat modul pertama agar penyusunan RAB lebih cepat."
          action={
            <Button asChild>
              <Link href="/library/modules/new">
                <Plus /> Buat Modul
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          {/* Category rail */}
          <aside className="space-y-1">
            <Link
              href="/library"
              className={cn(
                "flex items-center justify-between rounded-[12px] px-3 py-2 text-sm",
                !category ? "bg-primary-soft text-primary-active" : "hover:bg-surface-muted",
              )}
            >
              Semua <span className="text-ink-muted">{modules.length}</span>
            </Link>
            {categories.map((c) => (
              <div key={c.id} className="group flex items-center gap-1">
                <Link
                  href={`/library?category=${c.id}`}
                  className={cn(
                    "flex flex-1 items-center justify-between rounded-[12px] px-3 py-2 text-sm",
                    category === c.id ? "bg-primary-soft text-primary-active" : "hover:bg-surface-muted",
                  )}
                >
                  {c.name}
                  <span className="text-ink-muted">
                    {modules.filter((m) => m.categoryId === c.id).length}
                  </span>
                </Link>
                <Link
                  href={`/library/categories/${c.id}/edit`}
                  aria-label={`Edit ${c.name}`}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Pencil className="size-3.5 text-ink-muted hover:text-primary" />
                </Link>
              </div>
            ))}
          </aside>

          {/* Modules grid */}
          <div>
            {shown.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-muted">
                Belum ada modul pada kategori ini.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((m) => (
                  <Link key={m.id} href={`/library/modules/${m.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-[0_4px_14px_rgba(24,24,27,0.06)]">
                      <CardContent>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="font-medium text-ink">{m.name}</span>
                          {m.complexity && (
                            <StatusBadge map={complexityLabels} value={m.complexity} />
                          )}
                        </div>
                        {m.description && (
                          <p className="line-clamp-2 text-[13px] text-ink-secondary">
                            {m.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between text-[13px]">
                          <Badge tone="gray">{featureCount(m.id)} fitur</Badge>
                          <span className="tabular text-ink-secondary">
                            {formatIDR(m.defaultPrice)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
