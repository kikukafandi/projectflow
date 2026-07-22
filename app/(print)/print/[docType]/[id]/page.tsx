import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentPaper } from "@/components/document-paper";
import { PrintButton } from "@/components/print-button";
import { Button } from "@/components/ui/button";
import { isDocType, loadDocument } from "@/lib/documents";

export const dynamic = "force-dynamic";

export default async function PrintDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ docType: string; id: string }>;
  searchParams: Promise<{ back?: string }>;
}) {
  const { docType, id } = await params;
  if (!isDocType(docType)) notFound();
  const { back } = await searchParams;

  const loaded = await loadDocument(docType, id);
  if (!loaded) notFound();

  return (
    <>
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-3 px-4 print:hidden">
        {back ? (
          <Button asChild variant="ghost">
            <Link href={back}>
              <ArrowLeft /> Kembali
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <PrintButton />
      </div>
      <DocumentPaper profile={loaded.profile} doc={loaded.doc} />
    </>
  );
}
