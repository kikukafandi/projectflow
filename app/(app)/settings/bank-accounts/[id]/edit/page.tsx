import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { businessBankAccounts } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { BankAccountForm } from "@/components/forms/bank-account-form";
import type { BankAccountInput } from "@/lib/validations";
import { updateBankAccount } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBankAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(businessBankAccounts)
    .where(eq(businessBankAccounts.id, id));
  if (!row) notFound();

  const defaults: Partial<BankAccountInput> = {
    bankName: row.bankName,
    accountNumber: row.accountNumber,
    accountHolder: row.accountHolder,
    branch: row.branch ?? undefined,
    isPrimary: row.isPrimary,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Rekening" description={row.bankName} />
      <BankAccountForm
        action={updateBankAccount.bind(null, id)}
        defaultValues={defaults}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
