import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export const GENERAL_KEYS = [
  "hourlyRate",
  "dailyRate",
  "defaultTaxPercent",
  "defaultDiscount",
  "riskReserve",
  "maxActiveProjects",
  "maxInProgressTasks",
  "maxDailyFocus",
  "workHoursPerDay",
];

/** Read a group of settings keys as a plain object of string values. */
export async function getSettings(
  keys: string[],
): Promise<Record<string, string>> {
  if (keys.length === 0) return {};
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, keys));
  const out: Record<string, string> = {};
  for (const r of rows) {
    if (r.value != null) out[r.key] = String(r.value);
  }
  return out;
}

/** Upsert a group of key/value settings (undefined values are skipped). */
export async function setSettings(
  values: Record<string, string | undefined>,
): Promise<void> {
  const entries = Object.entries(values).filter(([, v]) => v !== undefined);
  for (const [key, value] of entries) {
    await db
      .insert(settings)
      .values({ key, value: value as never })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: value as never, updatedAt: new Date() },
      });
  }
}
