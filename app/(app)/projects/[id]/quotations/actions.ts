"use server";

import { asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  paymentTerms,
  projects,
  quotationItems,
  quotationSections,
  quotations,
  rabItems,
  rabSections,
  rabs,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { toNum } from "@/lib/money";
import { nextDocumentNumber } from "@/lib/numbering";
import { requireUser } from "@/lib/session";
import {
  paymentTermSchema,
  quotationMetaSchema,
  type PaymentTermInput,
  type QuotationMetaInput,
} from "@/lib/validations";

type Result = { error: string } | void;

export async function generateQuotationFromRab(
  projectId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const rabId = String(formData.get("rabId") ?? "");
  if (!rabId) return;
  const [rab] = await db.select().from(rabs).where(eq(rabs.id, rabId));
  if (!rab) return;

  const number = await nextDocumentNumber("quotation");
  const [q] = await db
    .insert(quotations)
    .values({
      projectId,
      rabId,
      number,
      status: "draft",
      subtotal: rab.subtotal ?? "0",
      grandTotal: rab.grandTotal ?? "0",
    })
    .returning({ id: quotations.id });

  const sections = await db
    .select()
    .from(rabSections)
    .where(eq(rabSections.rabId, rabId))
    .orderBy(asc(rabSections.position));
  for (const s of sections) {
    const [qs] = await db
      .insert(quotationSections)
      .values({ quotationId: q.id, name: s.name, position: s.position })
      .returning({ id: quotationSections.id });
    const items = await db
      .select()
      .from(rabItems)
      .where(eq(rabItems.sectionId, s.id))
      .orderBy(asc(rabItems.position));
    if (items.length > 0) {
      await db.insert(quotationItems).values(
        items.map((it, i) => ({
          sectionId: qs.id,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal,
          position: i,
        })),
      );
    }
  }

  await logActivity({
    userId: user.id,
    action: "quotation.generated",
    entityType: "quotation",
    entityId: q.id,
    note: number,
  });
  revalidatePath(`/projects/${projectId}/quotations`);
  redirect(`/projects/${projectId}/quotations/${q.id}`);
}

export async function updateQuotationMeta(
  projectId: string,
  qid: string,
  values: QuotationMetaInput,
): Promise<Result> {
  await requireUser();
  const [q] = await db.select().from(quotations).where(eq(quotations.id, qid));
  if (!q) return { error: "Quotation tidak ditemukan" };
  if (q.status === "approved")
    return { error: "Quotation Approved tidak dapat diedit. Buat revisi." };
  const parsed = quotationMetaSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(quotations)
    .set({
      validUntil: parsed.data.validUntil,
      notes: parsed.data.notes,
      terms: parsed.data.terms,
      updatedAt: new Date(),
    })
    .where(eq(quotations.id, qid));
  revalidatePath(`/projects/${projectId}/quotations/${qid}`);
}

/** Change status. Approving locks the version and updates project value (PRD §37.2). */
export async function setQuotationStatus(
  projectId: string,
  qid: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const status = String(formData.get("status") ?? "") as
    | "draft"
    | "sent"
    | "viewed"
    | "revised"
    | "approved"
    | "rejected"
    | "expired"
    | "cancelled";
  const [q] = await db.select().from(quotations).where(eq(quotations.id, qid));
  if (!q) return;

  await db
    .update(quotations)
    .set({ status, updatedAt: new Date() })
    .where(eq(quotations.id, qid));

  if (status === "approved") {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    await db
      .update(projects)
      .set({
        projectValue: q.grandTotal ?? "0",
        status:
          project && ["lead", "draft", "proposal"].includes(project.status)
            ? "approved"
            : project?.status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
    await logActivity({
      userId: user.id,
      action: "quotation.approved",
      entityType: "quotation",
      entityId: qid,
      note: q.number,
    });
  }
  revalidatePath(`/projects/${projectId}/quotations/${qid}`);
  revalidatePath(`/projects/${projectId}`);
}

export async function reviseQuotation(
  projectId: string,
  qid: string,
): Promise<void> {
  await requireUser();
  const [q] = await db.select().from(quotations).where(eq(quotations.id, qid));
  if (!q) return;

  const base = q.number.replace(/-R\d+$/, "");
  const newVersion = q.currentVersion + 1;
  const newNumber = `${base}-R${q.currentVersion}`;

  const [nq] = await db
    .insert(quotations)
    .values({
      projectId,
      rabId: q.rabId,
      number: newNumber,
      status: "draft",
      currentVersion: newVersion,
      validUntil: q.validUntil,
      subtotal: q.subtotal,
      grandTotal: q.grandTotal,
      notes: q.notes,
      terms: q.terms,
    })
    .returning({ id: quotations.id });

  // copy sections + items
  const sections = await db
    .select()
    .from(quotationSections)
    .where(eq(quotationSections.quotationId, qid))
    .orderBy(asc(quotationSections.position));
  for (const s of sections) {
    const [ns] = await db
      .insert(quotationSections)
      .values({ quotationId: nq.id, name: s.name, position: s.position })
      .returning({ id: quotationSections.id });
    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.sectionId, s.id))
      .orderBy(asc(quotationItems.position));
    if (items.length > 0) {
      await db.insert(quotationItems).values(
        items.map((it) => ({
          sectionId: ns.id,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal,
          position: it.position,
        })),
      );
    }
  }

  await db
    .update(quotations)
    .set({ status: "revised", updatedAt: new Date() })
    .where(eq(quotations.id, qid));

  revalidatePath(`/projects/${projectId}/quotations`);
  redirect(`/projects/${projectId}/quotations/${nq.id}`);
}

export async function deleteQuotation(
  projectId: string,
  qid: string,
): Promise<void> {
  await requireUser();
  await db.delete(quotations).where(eq(quotations.id, qid));
  revalidatePath(`/projects/${projectId}/quotations`);
  redirect(`/projects/${projectId}/quotations`);
}

// ---- Payment terms ----
export async function addPaymentTerm(
  projectId: string,
  qid: string,
  values: PaymentTermInput,
): Promise<Result> {
  await requireUser();
  const parsed = paymentTermSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [q] = await db.select().from(quotations).where(eq(quotations.id, qid));
  const grand = toNum(q?.grandTotal);
  // Derive amount from percent when amount left blank.
  const amount =
    parsed.data.amount ??
    (parsed.data.percent && grand
      ? String(Math.round((toNum(parsed.data.percent) / 100) * grand))
      : undefined);

  await db.insert(paymentTerms).values({
    quotationId: qid,
    projectId,
    name: parsed.data.name,
    description: parsed.data.description,
    type: parsed.data.type,
    percent: parsed.data.percent,
    amount,
    dueDate: parsed.data.dueDate,
    trigger: parsed.data.trigger,
  });
  revalidatePath(`/projects/${projectId}/quotations/${qid}`);
  redirect(`/projects/${projectId}/quotations/${qid}`);
}

export async function deletePaymentTerm(
  projectId: string,
  qid: string,
  termId: string,
): Promise<void> {
  await requireUser();
  await db.delete(paymentTerms).where(eq(paymentTerms.id, termId));
  revalidatePath(`/projects/${projectId}/quotations/${qid}`);
}
