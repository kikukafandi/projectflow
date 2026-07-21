import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { RabItemForm } from "@/components/forms/rab-item-form";
import { addRabItem } from "../../../actions";

export default async function NewRabItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; rabId: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { id, rabId } = await params;
  const { section } = await searchParams;
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Item RAB Baru" />
      <RabItemForm
        action={addRabItem.bind(null, id, rabId, section)}
        submitLabel="Simpan Item"
      />
    </div>
  );
}
