"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import { complexityLabels } from "@/lib/labels";
import { moduleSchema, type ModuleInput } from "@/lib/validations";

type CategoryOption = { id: string; name: string };

export function ModuleForm({
  categories,
  defaultValues,
  action,
  submitLabel,
}: {
  categories: CategoryOption[];
  defaultValues?: Partial<ModuleInput>;
  action: (values: ModuleInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ModuleInput>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { complexity: "medium", isActive: true, ...defaultValues },
  });

  async function onSubmit(values: ModuleInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama Modul" htmlFor="name" required error={errors.name?.message}>
              <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            </Field>
          </div>
          <Field label="Kategori" htmlFor="categoryId">
            <Select id="categoryId" {...register("categoryId")}>
              <option value="">Tanpa kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
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
          <Field label="Estimasi Default (jam)" htmlFor="defaultEstimateHours">
            <Input id="defaultEstimateHours" inputMode="numeric" className="tabular" {...register("defaultEstimateHours")} />
          </Field>
          <Field label="Harga Default (IDR)" htmlFor="defaultPrice">
            <Input id="defaultPrice" inputMode="numeric" className="tabular" {...register("defaultPrice")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi" htmlFor="description">
              <Textarea id="description" {...register("description")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Catatan" htmlFor="notes">
              <Textarea id="notes" {...register("notes")} />
            </Field>
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" {...register("isActive")} className="size-4 accent-[#FF7A1A]" />
            <span className="text-sm text-ink">Modul aktif</span>
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
