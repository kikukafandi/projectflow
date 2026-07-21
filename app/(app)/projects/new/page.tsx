import { asc, ne } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/forms/project-form";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { createProject } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const options = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(ne(clients.status, "archived"))
    .orderBy(asc(clients.name));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Proyek Baru"
        description="Setiap proyek terhubung ke satu klien."
      />
      {options.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada klien"
          description="Buat klien terlebih dahulu sebelum membuat proyek."
          action={
            <Button asChild>
              <Link href="/clients/new">Tambah Klien</Link>
            </Button>
          }
        />
      ) : (
        <ProjectForm
          clients={options}
          defaultValues={clientId ? { clientId } : undefined}
          action={createProject}
          submitLabel="Simpan Proyek"
        />
      )}
    </div>
  );
}
