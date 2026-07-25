import { asc, eq, inArray } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, Plus, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { rabItems, rabSections, rabs } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RabMetaForm } from "@/components/forms/rab-meta-form";
import { rabStatus } from "@/lib/labels";
import { computeRabTotals, toNum } from "@/lib/money";
import { formatIDR } from "@/lib/utils";
import {
  addRabSection,
  deleteRab,
  deleteRabItem,
  deleteRabSection,
  finalizeRab,
  updateRabMeta,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function RabEditorPage({
  params,
}: {
  params: Promise<{ id: string; rabId: string }>;
}) {
  const { id, rabId } = await params;
  const [rab] = await db.select().from(rabs).where(eq(rabs.id, rabId));
  if (!rab) notFound();

  const sections = await db
    .select()
    .from(rabSections)
    .where(eq(rabSections.rabId, rabId))
    .orderBy(asc(rabSections.position), asc(rabSections.createdAt));
  const sectionIds = sections.map((s) => s.id);
  const items = sectionIds.length
    ? await db
        .select()
        .from(rabItems)
        .where(inArray(rabItems.sectionId, sectionIds))
        .orderBy(asc(rabItems.position), asc(rabItems.createdAt))
    : [];

  const totals = computeRabTotals({
    items,
    discount: rab.discount,
    taxPercent: rab.taxPercent,
    additionalCost: rab.additionalCost,
    profitPercent: rab.profitPercent,
  });
  const itemsOf = (sid: string) => items.filter((i) => i.sectionId === sid);
  const isDraft = !rab.number;
  // Bobot = porsi subtotal item terhadap total biaya (semua bobot menjumlah 100%).
  const bobotOf = (subtotal: string | null) =>
    totals.subtotal > 0
      ? `${((toNum(subtotal) / totals.subtotal) * 100).toFixed(1)}%`
      : "—";

  return (
    <>
      <Link
        href={`/projects/${id}/rab`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> RAB
      </Link>
      <PageHeader
        title={rab.number ?? "Draft RAB"}
        description={rab.title ?? undefined}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/print/rab/${rabId}?back=/projects/${id}/rab/${rabId}`}>
                <Printer /> {isDraft ? "Preview" : "Cetak"}
              </Link>
            </Button>
            {isDraft && (
              <form action={finalizeRab.bind(null, id, rabId)}>
                <ConfirmSubmit
                  variant="primary"
                  confirmLabel="Ya, finalkan"
                  title="Finalkan RAB ini?"
                  message="RAB akan mendapat nomor resmi (RAB/tahun/urut) dan bisa dicetak / dijadikan quotation. Nomor tidak bisa dibatalkan setelah terpakai."
                >
                  <CheckCircle2 /> Finalkan
                </ConfirmSubmit>
              </form>
            )}
            <form action={deleteRab.bind(null, id, rabId)}>
              <ConfirmSubmit
                variant="ghost"
                className="text-danger hover:bg-danger-soft"
                title="Hapus RAB ini?"
                message="Semua section dan item di dalam RAB ini ikut terhapus permanen."
              >
                <Trash2 /> Hapus
              </ConfirmSubmit>
            </form>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge map={rabStatus} value={rab.status} />
        {isDraft && (
          <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-[12px] text-[#a9760f]">
            Draft — belum bernomor. Gunakan Preview untuk melihat hasil cetak;
            finalkan untuk nomor resmi.
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {sections.length === 0 ? (
            <Card>
              <CardContent className="text-sm text-ink-muted">
                RAB belum punya section. Tambahkan section di bawah, atau
                generate ulang dari scope.
              </CardContent>
            </Card>
          ) : (
            sections.map((s) => (
              <Card key={s.id}>
                <CardContent>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-ink">{s.name}</span>
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/projects/${id}/rab/${rabId}/items/new?section=${s.id}`}>
                          <Plus className="size-4" /> Item
                        </Link>
                      </Button>
                      <form action={deleteRabSection.bind(null, id, rabId, s.id)}>
                        <Button type="submit" variant="ghost" size="icon" aria-label="Hapus section" className="text-danger hover:bg-danger-soft">
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="text-[12px] text-ink-muted">
                        <tr>
                          <th className="py-1.5 font-medium">Pekerjaan</th>
                          <th className="py-1.5 text-right font-medium">Qty</th>
                          <th className="py-1.5 font-medium">Satuan</th>
                          <th className="py-1.5 text-right font-medium">Harga</th>
                          <th className="py-1.5 text-right font-medium">Subtotal</th>
                          <th className="py-1.5 text-right font-medium">Bobot</th>
                          <th className="py-1.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsOf(s.id).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-2 text-[13px] text-ink-muted">
                              Belum ada item.
                            </td>
                          </tr>
                        ) : (
                          itemsOf(s.id).map((it) => (
                            <tr key={it.id} className="border-t border-line">
                              <td className="py-2">{it.name}</td>
                              <td className="tabular py-2 text-right">{Number(it.quantity)}</td>
                              <td className="py-2">{it.unit ?? "—"}</td>
                              <td className="tabular py-2 text-right">{formatIDR(it.unitPrice)}</td>
                              <td className="tabular py-2 text-right">{formatIDR(it.subtotal)}</td>
                              <td className="tabular py-2 text-right text-ink-secondary">
                                {bobotOf(it.subtotal)}
                              </td>
                              <td className="py-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <Link
                                    href={`/projects/${id}/rab/${rabId}/items/${it.id}/edit`}
                                    className="text-[13px] text-primary hover:underline"
                                  >
                                    Edit
                                  </Link>
                                  <form action={deleteRabItem.bind(null, id, rabId, it.id)}>
                                    <button type="submit" className="text-[13px] text-danger hover:underline" aria-label="Hapus item">
                                      Hapus
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <form action={addRabSection.bind(null, id, rabId)} className="flex gap-2">
            <Input name="name" placeholder="Nama section baru…" />
            <Button type="submit" variant="secondary">
              <Plus className="size-4" /> Section
            </Button>
          </form>
        </div>

        {/* Summary + meta */}
        <aside className="space-y-4">
          <Card className="lg:sticky lg:top-20">
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-ink">Ringkasan</h3>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Biaya Operasional</dt>
                  <dd className="tabular">{formatIDR(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Diskon</dt>
                  <dd className="tabular">−{formatIDR(rab.discount)}</dd>
                </div>
                <div className="flex justify-between text-success">
                  <dt>Keuntungan ({Number(rab.profitPercent)}%)</dt>
                  <dd className="tabular">+{formatIDR(totals.profit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Pajak ({Number(rab.taxPercent)}%)</dt>
                  <dd className="tabular">{formatIDR(totals.tax)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Biaya Tambahan</dt>
                  <dd className="tabular">{formatIDR(rab.additionalCost)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-line pt-2">
                  <dt className="font-medium text-ink">Harga Jual</dt>
                  <dd className="tabular text-lg font-semibold text-primary">
                    {formatIDR(totals.grandTotal)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-ink">
                Keuntungan, Diskon, Pajak & Biaya
              </h3>
              <RabMetaForm
                action={updateRabMeta.bind(null, id, rabId)}
                defaultValues={{
                  title: rab.title ?? undefined,
                  discount: rab.discount ?? "0",
                  taxPercent: rab.taxPercent ?? "0",
                  additionalCost: rab.additionalCost ?? "0",
                  profitPercent: rab.profitPercent ?? "0",
                  notes: rab.notes ?? undefined,
                }}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
