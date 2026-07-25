"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import {
  businessProfileSchema,
  type BusinessProfileInput,
} from "@/lib/validations";

export function BusinessProfileForm({
  defaultValues,
  action,
}: {
  defaultValues?: Partial<BusinessProfileInput>;
  action: (
    values: BusinessProfileInput,
  ) => Promise<{ error: string } | { ok: true }>;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: { primaryColor: "#FF7A1A", ...defaultValues },
  });

  async function onSubmit(values: BusinessProfileInput) {
    setFormError(null);
    setSaved(false);
    const res = await action(values);
    if ("error" in res) {
      setFormError(res.error);
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CardTitle className="mb-1">Identitas Bisnis</CardTitle>
          </div>
          <Field label="Nama Bisnis" htmlFor="businessName" required error={errors.businessName?.message}>
            <Input id="businessName" {...register("businessName")} aria-invalid={!!errors.businessName} />
          </Field>
          <Field label="Nama Pemilik" htmlFor="ownerName">
            <Input id="ownerName" {...register("ownerName")} />
          </Field>
          <Field label="Slogan" htmlFor="slogan">
            <Input id="slogan" {...register("slogan")} />
          </Field>
          <Field label="Warna Utama Dokumen" htmlFor="primaryColor">
            <Input id="primaryColor" type="text" placeholder="#FF7A1A" {...register("primaryColor")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CardTitle className="mb-1">Kontak</CardTitle>
          </div>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          </Field>
          <Field label="Telepon" htmlFor="phone">
            <Input id="phone" {...register("phone")} />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp">
            <Input id="whatsapp" {...register("whatsapp")} />
          </Field>
          <Field label="Website" htmlFor="website">
            <Input id="website" {...register("website")} />
          </Field>
          <Field label="NPWP" htmlFor="npwp">
            <Input id="npwp" {...register("npwp")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CardTitle className="mb-1">Alamat</CardTitle>
          </div>
          <div className="sm:col-span-2">
            <Field label="Alamat" htmlFor="address">
              <Input id="address" {...register("address")} />
            </Field>
          </div>
          <Field label="Kota" htmlFor="city">
            <Input id="city" {...register("city")} />
          </Field>
          <Field label="Provinsi" htmlFor="province">
            <Input id="province" {...register("province")} />
          </Field>
          <Field label="Kode Pos" htmlFor="postalCode">
            <Input id="postalCode" {...register("postalCode")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4">
          <CardTitle>Default Dokumen</CardTitle>
          <Field label="URL Logo" htmlFor="logoUrl" hint="Gunakan logo/wordmark transparan agar tajam pada dokumen.">
            <Input id="logoUrl" placeholder="https://…" {...register("logoUrl")} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("showLogoInDocumentHeader")}
            />
            Tampilkan logo di header dokumen
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("showNpwpInDocumentHeader")}
            />
            Tampilkan NPWP di header dokumen
          </label>
          <Field label="URL Tanda Tangan" htmlFor="signatureUrl">
            <Input id="signatureUrl" placeholder="https://…" {...register("signatureUrl")} />
          </Field>
          <Field label="URL Stempel" htmlFor="stampUrl">
            <Input id="stampUrl" placeholder="https://…" {...register("stampUrl")} />
          </Field>
          <Field label="Catatan Default" htmlFor="defaultNote">
            <Textarea id="defaultNote" {...register("defaultNote")} />
          </Field>
          <Field label="Syarat Pembayaran" htmlFor="paymentTerms">
            <Textarea id="paymentTerms" {...register("paymentTerms")} />
          </Field>
          <Field label="Footer Dokumen" htmlFor="documentFooter">
            <Input id="documentFooter" {...register("documentFooter")} />
          </Field>
        </CardContent>
      </Card>

      {formError && (
        <div role="alert" className="rounded-[12px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {formError}
        </div>
      )}
      {saved && (
        <div role="status" className="rounded-[12px] bg-success-soft px-3 py-2 text-[13px] text-success">
          Profil bisnis tersimpan.
        </div>
      )}

      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? "Menyimpan…" : "Simpan Profil"}
      </Button>
    </form>
  );
}
