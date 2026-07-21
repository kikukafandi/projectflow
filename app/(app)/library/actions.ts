"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { featureCategories, featureItems, featureModules } from "@/db/schema";
import { requireUser } from "@/lib/session";
import {
  categorySchema,
  featureItemSchema,
  moduleSchema,
  type CategoryInput,
  type FeatureItemInput,
  type ModuleInput,
} from "@/lib/validations";

type Result = { error: string } | void;

// ---- Categories ----
export async function createCategory(values: CategoryInput): Promise<Result> {
  await requireUser();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(featureCategories).values(parsed.data);
  revalidatePath("/library");
  redirect("/library");
}

export async function updateCategory(
  id: string,
  values: CategoryInput,
): Promise<Result> {
  await requireUser();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(featureCategories)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(featureCategories.id, id));
  revalidatePath("/library");
  redirect("/library");
}

export async function deleteCategory(id: string): Promise<void> {
  await requireUser();
  await db.delete(featureCategories).where(eq(featureCategories.id, id));
  revalidatePath("/library");
}

// ---- Modules ----
function moduleRow(d: ModuleInput) {
  return {
    categoryId: d.categoryId,
    name: d.name,
    description: d.description,
    defaultEstimateHours: d.defaultEstimateHours,
    defaultPrice: d.defaultPrice,
    complexity: d.complexity,
    isActive: d.isActive,
    notes: d.notes,
  };
}

export async function createModule(values: ModuleInput): Promise<Result> {
  await requireUser();
  const parsed = moduleSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const [row] = await db
    .insert(featureModules)
    .values(moduleRow(parsed.data))
    .returning({ id: featureModules.id });
  revalidatePath("/library");
  redirect(`/library/modules/${row.id}`);
}

export async function updateModule(
  id: string,
  values: ModuleInput,
): Promise<Result> {
  await requireUser();
  const parsed = moduleSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(featureModules)
    .set({ ...moduleRow(parsed.data), updatedAt: new Date() })
    .where(eq(featureModules.id, id));
  revalidatePath("/library");
  revalidatePath(`/library/modules/${id}`);
  redirect(`/library/modules/${id}`);
}

export async function deleteModule(id: string): Promise<void> {
  await requireUser();
  await db.delete(featureModules).where(eq(featureModules.id, id));
  revalidatePath("/library");
  redirect("/library");
}

// ---- Feature items ----
function featureRow(d: FeatureItemInput) {
  return {
    name: d.name,
    description: d.description,
    estimateHours: d.estimateHours,
    fixedPrice: d.fixedPrice,
    hourlyRate: d.hourlyRate,
    unit: d.unit,
    defaultQuantity: d.defaultQuantity,
    pricingMethod: d.pricingMethod,
    complexity: d.complexity,
    defaultPriority: d.defaultPriority,
    definitionOfDone: d.definitionOfDone,
    isActive: d.isActive,
  };
}

export async function createFeatureItem(
  moduleId: string,
  values: FeatureItemInput,
): Promise<Result> {
  await requireUser();
  const parsed = featureItemSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .insert(featureItems)
    .values({ moduleId, ...featureRow(parsed.data) });
  revalidatePath(`/library/modules/${moduleId}`);
  redirect(`/library/modules/${moduleId}`);
}

export async function updateFeatureItem(
  id: string,
  moduleId: string,
  values: FeatureItemInput,
): Promise<Result> {
  await requireUser();
  const parsed = featureItemSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(featureItems)
    .set({ ...featureRow(parsed.data), updatedAt: new Date() })
    .where(eq(featureItems.id, id));
  revalidatePath(`/library/modules/${moduleId}`);
  redirect(`/library/modules/${moduleId}`);
}

export async function deleteFeatureItem(
  id: string,
  moduleId: string,
): Promise<void> {
  await requireUser();
  await db.delete(featureItems).where(eq(featureItems.id, id));
  revalidatePath(`/library/modules/${moduleId}`);
}
