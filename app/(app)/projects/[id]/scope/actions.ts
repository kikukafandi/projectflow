"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  featureItems,
  featureModules,
  projectFeatures,
  projectModules,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/session";
import { scopeFeatureSchema, type ScopeFeatureInput } from "@/lib/validations";

type Result = { error: string } | void;

/**
 * Snapshot a library module + its active features into the project scope.
 * Per PRD §37.1 we COPY values so later library edits don't change the project.
 */
export async function addModuleFromLibrary(
  projectId: string,
  moduleId: string,
): Promise<void> {
  const user = await requireUser();
  const [mod] = await db
    .select()
    .from(featureModules)
    .where(eq(featureModules.id, moduleId));
  if (!mod) return;

  const [pm] = await db
    .insert(projectModules)
    .values({
      projectId,
      sourceModuleId: mod.id,
      name: mod.name,
      description: mod.description,
    })
    .returning({ id: projectModules.id });

  const feats = await db
    .select()
    .from(featureItems)
    .where(eq(featureItems.moduleId, moduleId));

  const active = feats.filter((f) => f.isActive);
  if (active.length > 0) {
    await db.insert(projectFeatures).values(
      active.map((f, i) => ({
        projectId,
        projectModuleId: pm.id,
        sourceFeatureId: f.id,
        name: f.name,
        description: f.description,
        quantity: f.defaultQuantity ?? "1",
        unit: f.unit,
        estimateHours: f.estimateHours,
        unitPrice: f.fixedPrice ?? "0",
        complexity: f.complexity ?? "medium",
        status: "included" as const,
        definitionOfDone: f.definitionOfDone,
        position: i,
      })),
    );
  }

  await logActivity({
    userId: user.id,
    action: "scope.module_added",
    entityType: "project",
    entityId: projectId,
    note: mod.name,
  });
  revalidatePath(`/projects/${projectId}/scope`);
}

export async function addManualModule(
  projectId: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(projectModules).values({ projectId, name });
  revalidatePath(`/projects/${projectId}/scope`);
}

export async function deleteScopeModule(
  projectId: string,
  moduleId: string,
): Promise<void> {
  await requireUser();
  await db.delete(projectModules).where(eq(projectModules.id, moduleId));
  revalidatePath(`/projects/${projectId}/scope`);
}

export async function addManualFeature(
  projectId: string,
  projectModuleId: string,
  values: ScopeFeatureInput,
): Promise<Result> {
  await requireUser();
  const parsed = scopeFeatureSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(projectFeatures).values({
    projectId,
    projectModuleId,
    ...parsed.data,
  });
  revalidatePath(`/projects/${projectId}/scope`);
  redirect(`/projects/${projectId}/scope`);
}

export async function updateScopeFeature(
  projectId: string,
  featureId: string,
  values: ScopeFeatureInput,
): Promise<Result> {
  await requireUser();
  const parsed = scopeFeatureSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(projectFeatures)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projectFeatures.id, featureId));
  revalidatePath(`/projects/${projectId}/scope`);
  redirect(`/projects/${projectId}/scope`);
}

export async function deleteScopeFeature(
  projectId: string,
  featureId: string,
): Promise<void> {
  await requireUser();
  await db.delete(projectFeatures).where(eq(projectFeatures.id, featureId));
  revalidatePath(`/projects/${projectId}/scope`);
}
