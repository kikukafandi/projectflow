import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { files } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { addProjectFile, deleteProjectFile } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProjectFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await db
    .select()
    .from(files)
    .where(and(eq(files.entityType, "project"), eq(files.entityId, id)))
    .orderBy(desc(files.createdAt));

  return (
    <>
      <Link
        href={`/projects/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Proyek
      </Link>
      <PageHeader
        title="Files"
        description="Tautan berkas proyek (brief, aset, kontrak). Tempel URL berkas."
      />

      <Card className="mb-4">
        <CardContent>
          <form
            action={addProjectFile.bind(null, id)}
            className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]"
          >
            <Input name="name" placeholder="Nama berkas…" required />
            <Input name="url" type="url" placeholder="https://…" required />
            <Button type="submit">
              <Plus className="size-4" /> Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada berkas"
          description="Tambahkan tautan berkas lewat form di atas."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((f) => (
            <Card key={f.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-primary"
                  >
                    <FileText className="size-4 shrink-0 text-ink-muted" />
                    <span className="truncate">{f.name}</span>
                    <ExternalLink className="size-3.5 shrink-0 text-ink-muted" />
                  </a>
                  <div className="truncate text-[12px] text-ink-muted">
                    {f.url} · {formatDate(f.createdAt)}
                  </div>
                </div>
                <form action={deleteProjectFile.bind(null, id, f.id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label="Hapus berkas"
                    className="text-danger hover:bg-danger-soft"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
