import { Building2, CreditCard, FileDigit, Gauge, Tag, User } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  { icon: Building2, label: "Business Profile", desc: "Identitas bisnis untuk dokumen." },
  { icon: CreditCard, label: "Bank Accounts", desc: "Rekening penerimaan pembayaran." },
  { icon: Tag, label: "Pricing", desc: "Tarif per jam, pajak, diskon default." },
  { icon: Gauge, label: "Productivity", desc: "WIP limit & daily focus." },
  { icon: FileDigit, label: "Numbering", desc: "Format nomor dokumen." },
  { icon: User, label: "Account", desc: "Akun & keamanan." },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Pengaturan aplikasi dan identitas bisnis."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-[12px] bg-surface-muted text-ink-secondary">
                <s.icon className="size-5" strokeWidth={1.9} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{s.label}</span>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] text-ink-muted">
                    soon
                  </span>
                </div>
                <p className="mt-0.5 text-[13px] text-ink-secondary">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
