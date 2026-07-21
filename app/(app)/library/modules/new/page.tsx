import { asc } from "drizzle-orm";
import { db } from "@/db";
import { featureCategories } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { ModuleForm } from "@/components/forms/module-form";
import { createModule } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewModulePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await db
    .select({ id: featureCategories.id, name: featureCategories.name })
    .from(featureCategories)
    .orderBy(asc(featureCategories.name));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Modul Baru" description="Kumpulan fitur yang dapat dipakai ulang." />
      <ModuleForm
        categories={categories}
        defaultValues={category ? { categoryId: category } : undefined}
        action={createModule}
        submitLabel="Simpan Modul"
      />
    </div>
  );
}
