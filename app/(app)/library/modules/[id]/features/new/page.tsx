import { PageHeader } from "@/components/page-header";
import { FeatureItemForm } from "@/components/forms/feature-item-form";
import { createFeatureItem } from "../../../../actions";

export default async function NewFeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Fitur Baru" />
      <FeatureItemForm
        action={createFeatureItem.bind(null, id)}
        submitLabel="Simpan Fitur"
      />
    </div>
  );
}
