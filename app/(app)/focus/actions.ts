"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { dailyFocusItems } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";

const DEFAULT_FOCUS = 3;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function focusLimit(): Promise<number> {
  const s = await getSettings(["maxDailyFocus"]);
  const n = Number(s.maxDailyFocus);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_FOCUS;
}

export async function addFocus(formData: FormData): Promise<void> {
  await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  if (!taskId) return;
  const date = today();

  const existing = await db
    .select({ id: dailyFocusItems.id, taskId: dailyFocusItems.taskId })
    .from(dailyFocusItems)
    .where(eq(dailyFocusItems.focusDate, date));
  if (existing.some((e) => e.taskId === taskId)) return; // already focused
  const limit = await focusLimit();
  if (existing.length >= limit) {
    redirect(`/focus?full=${limit}`);
  }
  await db.insert(dailyFocusItems).values({ taskId, focusDate: date });
  revalidatePath("/focus");
}

export async function removeFocus(itemId: string): Promise<void> {
  await requireUser();
  await db.delete(dailyFocusItems).where(eq(dailyFocusItems.id, itemId));
  revalidatePath("/focus");
}

export async function toggleFocusDone(
  itemId: string,
  done: boolean,
): Promise<void> {
  await requireUser();
  await db
    .update(dailyFocusItems)
    .set({ done })
    .where(eq(dailyFocusItems.id, itemId));
  revalidatePath("/focus");
}
