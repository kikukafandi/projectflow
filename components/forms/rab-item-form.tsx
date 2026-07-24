"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import { rabItemSchema, type RabItemInput } from "@/lib/validations";

export function RabItemForm({
  defaultValues,
  action,
  submitLabel,
}: {
  defaultValues?: Partial<RabItemInput>;
  action: (values: RabItemInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RabItemInput>({
    resolver: zodResolver(rabItemSchema),
    defaultValues: { quantity: "1", ...defaultValues },
  });

  async function onSubmit(values: RabItemInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama Pekerjaan" htmlFor="name" required error={errors.name?.message}>
              <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            </Field>
          </div>
          <Field label="Quantity" htmlFor="quantity">
            <Input id="quantity" inputMode="numeric" className="tabular" {...register("quantity")} />
          </Field>
          <Field label="Satuan" htmlFor="unit">
            <Input id="unit" {...register("unit")} />
          </Field>
          <Field label="Harga Satuan (IDR)" htmlFor="unitPrice">
            <Input id="unitPrice" inputMode="numeric" className="tabular" {...register("unitPrice")} />
          </Field>
          {/* Bobot dihitung otomatis dari porsi subtotal item terhadap total —
              lihat kolom "Bobot" di tabel RAB. Tidak diisi manual. */}
          <Field label="Estimasi (jam)" htmlFor="estimateHours">
            <Input id="estimateHours" inputMode="numeric" className="tabular" {...register("estimateHours")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi" htmlFor="description">
              <Textarea id="description" {...register("description")} />
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
