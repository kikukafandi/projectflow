import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { GeneralSettingsForm } from "@/components/forms/general-settings-form";
import { GENERAL_KEYS, getSettings } from "@/lib/settings";
import type { GeneralSettingsInput } from "@/lib/validations";
import { saveGeneralSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function GeneralSettingsPage() {
  const values = await getSettings(GENERAL_KEYS);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/settings"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader
        title="Pricing & Productivity"
        description="Nilai default untuk estimasi harga dan batas pekerjaan."
      />
      <GeneralSettingsForm
        defaultValues={values as Partial<GeneralSettingsInput>}
        action={saveGeneralSettings}
      />
    </div>
  );
}
