"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { rabMetaSchema, type RabMetaInput } from "@/lib/validations";

export function RabMetaForm({
  defaultValues,
  action,
}: {
  defaultValues?: Partial<RabMetaInput>;
  action: (values: RabMetaInput) => Promise<{ error: string } | void>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RabMetaInput>({
    resolver: zodResolver(rabMetaSchema),
    defaultValues,
  });

  async function onSubmit(values: RabMetaInput) {
    setSaved(false);
    await action(values);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="Judul RAB" htmlFor="title">
        <Input id="title" {...register("title")} />
      </Field>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Field label="Diskon (IDR)" htmlFor="discount">
          <Input id="discount" inputMode="numeric" className="tabular" {...register("discount")} />
        </Field>
        <Field label="Keuntungan (%)" htmlFor="profitPercent">
          <Input id="profitPercent" inputMode="numeric" className="tabular" {...register("profitPercent")} />
        </Field>
        <Field label="Pajak (%)" htmlFor="taxPercent">
          <Input id="taxPercent" inputMode="numeric" className="tabular" {...register("taxPercent")} />
        </Field>
        <Field label="Biaya Tambahan" htmlFor="additionalCost">
          <Input id="additionalCost" inputMode="numeric" className="tabular" {...register("additionalCost")} />
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" loading={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : "Simpan & Hitung Ulang"}
        </Button>
        {saved && <span className="text-[13px] text-success">Tersimpan.</span>}
      </div>
    </form>
  );
}
