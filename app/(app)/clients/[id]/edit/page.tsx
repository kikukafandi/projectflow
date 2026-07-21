import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { ClientForm } from "@/components/forms/client-form";
import type { ClientInput } from "@/lib/validations";
import { updateClient } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  if (!client) notFound();

  // null -> undefined so the form inputs stay controlled
  const defaults: Partial<ClientInput> = {
    type: client.type,
    status: client.status,
    name: client.name,
    companyName: client.companyName ?? undefined,
    email: client.email ?? undefined,
    whatsapp: client.whatsapp ?? undefined,
    phone: client.phone ?? undefined,
    address: client.address ?? undefined,
    city: client.city ?? undefined,
    province: client.province ?? undefined,
    postalCode: client.postalCode ?? undefined,
    npwp: client.npwp ?? undefined,
    picName: client.picName ?? undefined,
    picRole: client.picRole ?? undefined,
    notes: client.notes ?? undefined,
  };

  const action = updateClient.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Klien" description={client.name} />
      <ClientForm
        action={action}
        defaultValues={defaults}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
