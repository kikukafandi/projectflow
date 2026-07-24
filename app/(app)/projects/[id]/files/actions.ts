"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { files } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/session";

/**
 * Daftarkan file untuk sebuah proyek lewat URL (tabel `files` menyimpan URL, bukan
 * blob). Upload langsung ke object storage menyusul saat Vercel Blob disiapkan.
 */
export async function addProjectFile(
  projectId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  // Hanya terima URL http(s) yang valid — cegah javascript:/data: dan input asal.
  let ok = false;
  try {
    ok = ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    ok = false;
  }
  if (!name || !ok) return;

  await db.insert(files).values({
    name,
    url,
    entityType: "project",
    entityId: projectId,
  });
  await logActivity({
    userId: user.id,
    action: "file.added",
    entityType: "project",
    entityId: projectId,
    note: name,
  });
  revalidatePath(`/projects/${projectId}/files`);
}

export async function deleteProjectFile(
  projectId: string,
  fileId: string,
): Promise<void> {
  await requireUser();
  await db
    .delete(files)
    .where(and(eq(files.id, fileId), eq(files.entityId, projectId)));
  revalidatePath(`/projects/${projectId}/files`);
}
