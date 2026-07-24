"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import { clientTypeLabels } from "@/lib/labels";
import { clientSchema, type ClientInput } from "@/lib/validations";

export function ClientForm({
  defaultValues,
  action,
  submitLabel,
}: {
  defaultValues?: Partial<ClientInput>;
  action: (values: ClientInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: "individu",
      status: "active",
      ...defaultValues,
    },
  });

  async function onSubmit(values: ClientInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Jenis Klien" htmlFor="type">
            <Select id="type" {...register("type")}>
              {Object.entries(clientTypeLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register("status")}>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="archived">Diarsipkan</option>
            </Select>
          </Field>
          <Field label="Nama" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          </Field>
          <Field label="Nama Perusahaan" htmlFor="companyName">
            <Input id="companyName" {...register("companyName")} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp">
            <Input id="whatsapp" {...register("whatsapp")} />
          </Field>
          <Field label="Telepon" htmlFor="phone">
            <Input id="phone" {...register("phone")} />
          </Field>
          <Field label="NPWP" htmlFor="npwp">
            <Input id="npwp" {...register("npwp")} />
          </Field>
          <Field label="Nama PIC" htmlFor="picName">
            <Input id="picName" {...register("picName")} />
          </Field>
          <Field label="Jabatan PIC" htmlFor="picRole">
            <Input id="picRole" {...register("picRole")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <Field label="Catatan" htmlFor="notes">
              <Textarea id="notes" {...register("notes")} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {formError && (
        <div role="alert" className="rounded-[12px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {formError}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
