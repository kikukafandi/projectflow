import { eq } from "drizzle-orm";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { documentSequences } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { NumberingForm } from "@/components/forms/numbering-form";
import {
  DOC_NUMBER_TYPES,
  docNumberLabels,
  formatDocumentNumber,
  getPrefixes,
} from "@/lib/numbering";
import type { NumberingInput } from "@/lib/validations";
import { saveNumbering } from "./actions";

export const dynamic = "force-dynamic";

export default async function NumberingSettingsPage() {
  const year = new Date().getFullYear();
  const [prefixes, sequences] = await Promise.all([
    getPrefixes(),
    db
      .select()
      .from(documentSequences)
      .where(eq(documentSequences.year, year)),
  ]);

  const usedOf = (docType: string) =>
    sequences.find((s) => s.docType === docType)?.lastSequence ?? 0;

  const nextSequence = Object.fromEntries(
    DOC_NUMBER_TYPES.map((t) => [t, usedOf(t) + 1]),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/settings"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader
        title="Numbering"
        description="Format nomor dokumen: PREFIX/TAHUN/URUTAN (PRD §33.4)."
      />

      <div className="mb-4 flex items-start gap-2 rounded-[12px] bg-info-soft px-3 py-2 text-[13px] text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Hanya prefix yang bisa diubah. Nomor urut tidak dapat diedit agar tidak
          ada nomor yang terpakai dua kali, dan dokumen lama tetap memakai nomor
          yang sudah tersimpan.
        </span>
      </div>

      <NumberingForm
        defaultValues={prefixes as NumberingInput}
        nextSequence={nextSequence}
        action={saveNumbering}
      />

      <section className="mt-6">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-muted">
          Urutan tahun {year}
        </h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead>
                <tr>
                  <TH>Dokumen</TH>
                  <TH className="text-right">Sudah dipakai</TH>
                  <TH>Nomor terakhir</TH>
                  <TH>Nomor berikutnya</TH>
                </tr>
              </THead>
              <tbody>
                {DOC_NUMBER_TYPES.map((t) => {
                  const used = usedOf(t);
                  return (
                    <TR key={t}>
                      <TD>{docNumberLabels[t]}</TD>
                      <TD className="tabular text-right">{used}</TD>
                      <TD className="tabular text-ink-secondary">
                        {used > 0
                          ? formatDocumentNumber(prefixes[t], year, used)
                          : "—"}
                      </TD>
                      <TD className="tabular text-ink-secondary">
                        {formatDocumentNumber(prefixes[t], year, used + 1)}
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
