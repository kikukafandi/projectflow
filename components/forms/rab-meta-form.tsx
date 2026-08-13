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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Judul RAB" htmlFor="title">
        <Input id="title" {...register("title")} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          {...register("showPrice")}
          className="size-4 accent-[#FF7A1A]"
        />
        Tampilkan harga pada RAB eksternal
      </label>
      <div className="grid gap-3 min-[620px]:grid-cols-2">
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
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" loading={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : "Simpan & Hitung Ulang"}
        </Button>
        {saved && <span className="text-[13px] text-success">Tersimpan.</span>}
      </div>
    </form>
  );
}
