import { sql } from "drizzle-orm";
import { db } from "@/db";
import { documentSequences } from "@/db/schema";

const formats: Record<string, string> = {
  project: "PRJ",
  rab: "RAB",
  quotation: "QT",
  invoice: "INV",
  receipt: "RCP",
};

/**
 * Atomically reserve the next document number, e.g. "PRJ/2026/001".
 * Increment happens in a single upsert statement (safe on Neon HTTP driver).
 */
export async function nextDocumentNumber(
  docType: keyof typeof formats,
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

  const prefix = formats[docType] ?? docType.toUpperCase();
  return `${prefix}/${year}/${String(row.seq).padStart(3, "0")}`;
}
