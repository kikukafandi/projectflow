import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ScopeFeatureForm } from "@/components/forms/scope-feature-form";
import { addManualFeature } from "../../actions";

export default async function NewScopeFeaturePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ module?: string }>;
}) {
  const { id } = await params;
  const { module } = await searchParams;
  if (!module) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Fitur Scope Baru" />
      <ScopeFeatureForm
        action={addManualFeature.bind(null, id, module)}
        submitLabel="Simpan Fitur"
      />
    </div>
  );
}
