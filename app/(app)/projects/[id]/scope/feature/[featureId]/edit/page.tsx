import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projectFeatures } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { ScopeFeatureForm } from "@/components/forms/scope-feature-form";
import type { ScopeFeatureInput } from "@/lib/validations";
import { updateScopeFeature } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditScopeFeaturePage({
  params,
}: {
  params: Promise<{ id: string; featureId: string }>;
}) {
  const { id, featureId } = await params;
  const [f] = await db
    .select()
    .from(projectFeatures)
    .where(eq(projectFeatures.id, featureId));
  if (!f) notFound();

  const defaults: Partial<ScopeFeatureInput> = {
    name: f.name,
    description: f.description ?? undefined,
    quantity: f.quantity ?? "1",
    unit: f.unit ?? undefined,
    estimateHours: f.estimateHours ?? undefined,
    unitPrice: f.unitPrice ?? "0",
    complexity: f.complexity ?? "medium",
    status: f.status,
    notes: f.notes ?? undefined,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Fitur Scope" description={f.name} />
      <ScopeFeatureForm
        action={updateScopeFeature.bind(null, id, featureId)}
        defaultValues={defaults}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
