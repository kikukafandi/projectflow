"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { documentSequences } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import {
  DOC_NUMBER_TYPES,
  type DocNumberType,
  prefixKey,
} from "@/lib/numbering";
import { isAdmin, requireUser } from "@/lib/session";
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

/**
 * Reset counter satu tipe dokumen untuk tahun berjalan ke 0 → dokumen berikutnya
 * mulai dari /001 lagi. Hanya admin (ADMIN_EMAILS). Sengaja dibatasi karena reset
 * bisa memicu nomor kembar bila masih ada dokumen lama memakai nomor itu — aman
 * dipakai setelah data dokumen dibersihkan.
 */
export async function resetSequence(docType: string): Promise<void> {
  const user = await requireUser();
  if (!isAdmin(user)) redirect("/settings/numbering");
  if (!DOC_NUMBER_TYPES.includes(docType as DocNumberType)) {
    redirect("/settings/numbering");
  }

  const year = new Date().getFullYear();
  await db
    .update(documentSequences)
    .set({ lastSequence: 0, updatedAt: new Date() })
    .where(
      and(
        eq(documentSequences.docType, docType),
        eq(documentSequences.year, year),
      ),
    );

  await logActivity({
    userId: user.id,
    action: "numbering.reset",
    entityType: "setting",
    entityId: docType,
  });
  revalidatePath("/settings/numbering");
}
