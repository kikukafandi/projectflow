"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ponytail: PDF via the browser's own print-to-PDF (PRD §27.4 "Print / PDF").
 * A headless renderer (Puppeteer) is the upgrade path if server-generated PDF
 * files ever need to be stored or emailed without a human clicking print.
 */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <Printer /> Cetak / Simpan PDF
    </Button>
  );
}
