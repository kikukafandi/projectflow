import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  ArrowLeft,
  Ban,
  Plus,
  Printer,
  Receipt as ReceiptIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { db } from "@/db";
import {
  businessBankAccounts,
  clients,
  invoiceItems,
  invoices,
  payments,
  receipts,
} from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { InvoiceMetaForm } from "@/components/forms/invoice-meta-form";
import {
  invoiceStatus,
  paymentMethodLabels,
  receiptStatus,
} from "@/lib/labels";
import { toNum } from "@/lib/money";
import { formatDate, formatIDR } from "@/lib/utils";
import {
  cancelPayment,
  createReceipt,
  deleteInvoice,
  deleteInvoiceItem,
  setInvoiceStatus,
  updateInvoiceMeta,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
  if (!inv) notFound();

  const [[client], items, pays, banks] = await Promise.all([
    db.select().from(clients).where(eq(clients.id, inv.clientId)),
    db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(asc(invoiceItems.position)),
    db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.paidAt)),
    db.select().from(businessBankAccounts),
  ]);

  const paymentIds = pays.map((p) => p.id);
  const receiptRows = paymentIds.length
    ? await db.select().from(receipts).where(inArray(receipts.paymentId, paymentIds))
    : [];
  const receiptOf = (paymentId: string) =>
    receiptRows.find((r) => r.paymentId === paymentId);

  const remaining = toNum(inv.total) - toNum(inv.paidAmount);
  const itemSections = items.reduce<Array<{ name: string; items: typeof items }>>(
    (sections, item) => {
      const name = item.sectionName ?? "Item";
      const section = sections.find((entry) => entry.name === name);
      if (section) section.items.push(item);
      else sections.push({ name, items: [item] });
      return sections;
    },
    [],
  );
  const bankOptions = banks.map((b) => ({
    id: b.id,
    label: `${b.bankName} · ${b.accountNumber}`,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/invoices"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Invoices
      </Link>
      <PageHeader
        title={inv.number}
        description={client?.name}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/print/invoice/${invoiceId}?back=/invoices/${invoiceId}`}>
                <Printer /> Cetak
              </Link>
            </Button>
            <form action={deleteInvoice.bind(null, invoiceId)}>
              <ConfirmSubmit
                variant="ghost"
                className="text-danger hover:bg-danger-soft"
                title={`Hapus invoice ${inv.number}?`}
                confirmLabel="Hapus / Void"
                message="Invoice draft dihapus permanen. Invoice yang sudah terkirim atau sudah ada pembayarannya akan di-void, bukan dihapus."
              >
                <Ban /> Hapus / Void
              </ConfirmSubmit>
            </form>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge map={invoiceStatus} value={inv.status} />
        <form action={setInvoiceStatus.bind(null, invoiceId)} className="flex items-center gap-2">
          <Select name="status" defaultValue={inv.status} className="h-9 w-auto">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
            <option value="void">Void</option>
          </Select>
          <Button type="submit" variant="secondary" size="sm">Ubah Status</Button>
        </form>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Items */}
          <Card>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <CardTitle>Item</CardTitle>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/invoices/${invoiceId}/items/new`}>
                    <Plus className="size-4" /> Item
                  </Link>
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="text-[13px] text-ink-muted">Belum ada item.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="text-[12px] text-ink-muted">
                      <tr>
                        <th className="py-1.5 font-medium">Item</th>
                        <th className="py-1.5 text-right font-medium">Qty</th>
                        <th className="py-1.5 text-right font-medium">Harga</th>
                        <th className="py-1.5 text-right font-medium">Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemSections.map((section) => (
                        <Fragment key={section.name}>
                          <tr className="border-t border-line bg-surface-soft font-medium">
                            <td colSpan={5} className="py-2">{section.name}</td>
                          </tr>
                          {section.items.map((it) => (
                            <tr key={it.id} className="border-t border-line">
                              <td className="py-2">{it.name}</td>
                              <td className="tabular py-2 text-right">{Number(it.quantity)}</td>
                              <td className="tabular py-2 text-right">{formatIDR(it.unitPrice)}</td>
                              <td className="tabular py-2 text-right">{formatIDR(it.subtotal)}</td>
                              <td className="py-2 text-right">
                                <form action={deleteInvoiceItem.bind(null, invoiceId, it.id)}>
                                  <button type="submit" aria-label="Hapus item" className="text-danger hover:underline text-[13px]">
                                    Hapus
                                  </button>
                                </form>
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-line font-semibold">
                            <td colSpan={3} className="py-2 text-right">Subtotal section</td>
                            <td className="tabular py-2 text-right">
                              {formatIDR(section.items.reduce((sum, it) => sum + toNum(it.subtotal), 0))}
                            </td>
                            <td />
                          </tr>
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardContent>
              <div className="mb-2 flex items-center justify-between">
                <CardTitle>Pembayaran</CardTitle>
                <Button asChild size="sm">
                  <Link href={`/invoices/${invoiceId}/payments/new`}>
                    <Plus className="size-4" /> Pembayaran
                  </Link>
                </Button>
              </div>
              {pays.length === 0 ? (
                <p className="text-[13px] text-ink-muted">Belum ada pembayaran.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {pays.map((p) => {
                    const rc = receiptOf(p.id);
                    const cancelled = p.status === "cancelled";
                    return (
                      <li key={p.id} className="py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className={"tabular text-sm font-medium " + (cancelled ? "text-ink-muted line-through" : "text-ink")}>
                              {formatIDR(p.amount)}
                            </span>
                            <span className="ml-2 text-[12px] text-ink-muted">
                              {formatDate(p.paidAt)} · {paymentMethodLabels[p.method]}
                              {p.reference ? ` · ${p.reference}` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {!cancelled && !rc && (
                              <form action={createReceipt.bind(null, invoiceId, p.id)}>
                                <Button type="submit" size="sm" variant="secondary">
                                  <ReceiptIcon className="size-4" /> Kuitansi
                                </Button>
                              </form>
                            )}
                            {!cancelled && (
                              <form action={cancelPayment.bind(null, invoiceId, p.id)}>
                                <button type="submit" aria-label="Batalkan pembayaran" className="text-ink-muted hover:text-danger">
                                  <Trash2 className="size-4" />
                                </button>
                              </form>
                            )}
                          </div>
                        </div>
                        {rc && (
                          <div className="mt-1 flex items-center gap-2 text-[12px]">
                            <ReceiptIcon className="size-3.5 text-ink-muted" />
                            <span className="text-ink-secondary">{rc.number}</span>
                            <StatusBadge map={receiptStatus} value={rc.status} />
                            <Link
                              href={`/print/receipt/${rc.id}?back=/invoices/${invoiceId}`}
                              className="text-primary hover:underline"
                            >
                              Cetak
                            </Link>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary + meta */}
        <aside className="space-y-4">
          <Card className="lg:sticky lg:top-20">
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-ink">Ringkasan</h3>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd className="tabular">{formatIDR(inv.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Diskon</dt>
                  <dd className="tabular">−{formatIDR(inv.discount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Pajak ({Number(inv.taxPercent)}%)</dt>
                  <dd className="tabular">
                    {formatIDR(
                      Math.max(0, toNum(inv.total) - (toNum(inv.subtotal) - toNum(inv.discount))),
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-1.5">
                  <dt className="font-medium text-ink">Total</dt>
                  <dd className="tabular font-semibold">{formatIDR(inv.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Dibayar</dt>
                  <dd className="tabular text-success">{formatIDR(inv.paidAmount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-ink">Sisa</dt>
                  <dd className="tabular text-lg font-semibold text-primary">
                    {formatIDR(remaining)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="mb-3 text-sm font-semibold text-ink">Detail Invoice</h3>
              <InvoiceMetaForm
                banks={bankOptions}
                action={updateInvoiceMeta.bind(null, invoiceId)}
                defaultValues={{
                  issueDate: inv.issueDate ?? undefined,
                  dueDate: inv.dueDate ?? undefined,
                  discount: inv.discount ?? "0",
                  taxPercent: inv.taxPercent ?? "0",
                  bankAccountId: inv.bankAccountId ?? undefined,
                  notes: inv.notes ?? undefined,
                }}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
