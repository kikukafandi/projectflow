"use server";

import { count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { invoices, projects } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { nextDocumentNumber } from "@/lib/numbering";
import { isAdmin, requireUser } from "@/lib/session";
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

export async function unarchiveProject(id: string): Promise<void> {
  const user = await requireUser();
  await db
    .update(projects)
    // The pre-archive status isn't stored, so restore to "draft" and let the
    // user set the real one — never guess a status that drives billing.
    .set({ status: "draft", archivedAt: null, updatedAt: new Date() })
    .where(eq(projects.id, id));
  await logActivity({
    userId: user.id,
    action: "project.unarchived",
    entityType: "project",
    entityId: id,
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}

/**
 * Hard delete, for clearing out trial data. Scope, RAB, quotation, task, and
 * phase rows cascade with the project. Invoices do not — their FK is
 * `set null`, so deleting would orphan financial records; a project with any
 * invoice is archived instead (PRD §37.7).
 */
export async function deleteProject(id: string): Promise<void> {
  const user = await requireUser();
  const [{ n: invoiceCount }] = await db
    .select({ n: count() })
    .from(invoices)
    .where(eq(invoices.projectId, id));

  if (invoiceCount > 0) {
    await db
      .update(projects)
      .set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(projects.id, id));
    revalidatePath("/projects");
    redirect(`/projects/${id}?archived=1`);
  }

  await db.delete(projects).where(eq(projects.id, id));
  await logActivity({
    userId: user.id,
    action: "project.deleted",
    entityType: "project",
    entityId: id,
  });
  revalidatePath("/projects");
  redirect("/projects");
}

/**
 * Hapus paksa: buang proyek beserta invoice-nya (menembus guard arsip). Hanya
 * untuk admin (ADMIN_EMAILS). Bottom-up menembus FK RESTRICT receipt→payment→
 * invoice; hapus proyek meng-cascade RAB/scope/quotation/task.
 * ponytail: hapus berurutan (neon-http). Bungkus db.transaction bila butuh atomik.
 */
export async function forceDeleteProject(id: string): Promise<void> {
  const user = await requireUser();
  if (!isAdmin(user)) redirect(`/projects/${id}`);

  await db.execute(
    sql`DELETE FROM receipts r USING payments p, invoices i WHERE r.payment_id = p.id AND p.invoice_id = i.id AND i.project_id = ${id}::uuid`,
  );
  await db.execute(
    sql`DELETE FROM payments p USING invoices i WHERE p.invoice_id = i.id AND i.project_id = ${id}::uuid`,
  );
  await db.execute(
    sql`DELETE FROM invoice_items ii USING invoices i WHERE ii.invoice_id = i.id AND i.project_id = ${id}::uuid`,
  );
  await db.delete(invoices).where(eq(invoices.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
  await logActivity({
    userId: user.id,
    action: "project.force_deleted",
    entityType: "project",
    entityId: id,
  });
  revalidatePath("/projects");
  redirect("/projects");
}
