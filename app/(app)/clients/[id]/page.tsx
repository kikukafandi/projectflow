import { desc, eq } from "drizzle-orm";
import { Archive, FolderKanban, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  clientStatus,
  clientTypeLabels,
  projectStatus,
} from "@/lib/labels";
import { formatIDR } from "@/lib/utils";
import { archiveClient } from "../actions";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-0 sm:flex-row sm:items-center">
      <span className="w-40 shrink-0 text-[13px] text-ink-muted">{label}</span>
      <span className="text-sm text-ink">{value || "—"}</span>
    </div>
  );
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  if (!client) notFound();

  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, id))
    .orderBy(desc(projects.createdAt));

  const archive = archiveClient.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={client.name}
        description={client.companyName ?? clientTypeLabels[client.type]}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/clients/${id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            {client.status !== "archived" && (
              <form action={archive}>
                <Button type="submit" variant="ghost">
                  <Archive /> Arsipkan
                </Button>
              </form>
            )}
          </>
        }
      />

      <div className="mb-3 flex items-center gap-2">
        <StatusBadge map={clientStatus} value={client.status} />
        <Badge tone="cyan">{clientTypeLabels[client.type]}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <CardTitle className="mb-2">Kontak</CardTitle>
            <Row label="Email" value={client.email} />
            <Row label="WhatsApp" value={client.whatsapp} />
            <Row label="Telepon" value={client.phone} />
            <Row label="PIC" value={client.picName} />
            <Row label="Jabatan PIC" value={client.picRole} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <CardTitle className="mb-2">Alamat & Pajak</CardTitle>
            <Row label="Alamat" value={client.address} />
            <Row label="Kota" value={client.city} />
            <Row label="Provinsi" value={client.province} />
            <Row label="Kode Pos" value={client.postalCode} />
            <Row label="NPWP" value={client.npwp} />
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card className="mt-4">
          <CardContent>
            <CardTitle className="mb-2">Catatan</CardTitle>
            <p className="whitespace-pre-wrap text-sm text-ink-secondary">
              {client.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle>Riwayat Proyek</CardTitle>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/projects/new?clientId=${id}`}>
                <FolderKanban /> Proyek Baru
              </Link>
            </Button>
          </div>
          {clientProjects.length === 0 ? (
            <p className="py-4 text-sm text-ink-muted">
              Belum ada proyek untuk klien ini.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {clientProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:text-primary"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {p.name}
                      </div>
                      <div className="text-[13px] text-ink-muted">{p.code}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular hidden text-[13px] text-ink-secondary sm:inline">
                        {formatIDR(p.projectValue)}
                      </span>
                      <StatusBadge map={projectStatus} value={p.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
