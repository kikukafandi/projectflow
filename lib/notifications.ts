/**
 * Internal notifications (PRD §31).
 *
 * ponytail: derived on read instead of by a cron job — `syncNotifications()`
 * recomputes the live conditions and inserts only the ones not already present
 * as an unread row, so it is idempotent and needs no scheduler. If notifications
 * ever have to fire while nobody has the app open (email/push), move this to a
 * scheduled job that calls the same `detect()`.
 */
import { and, eq, inArray, isNull, lt, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoices, notifications, projects, quotations, tasks } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { toNum } from "@/lib/money";

export type Urgency = "low" | "medium" | "high";

type Detected = {
  type: string;
  title: string;
  body?: string;
  urgency: Urgency;
  entityType: string;
  entityId: string;
};

const DAY = 24 * 60 * 60 * 1000;

function isoDay(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);
}

/** Live conditions worth telling the user about, computed from current rows. */
async function detect(): Promise<Detected[]> {
  const today = isoDay();
  const inThreeDays = isoDay(3);
  const out: Detected[] = [];

  const openTasks = await db
    .select()
    .from(tasks)
    .where(and(ne(tasks.status, "done"), ne(tasks.status, "cancelled")));

  for (const t of openTasks) {
    if (t.status === "blocked") {
      out.push({
        type: "task.blocked",
        title: `Task diblokir: ${t.title}`,
        urgency: "high",
        entityType: "task",
        entityId: t.id,
      });
      continue;
    }
    if (!t.deadline) continue;
    if (t.deadline < today) {
      out.push({
        type: "task.overdue",
        title: `Task terlambat: ${t.title}`,
        body: `Deadline ${t.deadline}`,
        urgency: "high",
        entityType: "task",
        entityId: t.id,
      });
    } else if (t.deadline <= inThreeDays) {
      out.push({
        type: "task.due_soon",
        title: `Deadline mendekat: ${t.title}`,
        body: `Deadline ${t.deadline}`,
        urgency: "medium",
        entityType: "task",
        entityId: t.id,
      });
    }
  }

  // WIP limit (PRD §22) — one notification, not one per task.
  const settings = await getSettings(["maxInProgressTasks"]);
  const wipLimit = Number(settings.maxInProgressTasks || 2);
  const inProgress = openTasks.filter((t) => t.status === "in_progress");
  if (wipLimit > 0 && inProgress.length >= wipLimit) {
    out.push({
      type: "wip.limit",
      title: `WIP limit tercapai (${inProgress.length}/${wipLimit})`,
      body: "Selesaikan pekerjaan berjalan sebelum memulai yang baru.",
      urgency: "medium",
      entityType: "setting",
      entityId: "00000000-0000-0000-0000-000000000000",
    });
  }

  const openQuotations = await db
    .select()
    .from(quotations)
    .where(inArray(quotations.status, ["sent", "viewed"]));
  for (const q of openQuotations) {
    if (q.validUntil && q.validUntil <= inThreeDays) {
      out.push({
        type: "quotation.expiring",
        title: `Quotation ${q.number} hampir kedaluwarsa`,
        body: `Berlaku s/d ${q.validUntil}`,
        urgency: q.validUntil < today ? "high" : "medium",
        entityType: "quotation",
        entityId: q.id,
      });
    }
  }

  const openInvoices = await db
    .select()
    .from(invoices)
    .where(inArray(invoices.status, ["sent", "partially_paid", "overdue"]));
  for (const inv of openInvoices) {
    if (!inv.dueDate) continue;
    const remaining = toNum(inv.total) - toNum(inv.paidAmount);
    if (remaining <= 0) continue;
    if (inv.dueDate < today) {
      out.push({
        type: "invoice.overdue",
        title: `Invoice ${inv.number} overdue`,
        body: `Jatuh tempo ${inv.dueDate}`,
        urgency: "high",
        entityType: "invoice",
        entityId: inv.id,
      });
    } else if (inv.dueDate <= inThreeDays) {
      out.push({
        type: "invoice.due_soon",
        title: `Invoice ${inv.number} jatuh tempo`,
        body: `Jatuh tempo ${inv.dueDate}`,
        urgency: "medium",
        entityType: "invoice",
        entityId: inv.id,
      });
    }
  }

  // Active projects with no update in 14 days.
  const stale = await db
    .select()
    .from(projects)
    .where(
      and(
        inArray(projects.status, ["in_progress", "approved", "client_review"]),
        isNull(projects.archivedAt),
        lt(projects.updatedAt, sql`now() - interval '14 days'`),
      ),
    );
  for (const p of stale) {
    out.push({
      type: "project.stale",
      title: `Proyek tanpa aktivitas: ${p.name}`,
      body: "Tidak ada pembaruan lebih dari 14 hari.",
      urgency: "low",
      entityType: "project",
      entityId: p.id,
    });
  }

  return out;
}

