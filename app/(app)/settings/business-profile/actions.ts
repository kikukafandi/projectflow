"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { businessProfiles } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/session";
import {
  businessProfileSchema,
  type BusinessProfileInput,
} from "@/lib/validations";

type Result = { error: string } | { ok: true };

export async function saveBusinessProfile(
  values: BusinessProfileInput,
): Promise<Result> {
  const user = await requireUser();
  const parsed = businessProfileSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [existing] = await db.select().from(businessProfiles).limit(1);
  if (existing) {
    await db
      .update(businessProfiles)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(businessProfiles.id, existing.id));
  } else {
    await db.insert(businessProfiles).values(parsed.data);
  }

  await logActivity({
    userId: user.id,
    action: "business_profile.saved",
    entityType: "business_profile",
  });
  revalidatePath("/settings/business-profile");
  return { ok: true };
}
