"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { DOC_NUMBER_TYPES, prefixKey } from "@/lib/numbering";
import { requireUser } from "@/lib/session";
import { setSettings } from "@/lib/settings";
import { numberingSchema, type NumberingInput } from "@/lib/validations";

export async function saveNumbering(
  values: NumberingInput,
): Promise<{ error: string } | { ok: true }> {
  const user = await requireUser();
  const parsed = numberingSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Prefixes only — sequences are never editable, so a number can't be reused
  // (PRD §33.5). Existing documents keep the number already stored on them.
  await setSettings(
    Object.fromEntries(
      DOC_NUMBER_TYPES.map((t) => [prefixKey(t), parsed.data[t]]),
    ),
  );

  await logActivity({
    userId: user.id,
    action: "numbering.saved",
    entityType: "setting",
  });
  revalidatePath("/settings/numbering");
  return { ok: true };
}
