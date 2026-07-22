import { PageHeader } from "@/components/page-header";
import { PaymentTermForm } from "@/components/forms/payment-term-form";
import { addPaymentTerm } from "../../../actions";

export default async function NewPaymentTermPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Termin Pembayaran Baru"
        description="Nominal dihitung otomatis dari persentase bila dikosongkan."
      />
      <PaymentTermForm
        action={addPaymentTerm.bind(null, id, qid)}
        submitLabel="Simpan Termin"
      />
    </div>
  );
}
