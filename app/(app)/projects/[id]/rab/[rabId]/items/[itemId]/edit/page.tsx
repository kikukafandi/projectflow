import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { rabItems } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { RabItemForm } from "@/components/forms/rab-item-form";
import type { RabItemInput } from "@/lib/validations";
import { updateRabItem } from "../../../../actions";

export const dynamic = "force-dynamic";

export default async function EditRabItemPage({
  params,
}: {
  params: Promise<{ id: string; rabId: string; itemId: string }>;
}) {
  const { id, rabId, itemId } = await params;
  const [it] = await db.select().from(rabItems).where(eq(rabItems.id, itemId));
  if (!it) notFound();

  const defaults: Partial<RabItemInput> = {
    name: it.name,
    description: it.description ?? undefined,
    quantity: it.quantity ?? "1",
    unit: it.unit ?? undefined,
    unitPrice: it.unitPrice ?? "0",
    weight: it.weight ?? undefined,
    estimateHours: it.estimateHours ?? undefined,
    notes: it.notes ?? undefined,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Item RAB" description={it.name} />
      <RabItemForm
        action={updateRabItem.bind(null, id, rabId, itemId)}
        defaultValues={defaults}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
