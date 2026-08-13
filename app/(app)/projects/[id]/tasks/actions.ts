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

/** True when the task still has unchecked mandatory checklist items (PRD §37.6). */
async function blockedByChecklist(taskId: string): Promise<boolean> {
  const required = await db
    .select({ done: taskChecklists.done })
    .from(taskChecklists)
    .where(
      and(eq(taskChecklists.taskId, taskId), eq(taskChecklists.required, true)),
    );
  return required.some((c) => !c.done);
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
  if (status === "done" && (await blockedByChecklist(taskId))) {
    redirect(`/projects/${projectId}/tasks/${taskId}?dod=1`);
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

// ---- Board & timeline (drag & drop) ----
// Dipanggil dari komponen klien, jadi mengembalikan pesan error alih-alih redirect:
// board yang membatalkan perpindahan butuh alasannya, bukan halaman baru.

/** Drop kartu ke sebuah kolom, sekaligus menyimpan urutan baru kolom itu. */
export async function moveTaskBoard(
  projectId: string,
  taskId: string,
  status: string,
  orderedIds: string[],
): Promise<{ error: string } | void> {
  await requireUser();
  if (!taskStatusValues.includes(status as never)) return;
  const next = status as (typeof taskStatusValues)[number];

  const [current] = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));
  if (!current) return { error: "Task tidak ditemukan." };

  if (next === "in_progress" && current.status !== "in_progress") {
    const inProgress = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.status, "in_progress"));
    const limit = await wipLimit();
    if (inProgress.length >= limit) {
      return {
        error: `WIP limit tercapai (maks ${limit} task In Progress). Selesaikan task aktif dulu, atau paksa mulai dari halaman task.`,
      };
    }
  }
  if (next === "done" && (await blockedByChecklist(taskId))) {
    return {
      error: "Checklist wajib belum selesai — buka task untuk menuntaskannya.",
    };
  }

  if (next !== current.status) {
    await db
      .update(tasks)
      .set({
        status: next,
        completedAt: next === "done" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));
  }
  // ponytail: satu UPDATE per kartu di kolom tujuan. Kolomnya puluhan baris,
  // bukan ribuan — ganti ke satu UPDATE ... CASE kalau board mulai berat.
  await Promise.all(
    orderedIds.map((id, i) =>
      db.update(tasks).set({ position: i }).where(eq(tasks.id, id)),
    ),
  );

  if (next !== current.status) await recomputeProjectProgress(projectId);
  revalidatePath(`/projects/${projectId}/tasks`);
}

/** Tambah task langsung dari dasar kolom board (tanpa pindah halaman). */
export async function quickCreateTask(
  projectId: string,
  status: string,
  title: string,
): Promise<{ error: string } | void> {
  await requireUser();
  const name = title.trim();
  if (!name) return;
  if (!taskStatusValues.includes(status as never)) return;
  const next = status as (typeof taskStatusValues)[number];

  const col = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, next)));
  await db
    .insert(tasks)
    .values({ projectId, title: name, status: next, position: col.length });
  await recomputeProjectProgress(projectId);
  revalidatePath(`/projects/${projectId}/tasks`);
}

/** Ubah judul task di tempat (inline edit di kartu board). */
export async function renameTask(
  projectId: string,
  taskId: string,
  title: string,
): Promise<void> {
  await requireUser();
  const name = title.trim();
  if (!name) return;
  await db
    .update(tasks)
    .set({ title: name, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));
  revalidatePath(`/projects/${projectId}/tasks`);
}

/** Geser/rentangkan bar task di timeline. Tanggal ISO `YYYY-MM-DD`. */
export async function setTaskDates(
  projectId: string,
  taskId: string,
  startDate: string | null,
  deadline: string | null,
): Promise<{ error: string } | void> {
  await requireUser();
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (startDate && !iso.test(startDate)) return { error: "Tanggal tidak valid." };
  if (deadline && !iso.test(deadline)) return { error: "Tanggal tidak valid." };
  if (startDate && deadline && deadline < startDate) {
    return { error: "Tanggal selesai mendahului tanggal mulai." };
  }
  await db
    .update(tasks)
    .set({ startDate, deadline, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));
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
  if (await blockedByChecklist(taskId)) {
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
