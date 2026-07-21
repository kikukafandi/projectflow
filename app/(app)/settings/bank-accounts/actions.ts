"use server";

import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businessBankAccounts } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { bankAccountSchema, type BankAccountInput } from "@/lib/validations";

type Result = { error: string } | void;

async function clearPrimary(exceptId?: string) {
  await db
    .update(businessBankAccounts)
    .set({ isPrimary: false })
    .where(
      exceptId
        ? ne(businessBankAccounts.id, exceptId)
        : ne(businessBankAccounts.id, "00000000-0000-0000-0000-000000000000"),
    );
}

export async function createBankAccount(
  values: BankAccountInput,
): Promise<Result> {
  await requireUser();
  const parsed = bankAccountSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [row] = await db
    .insert(businessBankAccounts)
    .values(parsed.data)
    .returning({ id: businessBankAccounts.id });
  if (parsed.data.isPrimary) await clearPrimary(row.id);

  revalidatePath("/settings/bank-accounts");
  redirect("/settings/bank-accounts");
}

export async function updateBankAccount(
  id: string,
  values: BankAccountInput,
): Promise<Result> {
  await requireUser();
  const parsed = bankAccountSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(businessBankAccounts)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(businessBankAccounts.id, id));
  if (parsed.data.isPrimary) await clearPrimary(id);

  revalidatePath("/settings/bank-accounts");
  redirect("/settings/bank-accounts");
}

export async function setPrimaryBankAccount(id: string): Promise<void> {
  await requireUser();
  await clearPrimary(id);
  await db
    .update(businessBankAccounts)
    .set({ isPrimary: true, updatedAt: new Date() })
    .where(eq(businessBankAccounts.id, id));
  revalidatePath("/settings/bank-accounts");
}

export async function deleteBankAccount(id: string): Promise<void> {
  await requireUser();
  await db
    .delete(businessBankAccounts)
    .where(eq(businessBankAccounts.id, id));
  revalidatePath("/settings/bank-accounts");
}
