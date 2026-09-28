import { and, asc, eq, ne } from "drizzle-orm";
import {
  ArrowLeft,
  FileSpreadsheet,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  featureModules,
  projectFeatures,
  projectModules,
  projects,
} from "@/db/schema";
import { AddLibraryModuleButton } from "@/components/add-library-module-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { scopeStatus } from "@/lib/labels";
import { lineSubtotal, toNum } from "@/lib/money";
import { formatIDR } from "@/lib/utils";
import {
  addManualModule,
  addModuleFromLibrary,
  deleteScopeFeature,
  deleteScopeModule,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function ScopePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const [mods, feats, libMods] = await Promise.all([
    db
      .select()
      .from(projectModules)
      .where(eq(projectModules.projectId, id))
      .orderBy(asc(projectModules.position), asc(projectModules.createdAt)),
    db
      .select()
      .from(projectFeatures)
      .where(eq(projectFeatures.projectId, id))
      .orderBy(asc(projectFeatures.position), asc(projectFeatures.createdAt)),
    db
      .select({ id: featureModules.id, name: featureModules.name })
      .from(featureModules)
      .where(eq(featureModules.isActive, true))
      .orderBy(asc(featureModules.name)),
  ]);

  const featsOf = (moduleId: string) =>
    feats.filter((f) => f.projectModuleId === moduleId);
  const addedSourceIds = new Set(mods.map((mod) => mod.sourceModuleId));
  const availableLibMods = libMods.filter((mod) => !addedSourceIds.has(mod.id));

  const counted = feats.filter(
    (f) => f.status === "included" || f.status === "approved",
  );
  const totalPrice = counted.reduce(
    (s, f) => s + lineSubtotal(f.quantity, f.unitPrice),
    0,
  );
  const totalHours = counted.reduce((s, f) => s + toNum(f.estimateHours), 0);

  return (
    <>
      <Link
        href={`/projects/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> {project.name}
      </Link>
      <PageHeader
        title="Scope Builder"
        description="Susun ruang lingkup pekerjaan. Fitur dari library disalin sebagai snapshot."
        actions={
          mods.length > 0 && (
            <Button asChild>
              <Link href={`/projects/${id}/rab`}>
                <FileSpreadsheet /> RAB
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {mods.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Scope masih kosong"
              description="Tambahkan modul dari Feature Library atau buat modul manual."
            />
          ) : (
            mods.map((m) => {
              const mf = featsOf(m.id);
              return (
                <Card key={m.id}>
                  <CardContent>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-medium text-ink">{m.name}</span>
                        {m.description && (
                          <p className="text-[13px] text-ink-muted">
                            {m.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link
                            href={`/projects/${id}/scope/feature/new?module=${m.id}`}
                          >
                            <Plus className="size-4" /> Fitur
                          </Link>
                        </Button>
                        <form action={deleteScopeModule.bind(null, id, m.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label="Hapus modul"
                            className="text-danger hover:bg-danger-soft"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      </div>
                    </div>

                    {mf.length === 0 ? (
                      <p className="py-2 text-[13px] text-ink-muted">
                        Belum ada fitur pada modul ini.
                      </p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {mf.map((f) => (
                          <li
                            key={f.id}
                            className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-ink">{f.name}</span>
                                <StatusBadge map={scopeStatus} value={f.status} />
                              </div>
                              <div className="tabular text-[12px] text-ink-muted">
                                {toNum(f.quantity)} {f.unit ?? ""} ×{" "}
                                {formatIDR(f.unitPrice)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="tabular text-sm text-ink">
                                {formatIDR(lineSubtotal(f.quantity, f.unitPrice))}
                              </span>
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                aria-label="Edit fitur"
                              >
                                <Link
                                  href={`/projects/${id}/scope/feature/${f.id}/edit`}
                                >
                                  <Pencil className="size-4" />
                                </Link>
                              </Button>
                              <form
                                action={deleteScopeFeature.bind(null, id, f.id)}
                              >
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
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Sidebar: add + summary */}
        <aside className="space-y-4">
          <Card>
            <CardContent>
              <h3 className="mb-2 text-sm font-semibold text-ink">
                Tambah dari Library
              </h3>
              {libMods.length === 0 ? (
                <p className="text-[13px] text-ink-muted">
                  Belum ada modul library.{" "}
                  <Link href="/library" className="text-primary hover:underline">
                    Buat dulu
                  </Link>
                  .
                </p>
              ) : availableLibMods.length === 0 ? (
                <p className="text-[13px] text-ink-muted">
                  Semua modul library sudah ditambahkan.
                </p>
              ) : (
                <div className="space-y-1">
                  {availableLibMods.map((lm) => (
                    <form
                      key={lm.id}
                      action={addModuleFromLibrary.bind(null, id, lm.id)}
                    >
                      <AddLibraryModuleButton name={lm.name} />
                    </form>
                  ))}
                </div>
              )}
              <form
                action={addManualModule.bind(null, id)}
                className="mt-3 flex gap-2"
              >
                <Input name="name" placeholder="Modul manual…" className="h-9" required />
                <Button type="submit" variant="secondary" size="sm">
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-20">
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-ink">
                Ringkasan Biaya
              </h3>
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-ink-muted">Fitur dihitung</span>
                <span className="tabular">{counted.length}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-ink-muted">Estimasi</span>
                <span className="tabular">{totalHours} jam</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                <span className="font-medium text-ink">Total</span>
                <span className="tabular text-lg font-semibold text-primary">
                  {formatIDR(totalPrice)}
                </span>
              </div>
              <Badge tone="gray" className="mt-2">
                Included + Approved
              </Badge>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
