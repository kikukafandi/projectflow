"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import { complexityLabels, scopeStatus } from "@/lib/labels";
import { scopeFeatureSchema, type ScopeFeatureInput } from "@/lib/validations";

export function ScopeFeatureForm({
  defaultValues,
  action,
  submitLabel,
}: {
  defaultValues?: Partial<ScopeFeatureInput>;
  action: (values: ScopeFeatureInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScopeFeatureInput>({
    resolver: zodResolver(scopeFeatureSchema),
    defaultValues: {
      status: "included",
      complexity: "medium",
      quantity: "1",
      ...defaultValues,
    },
  });

  async function onSubmit(values: ScopeFeatureInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama Fitur" htmlFor="name" required error={errors.name?.message}>
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
          <Field label="Estimasi (jam)" htmlFor="estimateHours">
            <Input id="estimateHours" inputMode="numeric" className="tabular" {...register("estimateHours")} />
          </Field>
          <Field label="Kompleksitas" htmlFor="complexity">
            <Select id="complexity" {...register("complexity")}>
              {Object.entries(complexityLabels).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register("status")}>
              {Object.entries(scopeStatus).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi" htmlFor="description">
              <Textarea id="description" {...register("description")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Catatan" htmlFor="notes">
              <Input id="notes" {...register("notes")} />
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
