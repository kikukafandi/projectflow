import { asc, eq } from "drizzle-orm";
import { ArrowLeft, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { featureCategories, featureItems, featureModules } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { complexityLabels, pricingMethodLabels } from "@/lib/labels";
import { formatIDR } from "@/lib/utils";
import { deleteFeatureItem, deleteModule } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [m] = await db
    .select()
    .from(featureModules)
    .where(eq(featureModules.id, id));
  if (!m) notFound();

  const [category] = m.categoryId
    ? await db
        .select({ name: featureCategories.name })
        .from(featureCategories)
        .where(eq(featureCategories.id, m.categoryId))
    : [];

  const features = await db
    .select()
    .from(featureItems)
    .where(eq(featureItems.moduleId, id))
    .orderBy(asc(featureItems.position), asc(featureItems.createdAt));

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/library"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Feature Library
      </Link>
      <PageHeader
        title={m.name}
        description={category?.name ?? "Tanpa kategori"}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/library/modules/${id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            <form action={deleteModule.bind(null, id)}>
              <Button type="submit" variant="ghost" className="text-danger hover:bg-danger-soft">
                <Trash2 /> Hapus
              </Button>
            </form>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {m.complexity && <StatusBadge map={complexityLabels} value={m.complexity} />}
            <Badge tone={m.isActive ? "green" : "gray"}>
              {m.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
            <span className="tabular ml-auto text-sm text-ink-secondary">
              Harga default: {formatIDR(m.defaultPrice)}
            </span>
          </div>
          {m.description && (
            <p className="mt-3 text-sm text-ink-secondary">{m.description}</p>
          )}
        </CardContent>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-ink">Fitur</h2>
        <Button asChild size="sm">
          <Link href={`/library/modules/${id}/features/new`}>
            <Plus /> Tambah Fitur
          </Link>
        </Button>
      </div>

      {features.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Belum ada fitur"
          description="Tambahkan fitur agar modul ini bisa dipakai menyusun scope."
          action={
            <Button asChild>
              <Link href={`/library/modules/${id}/features/new`}>
                <Plus /> Tambah Fitur
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {features.map((f) => (
            <Card key={f.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{f.name}</span>
                    {f.complexity && (
                      <StatusBadge map={complexityLabels} value={f.complexity} />
                    )}
                  </div>
                  <div className="text-[13px] text-ink-muted">
                    {pricingMethodLabels[f.pricingMethod ?? "fixed"]}
                    {f.unit ? ` · ${f.unit}` : ""}
                    {f.estimateHours ? ` · ${f.estimateHours} jam` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular text-sm text-ink-secondary">
                    {formatIDR(f.fixedPrice)}
                  </span>
                  <Button asChild variant="ghost" size="icon" aria-label="Edit fitur">
                    <Link href={`/library/modules/${id}/features/${f.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <form action={deleteFeatureItem.bind(null, f.id, id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label="Hapus fitur"
                      className="text-danger hover:bg-danger-soft"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
