import { sql } from "drizzle-orm";
import { db } from "@/db";
import { documentSequences } from "@/db/schema";
import { getSettings } from "@/lib/settings";

export const DOC_NUMBER_TYPES = [
  "project",
  "rab",
  "quotation",
  "invoice",
  "receipt",
] as const;

export type DocNumberType = (typeof DOC_NUMBER_TYPES)[number];

/** Defaults per PRD §33.4. Overridable in Settings > Numbering. */
export const defaultPrefixes: Record<DocNumberType, string> = {
  project: "PRJ",
  rab: "RAB",
  quotation: "QT",
  invoice: "INV",
  receipt: "RCP",
};

export const docNumberLabels: Record<DocNumberType, string> = {
  project: "Proyek",
  rab: "RAB",
  quotation: "Quotation",
  invoice: "Invoice",
  receipt: "Kuitansi",
};

/** Settings key holding the prefix for a document type. */
export function prefixKey(docType: DocNumberType): string {
  return `numbering.${docType}`;
}

/** Configured prefixes, falling back to the PRD defaults. */
export async function getPrefixes(): Promise<Record<DocNumberType, string>> {
  const stored = await getSettings(DOC_NUMBER_TYPES.map(prefixKey));
  const out = { ...defaultPrefixes };
  for (const t of DOC_NUMBER_TYPES) {
    const v = stored[prefixKey(t)]?.trim();
    if (v) out[t] = v;
  }
  return out;
}

export function formatDocumentNumber(
  prefix: string,
  year: number,
  sequence: number,
): string {
  return `${prefix}/${year}/${String(sequence).padStart(3, "0")}`;
}

/**
 * Atomically reserve the next document number, e.g. "PRJ/2026/001".
 * Increment happens in a single upsert statement (safe on Neon HTTP driver),
 * so a number is never handed out twice (PRD §33.5).
 */
export async function nextDocumentNumber(
  docType: DocNumberType,
): Promise<string> {
  const year = new Date().getFullYear();
  const [row] = await db
    .insert(documentSequences)
    .values({ docType, year, lastSequence: 1 })
    .onConflictDoUpdate({
      target: [documentSequences.docType, documentSequences.year],
      set: { lastSequence: sql`${documentSequences.lastSequence} + 1` },
    })
    .returning({ seq: documentSequences.lastSequence });

  const prefixes = await getPrefixes();
  return formatDocumentNumber(prefixes[docType] ?? docType.toUpperCase(), year, row.seq);
}
