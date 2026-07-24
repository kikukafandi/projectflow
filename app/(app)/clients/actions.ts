"use server";

import { count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clients, invoices, projects } from "@/db/schema";
import { logActivity } from "@/lib/activity";
import { isAdmin, requireUser } from "@/lib/session";
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

export async function unarchiveClient(id: string): Promise<void> {
  const user = await requireUser();
  await db
    .update(clients)
    .set({ status: "active", archivedAt: null, updatedAt: new Date() })
    .where(eq(clients.id, id));
  await logActivity({
    userId: user.id,
    action: "client.unarchived",
    entityType: "client",
    entityId: id,
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
}

/**
 * Hard delete, for clearing out trial data. Only allowed while the client has
 * no project and no invoice — those FKs are `restrict`, and PRD §37.7 keeps
 * transactional data around. Anything attached falls back to archiving, which
 * is the same "void instead of delete" idiom used by `deleteInvoice`.
 */
export async function deleteClient(id: string): Promise<void> {
  const user = await requireUser();
  const [{ n: projectCount }] = await db
    .select({ n: count() })
    .from(projects)
    .where(eq(projects.clientId, id));
  const [{ n: invoiceCount }] = await db
    .select({ n: count() })
    .from(invoices)
    .where(eq(invoices.clientId, id));

  if (projectCount > 0 || invoiceCount > 0) {
    await db
      .update(clients)
      .set({ status: "archived", archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(clients.id, id));
    revalidatePath("/clients");
    redirect(`/clients/${id}?archived=1`);
  }

  await db.delete(clients).where(eq(clients.id, id));
  await logActivity({
    userId: user.id,
    action: "client.deleted",
    entityType: "client",
    entityId: id,
  });
  revalidatePath("/clients");
  redirect("/clients");
}

/**
 * Hapus paksa: buang klien beserta SELURUH proyek & invoice-nya (menembus guard
 * arsip). Hanya untuk admin (ADMIN_EMAILS). Urutan bottom-up menembus FK RESTRICT
 * receipt→payment→invoice; hapus proyek meng-cascade RAB/scope/quotation/task.
 * ponytail: hapus berurutan (neon-http tanpa transaksi interaktif). Kalau butuh
 * atomik penuh, bungkus dalam db.transaction saat pindah ke driver yang mendukung.
 */
export async function forceDeleteClient(id: string): Promise<void> {
  const user = await requireUser();
  if (!isAdmin(user)) redirect(`/clients/${id}`);

  await db.execute(
    sql`DELETE FROM receipts r USING payments p, invoices i WHERE r.payment_id = p.id AND p.invoice_id = i.id AND i.client_id = ${id}::uuid`,
  );
  await db.execute(
    sql`DELETE FROM payments p USING invoices i WHERE p.invoice_id = i.id AND i.client_id = ${id}::uuid`,
  );
  await db.execute(
    sql`DELETE FROM invoice_items ii USING invoices i WHERE ii.invoice_id = i.id AND i.client_id = ${id}::uuid`,
  );
  await db.delete(invoices).where(eq(invoices.clientId, id));
  await db.delete(projects).where(eq(projects.clientId, id));
  await db.delete(clients).where(eq(clients.id, id));
  await logActivity({
    userId: user.id,
    action: "client.force_deleted",
    entityType: "client",
    entityId: id,
  });
  revalidatePath("/clients");
  redirect("/clients");
}
