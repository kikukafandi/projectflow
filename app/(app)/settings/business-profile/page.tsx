import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { businessProfiles } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { BusinessProfileForm } from "@/components/forms/business-profile-form";
import type { BusinessProfileInput } from "@/lib/validations";
import { saveBusinessProfile } from "./actions";

export const dynamic = "force-dynamic";

export default async function BusinessProfilePage() {
  const [profile] = await db.select().from(businessProfiles).limit(1);

  const defaults: Partial<BusinessProfileInput> = profile
    ? {
        businessName: profile.businessName,
        ownerName: profile.ownerName ?? undefined,
        address: profile.address ?? undefined,
        city: profile.city ?? undefined,
        province: profile.province ?? undefined,
        postalCode: profile.postalCode ?? undefined,
        email: profile.email ?? undefined,
        phone: profile.phone ?? undefined,
        whatsapp: profile.whatsapp ?? undefined,
        website: profile.website ?? undefined,
        npwp: profile.npwp ?? undefined,
        slogan: profile.slogan ?? undefined,
        primaryColor: profile.primaryColor ?? undefined,
        logoUrl: profile.logoUrl ?? undefined,
        signatureUrl: profile.signatureUrl ?? undefined,
        stampUrl: profile.stampUrl ?? undefined,
        defaultNote: profile.defaultNote ?? undefined,
        paymentTerms: profile.paymentTerms ?? undefined,
        documentFooter: profile.documentFooter ?? undefined,
      }
    : {};

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/settings"
        className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-secondary hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Settings
      </Link>
      <PageHeader
        title="Business Profile"
        description="Identitas ini otomatis digunakan pada quotation, invoice, dan kuitansi."
      />
      <BusinessProfileForm defaultValues={defaults} action={saveBusinessProfile} />
    </div>
  );
}
