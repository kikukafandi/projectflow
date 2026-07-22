import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { businessBankAccounts, invoices } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { PaymentForm } from "@/components/forms/payment-form";
import { toNum } from "@/lib/money";
import { formatIDR } from "@/lib/utils";
import { addPayment } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function NewPaymentPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
  if (!inv) notFound();

  const banks = await db.select().from(businessBankAccounts);
  const remaining = toNum(inv.total) - toNum(inv.paidAmount);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Catat Pembayaran"
        description={`${inv.number} · Sisa tagihan ${formatIDR(remaining)}`}
      />
      <PaymentForm
        banks={banks.map((b) => ({ id: b.id, label: `${b.bankName} · ${b.accountNumber}` }))}
        remaining={remaining}
        action={addPayment.bind(null, invoiceId)}
      />
    </div>
  );
}
