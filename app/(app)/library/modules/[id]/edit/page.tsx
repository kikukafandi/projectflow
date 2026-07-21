import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { featureCategories, featureModules } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { ModuleForm } from "@/components/forms/module-form";
import type { ModuleInput } from "@/lib/validations";
import { updateModule } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [m] = await db
    .select()
    .from(featureModules)
    .where(eq(featureModules.id, id));
  if (!m) notFound();

  const categories = await db
    .select({ id: featureCategories.id, name: featureCategories.name })
    .from(featureCategories)
    .orderBy(asc(featureCategories.name));

  const defaults: Partial<ModuleInput> = {
    categoryId: m.categoryId ?? undefined,
    name: m.name,
    description: m.description ?? undefined,
    defaultEstimateHours: m.defaultEstimateHours ?? undefined,
    defaultPrice: m.defaultPrice ?? undefined,
    complexity: m.complexity ?? "medium",
    isActive: m.isActive,
    notes: m.notes ?? undefined,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Modul" description={m.name} />
      <ModuleForm
        categories={categories}
        defaultValues={defaults}
        action={updateModule.bind(null, id)}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
