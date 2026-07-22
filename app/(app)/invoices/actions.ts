"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  invoiceItems,
  invoices,
  paymentTerms,
  payments,
  projects,
  quotationItems,
  quotationSections,
  quotations,
  receipts,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { computeRabTotals, lineSubtotal, toNum } from "@/lib/money";
import { nextDocumentNumber } from "@/lib/numbering";
import { requireUser } from "@/lib/session";
import { terbilangRupiah } from "@/lib/terbilang";
import {
  invoiceItemSchema,
  invoiceMetaSchema,
  paymentSchema,
  type InvoiceItemInput,
  type InvoiceMetaInput,
  type PaymentInput,
} from "@/lib/validations";

type Result = { error: string } | void;

/**
 * Recompute invoice subtotal/total/paidAmount/status from source rows.
 * Idempotent — safe without DB transactions (Neon HTTP), since it always
 * derives from the items + confirmed payments tables (PRD §24.5, §37.5).
 */
async function recomputeInvoice(invoiceId: string) {
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
  if (!inv) return;
  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));
  const totals = computeRabTotals({
    items,
    discount: inv.discount,
    taxPercent: inv.taxPercent,
    additionalCost: 0,
  });
  const pays = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId));
  const paid = pays
    .filter((p) => p.status === "confirmed")
    .reduce((s, p) => s + toNum(p.amount), 0);

  let status = inv.status;
  if (status !== "cancelled" && status !== "void" && status !== "draft") {
    if (totals.grandTotal > 0 && paid >= totals.grandTotal) status = "paid";
    else if (paid > 0) status = "partially_paid";
    else if (inv.dueDate && new Date(inv.dueDate) < new Date()) status = "overdue";
    else status = "sent";
  }

  await db
    .update(invoices)
    .set({
      subtotal: String(totals.subtotal),
      total: String(totals.grandTotal),
      paidAmount: String(Math.round(paid)),
      status,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));
}

export async function createInvoiceFromQuotation(
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const quotationId = String(formData.get("quotationId") ?? "");
  if (!quotationId) return;
  const [q] = await db
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId));
  if (!q) return;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, q.projectId));
  if (!project) return;

  const number = await nextDocumentNumber("invoice");
  const [inv] = await db
    .insert(invoices)
    .values({
      number,
      clientId: project.clientId,
      projectId: q.projectId,
      quotationId: q.id,
      status: "draft",
    })
    .returning({ id: invoices.id });

  const sections = await db
    .select()
    .from(quotationSections)
    .where(eq(quotationSections.quotationId, quotationId))
    .orderBy(asc(quotationSections.position));
  let pos = 0;
  for (const s of sections) {
    const its = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.sectionId, s.id))
      .orderBy(asc(quotationItems.position));
    if (its.length > 0) {
      await db.insert(invoiceItems).values(
        its.map((it) => ({
          invoiceId: inv.id,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal,
          position: pos++,
        })),
      );
    }
  }
  await recomputeInvoice(inv.id);
  await logActivity({
    userId: user.id,
    action: "invoice.created",
    entityType: "invoice",
    entityId: inv.id,
    note: number,
  });
  revalidatePath("/invoices");
  redirect(`/invoices/${inv.id}`);
}

/** Partial invoice for one payment term (PRD §24.2 termin). */
export async function createInvoiceFromTerm(
  projectId: string,
  quotationId: string,
  termId: string,
): Promise<void> {
  const user = await requireUser();
  const [term] = await db
    .select()
    .from(paymentTerms)
    .where(eq(paymentTerms.id, termId));
  if (!term) return;
  // One invoice per term — re-invoicing would double-count the receivable.
  const existing = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(eq(invoices.paymentTermId, termId));
  if (existing.length > 0) redirect(`/invoices/${existing[0].id}`);

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project) return;

  const number = await nextDocumentNumber("invoice");
  const [inv] = await db
    .insert(invoices)
    .values({
      number,
      clientId: project.clientId,
      projectId,
      quotationId,
      paymentTermId: termId,
      dueDate: term.dueDate,
      status: "draft",
    })
    .returning({ id: invoices.id });

  await db.insert(invoiceItems).values({
    invoiceId: inv.id,
    name: term.name,
    description: term.trigger,
    quantity: "1",
    unitPrice: term.amount ?? "0",
    subtotal: term.amount ?? "0",
    position: 0,
  });
  await db
    .update(paymentTerms)
    .set({ status: "invoiced", updatedAt: new Date() })
    .where(eq(paymentTerms.id, termId));

  await recomputeInvoice(inv.id);
  await logActivity({
    userId: user.id,
    action: "invoice.created",
    entityType: "invoice",
    entityId: inv.id,
    note: `${number} · ${term.name}`,
  });
  revalidatePath(`/projects/${projectId}/quotations/${quotationId}`);
  revalidatePath("/invoices");
  redirect(`/invoices/${inv.id}`);
}

