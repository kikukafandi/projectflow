"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { setSettings } from "@/lib/settings";
import {
  generalSettingsSchema,
  type GeneralSettingsInput,
} from "@/lib/validations";

export async function saveGeneralSettings(
  values: GeneralSettingsInput,
): Promise<{ error: string } | { ok: true }> {
  await requireUser();
  const parsed = generalSettingsSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await setSettings(parsed.data as Record<string, string | undefined>);
  revalidatePath("/settings/general");
  return { ok: true };
}
