import { PageHeader } from "@/components/page-header";
import { CategoryForm } from "@/components/forms/category-form";
import { createCategory } from "../../actions";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Kategori Baru" />
      <CategoryForm action={createCategory} submitLabel="Simpan Kategori" />
    </div>
  );
}
