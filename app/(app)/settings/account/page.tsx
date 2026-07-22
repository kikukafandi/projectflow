import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  AccountProfileForm,
  ChangePasswordForm,
} from "@/components/forms/account-form";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/settings"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader title="Account" description="Akun & keamanan." />

      <div className="space-y-4">
        <Card>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Email</dt>
                <dd className="truncate font-medium text-ink">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Terdaftar sejak</dt>
                <dd className="text-ink-secondary">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[12px] text-ink-muted">
              Email tidak dapat diubah dari sini — ProjectFlow masih single user
              (PRD §9.1).
            </p>
          </CardContent>
        </Card>

        <AccountProfileForm defaultName={user.name ?? ""} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
