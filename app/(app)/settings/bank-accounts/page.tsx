import { desc } from "drizzle-orm";
import { ArrowLeft, CreditCard, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { businessBankAccounts } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Card, CardContent } from "@/components/ui/card";
import { deleteBankAccount, setPrimaryBankAccount } from "./actions";

export const dynamic = "force-dynamic";

export default async function BankAccountsPage() {
  const rows = await db
    .select()
    .from(businessBankAccounts)
    .orderBy(desc(businessBankAccounts.isPrimary), desc(businessBankAccounts.createdAt));

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/settings"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader
        title="Bank Accounts"
        description="Rekening penerimaan pembayaran. Satu rekening dapat dijadikan utama."
        actions={
          <Button asChild>
            <Link href="/settings/bank-accounts/new">
              <Plus /> Rekening Baru
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Belum ada rekening"
          description="Tambahkan rekening agar dapat dicantumkan pada invoice."
          action={
            <Button asChild>
              <Link href="/settings/bank-accounts/new">
                <Plus /> Tambah Rekening
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{b.bankName}</span>
                    {b.isPrimary && <Badge tone="green">Utama</Badge>}
                    {b.qrisUrl && <Badge>QRIS</Badge>}
                  </div>
                  <div className="tabular text-sm text-ink-secondary">
                    {b.accountNumber} · {b.accountHolder}
                    {b.branch ? ` · ${b.branch}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!b.isPrimary && (
                    <form action={setPrimaryBankAccount.bind(null, b.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        <Star className="size-4" /> Jadikan utama
                      </Button>
                    </form>
                  )}
                  <Button asChild variant="ghost" size="icon" aria-label="Edit">
                    <Link href={`/settings/bank-accounts/${b.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <form action={deleteBankAccount.bind(null, b.id)}>
                    <ConfirmSubmit
                      variant="ghost"
                      size="icon"
                      aria-label="Hapus"
                      className="text-danger hover:bg-danger-soft"
                      title={`Hapus rekening ${b.bankName}?`}
                      message="Rekening ini tidak akan muncul lagi sebagai tujuan pembayaran."
                    >
                      <Trash2 className="size-4" />
                    </ConfirmSubmit>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
