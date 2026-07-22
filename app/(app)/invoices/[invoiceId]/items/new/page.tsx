import { PageHeader } from "@/components/page-header";
import { InvoiceItemForm } from "@/components/forms/invoice-item-form";
import { addInvoiceItem } from "../../../actions";

export default async function NewInvoiceItemPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Item Invoice Baru" />
      <InvoiceItemForm
        action={addInvoiceItem.bind(null, invoiceId)}
        submitLabel="Simpan Item"
      />
    </div>
  );
}
