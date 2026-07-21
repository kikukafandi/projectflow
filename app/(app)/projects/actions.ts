"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextDocumentNumber } from "@/lib/numbering";
import { requireUser } from "@/lib/session";
import { projectSchema, type ProjectInput } from "@/lib/validations";

type Result = { error: string } | void;

/** Convert form values to DB values (drop undefined, keep money as strings). */
function toRow(data: ProjectInput) {
  return {
    name: data.name,
    clientId: data.clientId,
    type: data.type,
    status: data.status,
    priority: data.priority,
    description: data.description,
    goal: data.goal,
    targetUsers: data.targetUsers,
    startDate: data.startDate,
    deadline: data.deadline,
    clientBudget: data.clientBudget,
    projectValue: data.projectValue,
    internalNotes: data.internalNotes,
  };
}

export async function createProject(values: ProjectInput): Promise<Result> {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const code = await nextDocumentNumber("project");
  const [row] = await db
    .insert(projects)
    .values({ code, ...toRow(parsed.data) })
    .returning({ id: projects.id });

  await logActivity({
    userId: user.id,
    action: "project.created",
    entityType: "project",
    entityId: row.id,
    after: { code, ...parsed.data },
  });
  revalidatePath("/projects");
  redirect(`/projects/${row.id}`);
}

export async function updateProject(
  id: string,
  values: ProjectInput,
): Promise<Result> {
  const user = await requireUser();
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(projects)
    .set({ ...toRow(parsed.data), updatedAt: new Date() })
    .where(eq(projects.id, id));

  await logActivity({
    userId: user.id,
    action: "project.updated",
    entityType: "project",
    entityId: id,
    after: parsed.data,
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function archiveProject(id: string): Promise<void> {
  const user = await requireUser();
  await db
    .update(projects)
    .set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(projects.id, id));
  await logActivity({
    userId: user.id,
    action: "project.archived",
    entityType: "project",
    entityId: id,
  });
  revalidatePath("/projects");
  redirect("/projects");
}
