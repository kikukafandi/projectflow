import { db } from "@/db";
import { activityLogs } from "@/db/schema";

/** Record an activity log entry (PRD §32). Never stores secrets. */
export async function logActivity(entry: {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  note?: string;
}) {
  try {
    await db.insert(activityLogs).values({
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      before: entry.before as never,
      after: entry.after as never,
      note: entry.note,
    });
  } catch {
    // ponytail: logging must never break the main action; swallow log failures
  }
}
