import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { featureItems } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { FeatureItemForm } from "@/components/forms/feature-item-form";
import type { FeatureItemInput } from "@/lib/validations";
import { updateFeatureItem } from "../../../../../actions";

export const dynamic = "force-dynamic";

export default async function EditFeaturePage({
  params,
}: {
  params: Promise<{ id: string; featureId: string }>;
}) {
  const { id, featureId } = await params;
  const [f] = await db
    .select()
    .from(featureItems)
    .where(eq(featureItems.id, featureId));
  if (!f) notFound();

  const defaults: Partial<FeatureItemInput> = {
    name: f.name,
    description: f.description ?? undefined,
    estimateHours: f.estimateHours ?? undefined,
    fixedPrice: f.fixedPrice ?? undefined,
    hourlyRate: f.hourlyRate ?? undefined,
    unit: f.unit ?? undefined,
    defaultQuantity: f.defaultQuantity ?? undefined,
    pricingMethod: f.pricingMethod ?? "fixed",
    complexity: f.complexity ?? "medium",
    defaultPriority: f.defaultPriority ?? "medium",
    definitionOfDone: f.definitionOfDone ?? undefined,
    isActive: f.isActive,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Fitur" description={f.name} />
      <FeatureItemForm
        action={updateFeatureItem.bind(null, featureId, id)}
        defaultValues={defaults}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
