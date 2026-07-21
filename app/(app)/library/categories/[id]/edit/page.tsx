import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { featureCategories } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { CategoryForm } from "@/components/forms/category-form";
import { deleteCategory, updateCategory } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(featureCategories)
    .where(eq(featureCategories.id, id));
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Edit Kategori" description={row.name} />
      <CategoryForm
        action={updateCategory.bind(null, id)}
        defaultValues={{ name: row.name, isActive: row.isActive }}
        submitLabel="Simpan Perubahan"
        onDelete={deleteCategory.bind(null, id)}
      />
    </div>
  );
}
