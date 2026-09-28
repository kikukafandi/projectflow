import { and, desc, eq, isNotNull } from "drizzle-orm";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, quotations, rabs } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { quotationStatus } from "@/lib/labels";
import { toNum } from "@/lib/money";
import { formatDate, formatIDR } from "@/lib/utils";
import { generateQuotationFromRab } from "./actions";

export const dynamic = "force-dynamic";

export default async function QuotationListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const [rows, rabList] = await Promise.all([
    db
      .select()
      .from(quotations)
      .where(eq(quotations.projectId, id))
      .orderBy(desc(quotations.createdAt)),
    db
      // Hanya RAB final (bernomor) yang bisa dijadikan quotation; draft internal disaring.
      .select({ id: rabs.id, number: rabs.number })
      .from(rabs)
      .where(and(eq(rabs.projectId, id), isNotNull(rabs.number)))
      .orderBy(desc(rabs.createdAt)),
  ]);

  const generate = generateQuotationFromRab.bind(null, id);
  const generateForm =
    rabList.length > 0 ? (
      <form action={generate} className="flex items-center gap-2">
        <Select name="rabId" className="h-[42px] w-auto">
          {rabList.map((r) => (
            <option key={r.id} value={r.id}>
              {r.number}
            </option>
          ))}
        </Select>
        <Button type="submit">Generate Quotation</Button>
      </form>
    ) : null;

  return (
    <>
      <Link
        href={`/projects/${id}`}
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> {project.name}
      </Link>
      <PageHeader
        title="Quotations"
        description="Dokumen penawaran untuk klien, dibuat dari RAB."
        actions={generateForm}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada quotation"
          description={
            rabList.length > 0
              ? "Pilih RAB lalu generate quotation."
              : "Buat RAB terlebih dahulu untuk membuat quotation."
          }
          action={
            rabList.length === 0 ? (
              <Button asChild variant="secondary">
                <Link href={`/projects/${id}/rab`}>Buka RAB</Link>
              </Button>
            ) : (
              generateForm
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end gap-2 text-sm">
            <span className="text-ink-muted">Subtotal</span>
            <span className="tabular font-semibold text-ink">
              {formatIDR(rows.reduce((sum, q) => sum + toNum(q.grandTotal), 0))}
            </span>
          </div>
          {rows.map((q) => (
            <Link key={q.id} href={`/projects/${id}/quotations/${q.id}`}>
              <Card className="transition-shadow hover:shadow-[0_4px_14px_rgba(24,24,27,0.06)]">
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{q.number}</span>
                      <StatusBadge map={quotationStatus} value={q.status} />
                    </div>
                    <div className="text-[13px] text-ink-muted">
                      Berlaku s/d {formatDate(q.validUntil)} ·{" "}
                      {formatDate(q.createdAt)}
                    </div>
                  </div>
                  <span className="tabular text-lg font-semibold text-primary">
                    {formatIDR(q.grandTotal)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
