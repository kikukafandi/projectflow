import { asc, eq, ne } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Select } from "@/components/ui/input";
import { Users } from "lucide-react";
import { createManualInvoice } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const [clientOpts, projectOpts] = await Promise.all([
    db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(ne(clients.status, "archived"))
      .orderBy(asc(clients.name)),
    db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .orderBy(asc(projects.name)),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Invoice Manual" description="Item ditambahkan setelah invoice dibuat." />
      {clientOpts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada klien"
          description="Buat klien terlebih dahulu."
          action={
            <Button asChild>
              <Link href="/clients/new">Tambah Klien</Link>
            </Button>
          }
        />
      ) : (
        <form action={createManualInvoice}>
          <Card>
            <CardContent className="space-y-4">
              <Field label="Klien" htmlFor="clientId" required>
                <Select id="clientId" name="clientId" required>
                  <option value="">Pilih klien…</option>
                  {clientOpts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Proyek (opsional)" htmlFor="projectId">
                <Select id="projectId" name="projectId">
                  <option value="">—</option>
                  {projectOpts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </Field>
            </CardContent>
          </Card>
          <div className="mt-4">
            <Button type="submit">Buat Invoice</Button>
          </div>
        </form>
      )}
    </div>
  );
}