/** Insert newly-detected notifications that have no unread row yet. */
export async function syncNotifications(): Promise<void> {
  const detected = await detect();
  if (detected.length === 0) return;
  const unread = await db
    .select({
      type: notifications.type,
      entityId: notifications.entityId,
    })
    .from(notifications)
    .where(isNull(notifications.readAt));
  const seen = new Set(unread.map((n) => `${n.type}:${n.entityId}`));
  const fresh = detected.filter((d) => !seen.has(`${d.type}:${d.entityId}`));
  if (fresh.length === 0) return;
  await db.insert(notifications).values(fresh);
}

export async function unreadCount(): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(isNull(notifications.readAt));
  return rows[0]?.n ?? 0;
}

/**
 * Deep links keyed by notification id (PRD §31.3 "membuka data terkait").
 * Tasks and quotations live under their project, so their route needs a
 * projectId lookup — batched here rather than one query per row.
 */
export async function resolveNotificationHrefs(
  rows: { id: string; entityType: string | null; entityId: string | null }[],
): Promise<Record<string, string>> {
  const href: Record<string, string> = {};
  const taskIds = rows
    .filter((r) => r.entityType === "task" && r.entityId)
    .map((r) => r.entityId as string);
  const quotationIds = rows
    .filter((r) => r.entityType === "quotation" && r.entityId)
    .map((r) => r.entityId as string);

  const taskProject = new Map<string, string>();
  if (taskIds.length > 0) {
    const found = await db
      .select({ id: tasks.id, projectId: tasks.projectId })
      .from(tasks)
      .where(inArray(tasks.id, taskIds));
    for (const t of found) taskProject.set(t.id, t.projectId);
  }
  const quotationProject = new Map<string, string>();
  if (quotationIds.length > 0) {
    const found = await db
      .select({ id: quotations.id, projectId: quotations.projectId })
      .from(quotations)
      .where(inArray(quotations.id, quotationIds));
    for (const q of found) quotationProject.set(q.id, q.projectId);
  }

  for (const r of rows) {
    if (!r.entityId) continue;
    if (r.entityType === "invoice") href[r.id] = `/invoices/${r.entityId}`;
    else if (r.entityType === "project") href[r.id] = `/projects/${r.entityId}`;
    else if (r.entityType === "task") {
      const pid = taskProject.get(r.entityId);
      if (pid) href[r.id] = `/projects/${pid}/tasks/${r.entityId}`;
    } else if (r.entityType === "quotation") {
      const pid = quotationProject.get(r.entityId);
      if (pid) href[r.id] = `/projects/${pid}/quotations/${r.entityId}`;
    } else if (r.entityType === "setting") href[r.id] = "/settings/general";
  }
  return href;
}

export const notificationUrgency: Record<
  string,
  { label: string; tone: "gray" | "yellow" | "red" }
> = {
  low: { label: "Rendah", tone: "gray" },
  medium: { label: "Sedang", tone: "yellow" },
  high: { label: "Tinggi", tone: "red" },
};

export async function markNotificationRead(id: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(isNull(notifications.readAt));
}
