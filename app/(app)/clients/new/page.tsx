import { PageHeader } from "@/components/page-header";
import { ClientForm } from "@/components/forms/client-form";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Klien Baru"
        description="Simpan identitas klien sekali untuk dipakai di proyek dan dokumen."
      />
      <ClientForm action={createClient} submitLabel="Simpan Klien" />
    </div>
  );
}
