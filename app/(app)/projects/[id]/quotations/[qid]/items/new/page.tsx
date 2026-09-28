import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { quotationSections, quotations } from "@/db/schema";
import { QuotationItemForm } from "@/components/forms/quotation-item-form";
import { PageHeader } from "@/components/page-header";
import { addQuotationItem } from "../../../actions";

export default async function NewQuotationItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; qid: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { id, qid } = await params;
  const { section } = await searchParams;
  if (!section) notFound();
  const [[quotation], [quotationSection]] = await Promise.all([
    db.select().from(quotations).where(and(eq(quotations.id, qid), eq(quotations.projectId, id))),
    db.select().from(quotationSections).where(and(eq(quotationSections.id, section), eq(quotationSections.quotationId, qid))),
  ]);
  if (!quotation || quotation.status !== "draft" || !quotationSection) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Item Quotation Baru" description={quotationSection.name} />
      <QuotationItemForm
        action={addQuotationItem.bind(null, id, qid, section)}
        submitLabel="Simpan Item"
      />
    </div>
  );
}
