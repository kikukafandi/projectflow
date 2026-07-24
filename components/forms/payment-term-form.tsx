"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import { paymentTermTypeLabels } from "@/lib/labels";
import { paymentTermSchema, type PaymentTermInput } from "@/lib/validations";

export function PaymentTermForm({
  action,
  submitLabel,
}: {
  action: (values: PaymentTermInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentTermInput>({
    resolver: zodResolver(paymentTermSchema),
    defaultValues: { type: "percentage" },
  });

  async function onSubmit(values: PaymentTermInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama Termin" htmlFor="name" required error={errors.name?.message}>
              <Input id="name" placeholder="DP, Pelunasan…" {...register("name")} aria-invalid={!!errors.name} />
            </Field>
          </div>
          <Field label="Jenis" htmlFor="type">
            <Select id="type" {...register("type")}>
              {Object.entries(paymentTermTypeLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Persentase (%)" htmlFor="percent" hint="Nominal dihitung dari grand total jika dikosongkan.">
            <Input id="percent" inputMode="numeric" className="tabular" {...register("percent")} />
          </Field>
          <Field label="Nominal (IDR)" htmlFor="amount">
            <Input id="amount" inputMode="numeric" className="tabular" {...register("amount")} />
          </Field>
          <Field label="Jatuh Tempo" htmlFor="dueDate">
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Trigger / Deskripsi" htmlFor="trigger">
              <Textarea id="trigger" placeholder="Setelah staging, setelah serah terima…" {...register("trigger")} />
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
