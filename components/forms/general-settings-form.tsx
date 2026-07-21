"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  generalSettingsSchema,
  type GeneralSettingsInput,
} from "@/lib/validations";

export function GeneralSettingsForm({
  defaultValues,
  action,
}: {
  defaultValues?: Partial<GeneralSettingsInput>;
  action: (
    values: GeneralSettingsInput,
  ) => Promise<{ error: string } | { ok: true }>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues,
  });

  async function onSubmit(values: GeneralSettingsInput) {
    setFormError(null);
    setSaved(false);
    const res = await action(values);
    if ("error" in res) setFormError(res.error);
    else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CardTitle className="mb-1">Pricing</CardTitle>
          </div>
          <Field label="Tarif per Jam (IDR)" htmlFor="hourlyRate">
            <Input id="hourlyRate" inputMode="numeric" className="tabular" {...register("hourlyRate")} />
          </Field>
          <Field label="Tarif per Hari (IDR)" htmlFor="dailyRate">
            <Input id="dailyRate" inputMode="numeric" className="tabular" {...register("dailyRate")} />
          </Field>
          <Field label="Pajak Default (%)" htmlFor="defaultTaxPercent">
            <Input id="defaultTaxPercent" inputMode="numeric" className="tabular" {...register("defaultTaxPercent")} />
          </Field>
          <Field label="Diskon Default (%)" htmlFor="defaultDiscount">
            <Input id="defaultDiscount" inputMode="numeric" className="tabular" {...register("defaultDiscount")} />
          </Field>
          <Field label="Dana Risiko Default (%)" htmlFor="riskReserve">
            <Input id="riskReserve" inputMode="numeric" className="tabular" {...register("riskReserve")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CardTitle className="mb-1">Productivity</CardTitle>
          </div>
          <Field label="Maks. Proyek Aktif" htmlFor="maxActiveProjects" hint="Default 2 (PRD §22)">
            <Input id="maxActiveProjects" inputMode="numeric" className="tabular" {...register("maxActiveProjects")} />
          </Field>
          <Field label="Maks. Task In Progress" htmlFor="maxInProgressTasks" hint="Default 2">
            <Input id="maxInProgressTasks" inputMode="numeric" className="tabular" {...register("maxInProgressTasks")} />
          </Field>
          <Field label="Maks. Daily Focus" htmlFor="maxDailyFocus" hint="Default 3">
            <Input id="maxDailyFocus" inputMode="numeric" className="tabular" {...register("maxDailyFocus")} />
          </Field>
          <Field label="Jam Kerja per Hari" htmlFor="workHoursPerDay">
            <Input id="workHoursPerDay" inputMode="numeric" className="tabular" {...register("workHoursPerDay")} />
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
          Pengaturan tersimpan.
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan…" : "Simpan Pengaturan"}
      </Button>
    </form>
  );
}
