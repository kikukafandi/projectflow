"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  complexityLabels,
  pricingMethodLabels,
  priorityLabels,
} from "@/lib/labels";
import { featureItemSchema, type FeatureItemInput } from "@/lib/validations";

export function FeatureItemForm({
  defaultValues,
  action,
  submitLabel,
}: {
  defaultValues?: Partial<FeatureItemInput>;
  action: (values: FeatureItemInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FeatureItemInput>({
    resolver: zodResolver(featureItemSchema),
    defaultValues: {
      pricingMethod: "fixed",
      complexity: "medium",
      defaultPriority: "medium",
      isActive: true,
      ...defaultValues,
    },
  });

  async function onSubmit(values: FeatureItemInput) {
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
          <Field label="Metode Harga" htmlFor="pricingMethod">
            <Select id="pricingMethod" {...register("pricingMethod")}>
              {Object.entries(pricingMethodLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Satuan" htmlFor="unit">
            <Input id="unit" placeholder="fitur / halaman / jam…" {...register("unit")} />
          </Field>
          <Field label="Harga Tetap (IDR)" htmlFor="fixedPrice">
            <Input id="fixedPrice" inputMode="numeric" className="tabular" {...register("fixedPrice")} />
          </Field>
          <Field label="Tarif per Jam (IDR)" htmlFor="hourlyRate">
            <Input id="hourlyRate" inputMode="numeric" className="tabular" {...register("hourlyRate")} />
          </Field>
          <Field label="Estimasi (jam)" htmlFor="estimateHours">
            <Input id="estimateHours" inputMode="numeric" className="tabular" {...register("estimateHours")} />
          </Field>
          <Field label="Quantity Default" htmlFor="defaultQuantity">
            <Input id="defaultQuantity" inputMode="numeric" className="tabular" {...register("defaultQuantity")} />
          </Field>
          <Field label="Kompleksitas" htmlFor="complexity">
            <Select id="complexity" {...register("complexity")}>
              {Object.entries(complexityLabels).map(([v, { label }]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Prioritas Default" htmlFor="defaultPriority">
            <Select id="defaultPriority" {...register("defaultPriority")}>
              {Object.entries(priorityLabels).map(([v, { label }]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi" htmlFor="description">
              <Textarea id="description" {...register("description")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Definition of Done" htmlFor="definitionOfDone" hint="Satu item per baris.">
              <Textarea id="definitionOfDone" {...register("definitionOfDone")} />
            </Field>
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" {...register("isActive")} className="size-4 accent-[#FF7A1A]" />
            <span className="text-sm text-ink">Fitur aktif</span>
          </label>
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
