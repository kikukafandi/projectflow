import { PageHeader } from "@/components/page-header";
import { BankAccountForm } from "@/components/forms/bank-account-form";
import { createBankAccount } from "../actions";

export default function NewBankAccountPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Rekening Baru" />
      <BankAccountForm action={createBankAccount} submitLabel="Simpan Rekening" />
    </div>
  );
}
