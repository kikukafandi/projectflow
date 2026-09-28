import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { quotationItems, quotationSections, quotations } from "@/db/schema";
import { QuotationItemForm } from "@/components/forms/quotation-item-form";
import { PageHeader } from "@/components/page-header";
import type { QuotationItemInput } from "@/lib/validations";
import { updateQuotationItem } from "../../../../actions";

export default async function EditQuotationItemPage({
  params,
}: {
  params: Promise<{ id: string; qid: string; itemId: string }>;
}) {
  const { id, qid, itemId } = await params;
  const [row] = await db
    .select({ item: quotationItems, section: quotationSections, quotation: quotations })
    .from(quotationItems)
    .innerJoin(quotationSections, eq(quotationItems.sectionId, quotationSections.id))
    .innerJoin(quotations, eq(quotationSections.quotationId, quotations.id))
    .where(and(eq(quotationItems.id, itemId), eq(quotations.id, qid), eq(quotations.projectId, id)));
  if (!row || row.quotation.status !== "draft") notFound();

  const defaults: Partial<QuotationItemInput> = {
    name: row.item.name,
    description: row.item.description ?? undefined,
    quantity: row.item.quantity ?? "1",
    unit: row.item.unit ?? undefined,
    unitPrice: row.item.unitPrice ?? "0",
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Item Quotation" description={row.item.name} />
      <QuotationItemForm
        action={updateQuotationItem.bind(null, id, qid, itemId)}
        defaultValues={defaults}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
