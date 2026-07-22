import { Building2, CreditCard, FileDigit, Gauge, Tag, User } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  { icon: Building2, label: "Business Profile", desc: "Identitas bisnis untuk dokumen.", href: "/settings/business-profile" },
  { icon: CreditCard, label: "Bank Accounts", desc: "Rekening penerimaan pembayaran.", href: "/settings/bank-accounts" },
  { icon: Tag, label: "Pricing & Productivity", desc: "Tarif, pajak, diskon & WIP limit.", href: "/settings/general" },
  { icon: FileDigit, label: "Numbering", desc: "Format nomor dokumen.", href: "/settings/numbering" },
  { icon: User, label: "Account", desc: "Akun & keamanan.", href: "/settings/account" },
  { icon: Gauge, label: "Feature Library", desc: "Modul & fitur untuk scope.", href: "/library" },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Pengaturan aplikasi dan identitas bisnis."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const inner = (
            <Card className={s.href ? "transition-shadow hover:shadow-[0_4px_14px_rgba(24,24,27,0.06)]" : ""}>
              <CardContent className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-[12px] bg-surface-muted text-ink-secondary">
                  <s.icon className="size-5" strokeWidth={1.9} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{s.label}</span>
                    {!s.href && (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] text-ink-muted">
                        soon
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-secondary">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {inner}
            </Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </div>
    </>
  );
}