export async function createManualInvoice(formData: FormData): Promise<void> {
  await requireUser();
  const clientId = String(formData.get("clientId") ?? "");
  const projectId = String(formData.get("projectId") ?? "") || null;
  if (!clientId) return;
  const number = await nextDocumentNumber("invoice");
  const [inv] = await db
    .insert(invoices)
    .values({ number, clientId, projectId, status: "draft" })
    .returning({ id: invoices.id });
  revalidatePath("/invoices");
  redirect(`/invoices/${inv.id}`);
}

export async function updateInvoiceMeta(
  invoiceId: string,
  values: InvoiceMetaInput,
): Promise<Result> {
  await requireUser();
  const parsed = invoiceMetaSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(invoices)
    .set({
      issueDate: parsed.data.issueDate,
      dueDate: parsed.data.dueDate,
      discount: parsed.data.discount ?? "0",
      taxPercent: parsed.data.taxPercent ?? "0",
      bankAccountId: parsed.data.bankAccountId,
      notes: parsed.data.notes,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));
  await recomputeInvoice(invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function setInvoiceStatus(
  invoiceId: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const status = String(formData.get("status") ?? "");
  if (!["draft", "sent", "cancelled", "void"].includes(status)) return;
  await db
    .update(invoices)
    .set({ status: status as never, updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));
  await recomputeInvoice(invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function addInvoiceItem(
  invoiceId: string,
  values: InvoiceItemInput,
): Promise<Result> {
  await requireUser();
  const parsed = invoiceItemSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(invoiceItems).values({
    invoiceId,
    ...parsed.data,
    subtotal: String(lineSubtotal(parsed.data.quantity ?? "0", parsed.data.unitPrice ?? "0")),
  });
  await recomputeInvoice(invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}`);
}

export async function deleteInvoiceItem(
  invoiceId: string,
  itemId: string,
): Promise<void> {
  await requireUser();
  await db.delete(invoiceItems).where(eq(invoiceItems.id, itemId));
  await recomputeInvoice(invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  await requireUser();
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
  if (!inv) return;
  // PRD §37.4: an invoice with payments cannot be deleted — void instead.
  const pays = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId));
  if (pays.length > 0) {
    await db
      .update(invoices)
      .set({ status: "void", updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId));
    revalidatePath(`/invoices/${invoiceId}`);
    return;
  }
  await db.delete(invoices).where(eq(invoices.id, invoiceId));
  // Release the term so it can be invoiced again.
  if (inv.paymentTermId) {
    await db
      .update(paymentTerms)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(paymentTerms.id, inv.paymentTermId));
  }
  revalidatePath("/invoices");
  redirect("/invoices");
}

// ---- Payments ----
export async function addPayment(
  invoiceId: string,
  values: PaymentInput,
): Promise<Result> {
  const user = await requireUser();
  const parsed = paymentSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(payments).values({
    invoiceId,
    amount: parsed.data.amount,
    paidAt: parsed.data.paidAt,
    method: parsed.data.method,
    bankAccountId: parsed.data.bankAccountId,
    reference: parsed.data.reference,
    notes: parsed.data.notes,
    status: "confirmed",
  });
  await recomputeInvoice(invoiceId);
  await logActivity({
    userId: user.id,
    action: "payment.recorded",
    entityType: "invoice",
    entityId: invoiceId,
    note: parsed.data.amount,
  });
  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}`);
}

export async function cancelPayment(
  invoiceId: string,
  paymentId: string,
): Promise<void> {
  const user = await requireUser();
  await db
    .update(payments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(payments.id, paymentId));
  // Void any receipt tied to this payment (PRD §26.4).
  await db
    .update(receipts)
    .set({ status: "void", updatedAt: new Date() })
    .where(eq(receipts.paymentId, paymentId));
  await recomputeInvoice(invoiceId);
  await logActivity({
    userId: user.id,
    action: "payment.cancelled",
    entityType: "invoice",
    entityId: invoiceId,
  });
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function createReceipt(
  invoiceId: string,
  paymentId: string,
): Promise<void> {
  const user = await requireUser();
  const [pay] = await db.select().from(payments).where(eq(payments.id, paymentId));
  if (!pay || pay.status !== "confirmed") return;
  const existing = await db
    .select({ id: receipts.id })
    .from(receipts)
    .where(eq(receipts.paymentId, paymentId));
  if (existing.length > 0) return; // one receipt per payment

  const number = await nextDocumentNumber("receipt");
  await db.insert(receipts).values({
    number,
    paymentId,
    amount: pay.amount,
    amountInWords: terbilangRupiah(pay.amount),
    status: "issued",
  });
  await logActivity({
    userId: user.id,
    action: "receipt.created",
    entityType: "receipt",
    entityId: paymentId,
    note: number,
  });
  revalidatePath(`/invoices/${invoiceId}`);
}
