"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { categorySchema, type CategoryInput } from "@/lib/validations";

export function CategoryForm({
  defaultValues,
  action,
  submitLabel,
  onDelete,
}: {
  defaultValues?: Partial<CategoryInput>;
  action: (values: CategoryInput) => Promise<{ error: string } | void>;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { isActive: true, ...defaultValues },
  });

  async function onSubmit(values: CategoryInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <Field label="Nama Kategori" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          </Field>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("isActive")} className="size-4 accent-[#FF7A1A]" />
            <span className="text-sm text-ink">Kategori aktif</span>
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
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-danger hover:bg-danger-soft"
            onClick={async () => {
              if (confirm("Hapus kategori ini?")) {
                await onDelete();
                router.push("/library");
              }
            }}
          >
            Hapus
          </Button>
        )}
      </div>
    </form>
  );
}
