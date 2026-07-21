"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { requireUser } from "@/lib/session";
import { clientSchema, type ClientInput } from "@/lib/validations";

type Result = { error: string } | void;

export async function createClient(values: ClientInput): Promise<Result> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [row] = await db
    .insert(clients)
    .values(parsed.data)
    .returning({ id: clients.id });

  await logActivity({
    userId: user.id,
    action: "client.created",
    entityType: "client",
    entityId: row.id,
    after: parsed.data,
  });
  revalidatePath("/clients");
  redirect(`/clients/${row.id}`);
}

export async function updateClient(
  id: string,
  values: ClientInput,
): Promise<Result> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(clients)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(clients.id, id));

  await logActivity({
    userId: user.id,
    action: "client.updated",
    entityType: "client",
    entityId: id,
    after: parsed.data,
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function archiveClient(id: string): Promise<void> {
  const user = await requireUser();
  await db
    .update(clients)
    .set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(clients.id, id));
  await logActivity({
    userId: user.id,
    action: "client.archived",
    entityType: "client",
    entityId: id,
  });
  revalidatePath("/clients");
  redirect("/clients");
}
