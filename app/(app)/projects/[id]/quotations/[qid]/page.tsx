import { asc, eq, inArray } from "drizzle-orm";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  FileText,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  invoices,
  paymentTerms,
  quotationItems,
  quotationSections,
  quotations,
} from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { QuotationMetaForm } from "@/components/forms/quotation-meta-form";
import { paymentTermTypeLabels, quotationStatus } from "@/lib/labels";
import { toNum } from "@/lib/money";
import { formatDate, formatIDR } from "@/lib/utils";
import { projectPayments } from "@/lib/documents";
import {
  addQuotationSection,
  deletePaymentTerm,
  deleteQuotation,
  deleteQuotationItem,
  deleteQuotationSection,
  reviseQuotation,
  setQuotationStatus,
  updateQuotationMeta,
} from "../actions";
import {
  createInvoiceFromQuotation,
  createInvoiceFromTerm,
} from "@/app/(app)/invoices/actions";

export const dynamic = "force-dynamic";

const STATUSES = [
  "draft",
  "sent",
  "viewed",
  "approved",
  "rejected",
  "expired",
  "cancelled",
];

export default async function QuotationEditorPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  const [q] = await db.select().from(quotations).where(eq(quotations.id, qid));
  if (!q) notFound();

  const sections = await db
    .select()
    .from(quotationSections)
    .where(eq(quotationSections.quotationId, qid))
    .orderBy(asc(quotationSections.position));
  const sectionIds = sections.map((s) => s.id);
  const items = sectionIds.length
    ? await db
        .select()
        .from(quotationItems)
        .where(inArray(quotationItems.sectionId, sectionIds))
        .orderBy(asc(quotationItems.position))
    : [];
  const terms = await db
    .select()
    .from(paymentTerms)
    .where(eq(paymentTerms.quotationId, qid))
    .orderBy(asc(paymentTerms.position), asc(paymentTerms.createdAt));

  const invoiceRows = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      paymentTermId: invoices.paymentTermId,
    })
    .from(invoices)
    .where(eq(invoices.quotationId, qid));
  const invoiceOfTerm = (termId: string) =>
    invoiceRows.find((i) => i.paymentTermId === termId);

  const paid = await projectPayments(id);
  const paidTotal = paid.reduce((sum, p) => sum + p.value, 0);

  const approved = q.status === "approved";
  const editable = q.status === "draft";
  const grand = toNum(q.grandTotal);
  const termsTotal = terms.reduce((s, t) => s + toNum(t.amount), 0);
  const termsPercent = terms.reduce((s, t) => s + toNum(t.percent), 0);
  const termsMismatch =
    terms.length > 0 && Math.abs(termsTotal - grand) > 1;

  const itemsOf = (sid: string) => items.filter((i) => i.sectionId === sid);

  return (
    <>
      <Link
        href={`/projects/${id}/quotations`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Quotations
      </Link>
      <PageHeader
        title={q.number}
        description={`Versi ${q.currentVersion}`}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/print/quotation/${qid}?back=/projects/${id}/quotations/${qid}`}>
                <Printer /> Cetak
              </Link>
            </Button>
            {approved && terms.length === 0 && invoiceRows.length === 0 && (
              <form action={createInvoiceFromQuotation}>
                <input type="hidden" name="quotationId" value={qid} />
                <Button type="submit">
                  <FileText /> Buat Invoice
                </Button>
              </form>
            )}
            <form action={reviseQuotation.bind(null, id, qid)}>
              <Button type="submit" variant="secondary">
                <Copy /> Revisi
              </Button>
            </form>
            <form action={deleteQuotation.bind(null, id, qid)}>
              <ConfirmSubmit
                variant="ghost"
                className="text-danger hover:bg-danger-soft"
                title="Hapus quotation ini?"
                message="Termin pembayaran di dalamnya ikut terhapus permanen."
              >
                <Trash2 /> Hapus
              </ConfirmSubmit>
            </form>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge map={quotationStatus} value={q.status} />
        <form action={setQuotationStatus.bind(null, id, qid)} className="flex items-center gap-2">
          <Select name="status" defaultValue={q.status} className="h-9 w-auto">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {quotationStatus[s]?.label ?? s}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" size="sm">
            Ubah Status
          </Button>
        </form>
        {approved && (
          <span className="inline-flex items-center gap-1 text-[13px] text-success">
            <CheckCircle2 className="size-4" /> Terkunci — nilai proyek diperbarui.
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {sections.map((s) => (
            <Card key={s.id}>
              <CardContent>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="font-medium text-ink">{s.name}</div>
                  {editable && (
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/projects/${id}/quotations/${qid}/items/new?section=${s.id}`}>
                          <Plus /> Item
                        </Link>
                      </Button>
                      <form action={deleteQuotationSection.bind(null, id, qid, s.id)}>
                        <Button type="submit" variant="ghost" size="icon" aria-label="Hapus section" className="text-danger hover:bg-danger-soft">
                          <Trash2 />
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="text-[12px] text-ink-muted">
                      <tr>
                        <th className="py-1.5 font-medium">Item</th>
                        <th className="py-1.5 text-right font-medium">Qty</th>
                        <th className="py-1.5 text-right font-medium">Harga</th>
                        <th className="py-1.5 text-right font-medium">Subtotal</th>
                        {editable && <th className="py-1.5" />}
                      </tr>
                    </thead>
                    <tbody>
                      {itemsOf(s.id).map((it) => (
                        <tr key={it.id} className="border-t border-line">
                          <td className="py-2">{it.name}</td>
                          <td className="tabular py-2 text-right">{Number(it.quantity)}</td>
                          <td className="tabular py-2 text-right">{formatIDR(it.unitPrice)}</td>
                          <td className="tabular py-2 text-right">{formatIDR(it.subtotal)}</td>
                          {editable && (
                            <td className="py-2 text-right">
                              <div className="flex justify-end gap-2 text-[13px]">
                                <Link href={`/projects/${id}/quotations/${qid}/items/${it.id}/edit`} className="text-primary hover:underline">Edit</Link>
                                <form action={deleteQuotationItem.bind(null, id, qid, it.id)}>
                                  <button type="submit" className="text-danger hover:underline">Hapus</button>
                                </form>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {itemsOf(s.id).length > 0 && (
                        <tr className="border-t border-line font-semibold">
                          <td colSpan={3} className="py-2 text-right">Subtotal section</td>
                          <td className="tabular py-2 text-right">
                            {formatIDR(itemsOf(s.id).reduce((sum, it) => sum + toNum(it.subtotal), 0))}
                          </td>
                          {editable && <td />}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          {editable && (
            <form action={addQuotationSection.bind(null, id, qid)} className="flex gap-2">
              <Input name="name" placeholder="Nama section baru…" required />
              <Button type="submit" variant="secondary">
                <Plus /> Section
              </Button>
            </form>
          )}

          {/* Payment terms (PRD §19) */}
          <Card>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Termin Pembayaran</h3>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/projects/${id}/quotations/${qid}/terms/new`}>
                    <Plus className="size-4" /> Termin
                  </Link>
                </Button>
              </div>
              {terms.length === 0 ? (
                <p className="text-[13px] text-ink-muted">Belum ada termin.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {terms.map((t) => {
                    const inv = invoiceOfTerm(t.id);
                    return (
                      <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                        <div>
                          <div className="text-sm text-ink">
                            {t.name}
                            <span className="ml-2 text-[12px] text-ink-muted">
                              {paymentTermTypeLabels[t.type]}
                              {t.percent ? ` · ${Number(t.percent)}%` : ""}
                            </span>
                          </div>
                          {t.trigger && (
                            <div className="text-[12px] text-ink-muted">{t.trigger}</div>
                          )}
                          {inv && (
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
                            >
                              <FileText className="size-3.5" /> {inv.number}
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="tabular text-sm">{formatIDR(t.amount)}</span>
                          {approved && !inv && (
                            <form action={createInvoiceFromTerm.bind(null, id, qid, t.id)}>
                              <Button type="submit" size="sm" variant="secondary">
                                <FileText className="size-4" /> Invoice
                              </Button>
                            </form>
                          )}
                          {!inv && (
                            <form action={deletePaymentTerm.bind(null, id, qid, t.id)}>
                              <button type="submit" aria-label="Hapus termin" className="text-danger hover:text-danger">
                                <Trash2 className="size-4" />
                              </button>
                            </form>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {terms.length > 0 && (
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-sm">
                  <span className="text-ink-muted">
                    Total termin ({termsPercent ? `${termsPercent}%` : "—"})
                  </span>
                  <span className="tabular font-medium">{formatIDR(termsTotal)}</span>
                </div>
              )}
              {termsMismatch && (
                <div className="mt-2 flex items-center gap-2 rounded-[12px] bg-warning-soft px-3 py-2 text-[13px] text-[#a9760f]">
                  <AlertTriangle className="size-4 shrink-0" />
                  Total termin belum sama dengan grand total ({formatIDR(grand)}).
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="lg:sticky lg:top-20">
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-ink">Ringkasan</h3>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span className="tabular">{formatIDR(q.subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-2">
                <span className="font-medium text-ink">Grand Total</span>
                <span className="tabular text-lg font-semibold text-primary">
                  {formatIDR(q.grandTotal)}
                </span>
              </div>
              {paidTotal > 0 && (
                <>
                  <div className="mt-3 -rotate-2 rounded-[8px] border-2 border-double border-success bg-success-soft px-3 py-2 text-center text-success">
                    <div className="text-[13px] font-extrabold uppercase tracking-widest">Sudah Dibayar</div>
                    {paid.map((p, i) => (
                      <div key={i} className="text-[12px] font-medium">
                        {p.label} · {p.date} · {p.amount}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="font-medium text-ink">Sisa tagihan</span>
                    <span className="tabular font-semibold">{formatIDR(grand - paidTotal)}</span>
                  </div>
                </>
              )}
              <div className="mt-2 text-[12px] text-ink-muted">
                Berlaku s/d {formatDate(q.validUntil)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-ink">Detail Penawaran</h3>
              <QuotationMetaForm
                action={updateQuotationMeta.bind(null, id, qid)}
                disabled={!editable}
                defaultValues={{
                  showPrice: q.showPrice,
                  validUntil: q.validUntil ?? undefined,
                  notes: q.notes ?? undefined,
                  terms: q.terms ?? undefined,
                }}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
