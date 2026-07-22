import { requireUser } from "@/lib/session";

/**
 * Bare layout for printable documents — no sidebar, no header, so the sheet
 * prints without app navigation (PRD §27.5).
 */
export default async function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <div className="min-h-screen bg-surface-muted py-6 print:bg-white print:py-0">{children}</div>;
}
