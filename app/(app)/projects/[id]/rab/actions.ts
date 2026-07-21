"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  projectFeatures,
  projectModules,
  rabItems,
  rabSections,
  rabs,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { computeRabTotals, lineSubtotal } from "@/lib/money";
import { nextDocumentNumber } from "@/lib/numbering";
import { requireUser } from "@/lib/session";
import { rabItemSchema, rabMetaSchema, type RabItemInput, type RabMetaInput } from "@/lib/validations";

type Result = { error: string } | void;

/** Recompute + persist subtotal/grandTotal for a RAB from its items (server-authoritative). */
async function recomputeRab(rabId: string) {
  const [rab] = await db.select().from(rabs).where(eq(rabs.id, rabId));
  if (!rab) return;
  const sections = await db
    .select({ id: rabSections.id })
    .from(rabSections)
    .where(eq(rabSections.rabId, rabId));
  const sectionIds = sections.map((s) => s.id);
  const items = sectionIds.length
    ? await db
        .select({ quantity: rabItems.quantity, unitPrice: rabItems.unitPrice })
        .from(rabItems)
        .where(inArray(rabItems.sectionId, sectionIds))
    : [];
  const totals = computeRabTotals({
    items,
    discount: rab.discount,
    taxPercent: rab.taxPercent,
    additionalCost: rab.additionalCost,
  });
  await db
    .update(rabs)
    .set({
      subtotal: String(totals.subtotal),
      grandTotal: String(totals.grandTotal),
      updatedAt: new Date(),
    })
    .where(eq(rabs.id, rabId));
}

export async function generateRabFromScope(projectId: string): Promise<void> {
  const user = await requireUser();
  const number = await nextDocumentNumber("rab");
  const [rab] = await db
    .insert(rabs)
    .values({ projectId, number, title: "RAB dari scope", status: "draft" })
    .returning({ id: rabs.id });

  const mods = await db
    .select()
    .from(projectModules)
    .where(eq(projectModules.projectId, projectId));
  const feats = await db
    .select()
    .from(projectFeatures)
    .where(eq(projectFeatures.projectId, projectId));

  let pos = 0;
  for (const m of mods) {
    const mf = feats.filter(
      (f) =>
        f.projectModuleId === m.id &&
        (f.status === "included" || f.status === "approved"),
    );
    if (mf.length === 0) continue;
    const [section] = await db
      .insert(rabSections)
      .values({ rabId: rab.id, name: m.name, position: pos++ })
      .returning({ id: rabSections.id });
    await db.insert(rabItems).values(
      mf.map((f, i) => ({
        sectionId: section.id,
        name: f.name,
        description: f.description,
        quantity: f.quantity ?? "1",
        unit: f.unit,
        unitPrice: f.unitPrice ?? "0",
        subtotal: String(lineSubtotal(f.quantity, f.unitPrice)),
        estimateHours: f.estimateHours,
        position: i,
      })),
    );
  }

  await recomputeRab(rab.id);
  await logActivity({
    userId: user.id,
    action: "rab.generated",
    entityType: "rab",
    entityId: rab.id,
    note: number,
  });
  revalidatePath(`/projects/${projectId}/rab`);
  redirect(`/projects/${projectId}/rab/${rab.id}`);
}

export async function updateRabMeta(
  projectId: string,
  rabId: string,
  values: RabMetaInput,
): Promise<Result> {
  await requireUser();
  const parsed = rabMetaSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(rabs)
    .set({
      title: parsed.data.title,
      discount: parsed.data.discount ?? "0",
      taxPercent: parsed.data.taxPercent ?? "0",
      additionalCost: parsed.data.additionalCost ?? "0",
      notes: parsed.data.notes,
      updatedAt: new Date(),
    })
    .where(eq(rabs.id, rabId));
  await recomputeRab(rabId);
  revalidatePath(`/projects/${projectId}/rab/${rabId}`);
}

export async function addRabSection(
  projectId: string,
  rabId: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(rabSections).values({ rabId, name });
  revalidatePath(`/projects/${projectId}/rab/${rabId}`);
}

export async function deleteRabSection(
  projectId: string,
  rabId: string,
  sectionId: string,
): Promise<void> {
  await requireUser();
  await db.delete(rabSections).where(eq(rabSections.id, sectionId));
  await recomputeRab(rabId);
  revalidatePath(`/projects/${projectId}/rab/${rabId}`);
}

export async function addRabItem(
  projectId: string,
  rabId: string,
  sectionId: string,
  values: RabItemInput,
): Promise<Result> {
  await requireUser();
  const parsed = rabItemSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(rabItems).values({
    sectionId,
    ...parsed.data,
    subtotal: String(lineSubtotal(parsed.data.quantity ?? "0", parsed.data.unitPrice ?? "0")),
  });
  await recomputeRab(rabId);
  revalidatePath(`/projects/${projectId}/rab/${rabId}`);
  redirect(`/projects/${projectId}/rab/${rabId}`);
}

export async function updateRabItem(
  projectId: string,
  rabId: string,
  itemId: string,
  values: RabItemInput,
): Promise<Result> {
  await requireUser();
  const parsed = rabItemSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(rabItems)
    .set({
      ...parsed.data,
      subtotal: String(lineSubtotal(parsed.data.quantity ?? "0", parsed.data.unitPrice ?? "0")),
      updatedAt: new Date(),
    })
    .where(eq(rabItems.id, itemId));
  await recomputeRab(rabId);
  revalidatePath(`/projects/${projectId}/rab/${rabId}`);
  redirect(`/projects/${projectId}/rab/${rabId}`);
}

export async function deleteRabItem(
  projectId: string,
  rabId: string,
  itemId: string,
): Promise<void> {
  await requireUser();
  await db.delete(rabItems).where(eq(rabItems.id, itemId));
  await recomputeRab(rabId);
  revalidatePath(`/projects/${projectId}/rab/${rabId}`);
}

export async function deleteRab(
  projectId: string,
  rabId: string,
): Promise<void> {
  await requireUser();
  await db.delete(rabs).where(eq(rabs.id, rabId));
  revalidatePath(`/projects/${projectId}/rab`);
  redirect(`/projects/${projectId}/rab`);
}
