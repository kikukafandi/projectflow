"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  projectFeatures,
  projects,
  taskChecklists,
  tasks,
} from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { priorityScore, scoreToLevel } from "@/lib/priority";
import { requireUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import {
  priorityFactorsSchema,
  taskSchema,
  taskStatusValues,
  type PriorityFactorsInput,
  type TaskInput,
} from "@/lib/validations";

type Result = { error: string } | void;

const DEFAULT_WIP = 2;

/** Recompute project progress = done / (total − cancelled) (PRD §14.6, §20.6). */
async function recomputeProjectProgress(projectId: string) {
  const rows = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));
  const active = rows.filter((r) => r.status !== "cancelled");
  const done = active.filter((r) => r.status === "done").length;
  const progress = active.length === 0 ? 0 : Math.round((done / active.length) * 100);
  await db
    .update(projects)
    .set({ progress, updatedAt: new Date() })
    .where(eq(projects.id, projectId));
}

export async function generateTasksFromScope(projectId: string): Promise<void> {
  const user = await requireUser();
  const feats = await db
    .select()
    .from(projectFeatures)
    .where(eq(projectFeatures.projectId, projectId));
  const counted = feats.filter(
    (f) => f.status === "included" || f.status === "approved",
  );
  if (counted.length > 0) {
    await db.insert(tasks).values(
      counted.map((f, i) => ({
        projectId,
        sourceFeatureId: f.id,
        title: f.name,
        description: f.description,
        status: "backlog" as const,
        estimateHours: f.estimateHours,
        definitionOfDone: f.definitionOfDone,
        position: i,
      })),
    );
  }
  await recomputeProjectProgress(projectId);
  await logActivity({
    userId: user.id,
    action: "tasks.generated",
    entityType: "project",
    entityId: projectId,
    note: `${counted.length} task`,
  });
  revalidatePath(`/projects/${projectId}/tasks`);
}

async function wipLimit(): Promise<number> {
  const s = await getSettings(["maxInProgressTasks"]);
  const n = Number(s.maxInProgressTasks);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_WIP;
}

/** Move a task to a new status. Enforces WIP limit for in_progress (PRD §22). */
export async function moveTask(
  projectId: string,
  taskId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const status = String(formData.get("status") ?? "");
  const override = String(formData.get("override") ?? "");
  if (!taskStatusValues.includes(status as never)) return;

  if (status === "in_progress" && !override) {
    const inProgress = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.status, "in_progress"));
    const limit = await wipLimit();
    if (inProgress.length >= limit) {
      redirect(`/projects/${projectId}/tasks?wip=${limit}`);
    }
  }

  await db
    .update(tasks)
    .set({
      status: status as (typeof taskStatusValues)[number],
      completedAt: status === "done" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));

  if (override && status === "in_progress") {
    await logActivity({
      userId: user.id,
      action: "wip.override",
      entityType: "task",
      entityId: taskId,
      note: override,
    });
  }
  await recomputeProjectProgress(projectId);
  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
}

export async function createTask(
  projectId: string,
  values: TaskInput,
): Promise<Result> {
  await requireUser();
  const parsed = taskSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.insert(tasks).values({ projectId, ...parsed.data });
  await recomputeProjectProgress(projectId);
  revalidatePath(`/projects/${projectId}/tasks`);
  redirect(`/projects/${projectId}/tasks`);
}

export async function updateTask(
  projectId: string,
  taskId: string,
  values: TaskInput,
): Promise<Result> {
  await requireUser();
  const parsed = taskSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db
    .update(tasks)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));
  await recomputeProjectProgress(projectId);
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  redirect(`/projects/${projectId}/tasks/${taskId}`);
}

export async function deleteTask(
  projectId: string,
  taskId: string,
): Promise<void> {
  await requireUser();
  await db.delete(tasks).where(eq(tasks.id, taskId));
  await recomputeProjectProgress(projectId);
  revalidatePath(`/projects/${projectId}/tasks`);
  redirect(`/projects/${projectId}/tasks`);
}

/** Mark done, but require all mandatory checklist items completed (PRD §37.6). */
export async function markTaskDone(
  projectId: string,
  taskId: string,
): Promise<void> {
  const user = await requireUser();
  const required = await db
    .select()
    .from(taskChecklists)
    .where(
      and(eq(taskChecklists.taskId, taskId), eq(taskChecklists.required, true)),
    );
  const blocked = required.some((c) => !c.done);
  if (blocked) {
    redirect(`/projects/${projectId}/tasks/${taskId}?dod=1`);
  }
  await db
    .update(tasks)
    .set({ status: "done", completedAt: new Date(), updatedAt: new Date() })
    .where(eq(tasks.id, taskId));
  await recomputeProjectProgress(projectId);
  await logActivity({
    userId: user.id,
    action: "task.done",
    entityType: "task",
    entityId: taskId,
  });
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  revalidatePath(`/projects/${projectId}/tasks`);
}

export async function setPriorityFactors(
  projectId: string,
  taskId: string,
  values: PriorityFactorsInput,
): Promise<Result> {
  await requireUser();
  const parsed = priorityFactorsSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const score = priorityScore(parsed.data);
  await db
    .update(tasks)
    .set({
      priorityScore: score,
      priority: scoreToLevel(score),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
  revalidatePath(`/projects/${projectId}/tasks`);
}

// ---- Checklist ----
export async function addChecklist(
  projectId: string,
  taskId: string,
  formData: FormData,
): Promise<void> {
  await requireUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const required = formData.get("required") === "on";
  await db.insert(taskChecklists).values({ taskId, label, required });
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
}

export async function toggleChecklist(
  projectId: string,
  taskId: string,
  checklistId: string,
  done: boolean,
): Promise<void> {
  await requireUser();
  await db
    .update(taskChecklists)
    .set({ done })
    .where(eq(taskChecklists.id, checklistId));
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
}

export async function deleteChecklist(
  projectId: string,
  taskId: string,
  checklistId: string,
): Promise<void> {
  await requireUser();
  await db.delete(taskChecklists).where(eq(taskChecklists.id, checklistId));
  revalidatePath(`/projects/${projectId}/tasks/${taskId}`);
}
