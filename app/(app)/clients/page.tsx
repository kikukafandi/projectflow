import { desc } from "drizzle-orm";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { clientStatus, clientTypeLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));

  return (
    <>
      <PageHeader
        title="Clients"
        description="Kelola data klien agar dapat digunakan kembali pada proyek dan dokumen."
        actions={
          <Button asChild>
            <Link href="/clients/new">
              <Plus /> New Client
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada klien"
          description="Tambahkan klien pertama untuk mulai membuat proyek."
          action={
            <Button asChild>
              <Link href="/clients/new">
                <Plus /> Tambah Klien
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH>Nama</TH>
                  <TH>Jenis</TH>
                  <TH>Kontak</TH>
                  <TH>Kota</TH>
                  <TH>Status</TH>
                </tr>
              </THead>
              <tbody>
                {rows.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <Link
                        href={`/clients/${c.id}`}
                        className="font-medium text-ink hover:text-primary"
                      >
                        {c.name}
                      </Link>
                      {c.companyName && (
                        <div className="text-[13px] text-ink-muted">
                          {c.companyName}
                        </div>
                      )}
                    </TD>
                    <TD>
                      <Badge tone="cyan">{clientTypeLabels[c.type]}</Badge>
                    </TD>
                    <TD className="text-ink-secondary">
                      {c.email ?? c.whatsapp ?? c.phone ?? "—"}
                    </TD>
                    <TD className="text-ink-secondary">{c.city ?? "—"}</TD>
                    <TD>
                      <StatusBadge map={clientStatus} value={c.status} />
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {rows.map((c) => (
              <Link
                key={c.id}
                href={`/clients/${c.id}`}
                className="block rounded-[16px] border border-[#ECECE8] bg-surface p-4 shadow-[0_2px_8px_rgba(24,24,27,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{c.name}</div>
                    <div className="truncate text-[13px] text-ink-muted">
                      {c.companyName ?? clientTypeLabels[c.type]}
                    </div>
                  </div>
                  <StatusBadge map={clientStatus} value={c.status} />
                </div>
                <div className="mt-2 text-[13px] text-ink-secondary">
                  {c.email ?? c.whatsapp ?? c.phone ?? "—"}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
