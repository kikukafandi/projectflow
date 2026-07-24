"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import { paymentMethodLabels } from "@/lib/labels";
import { paymentSchema, type PaymentInput } from "@/lib/validations";

type BankOption = { id: string; label: string };

export function PaymentForm({
  banks,
  remaining,
  action,
}: {
  banks: BankOption[];
  remaining?: number;
  action: (values: PaymentInput) => Promise<{ error: string } | void>;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "transfer",
      paidAt: new Date().toISOString().slice(0, 10),
      amount: remaining && remaining > 0 ? String(remaining) : "",
    },
  });

  async function onSubmit(values: PaymentInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nominal (IDR)" htmlFor="amount" required error={errors.amount?.message}>
            <Input id="amount" inputMode="numeric" className="tabular" {...register("amount")} aria-invalid={!!errors.amount} />
          </Field>
          <Field label="Tanggal" htmlFor="paidAt" required error={errors.paidAt?.message}>
            <Input id="paidAt" type="date" {...register("paidAt")} aria-invalid={!!errors.paidAt} />
          </Field>
          <Field label="Metode" htmlFor="method">
            <Select id="method" {...register("method")}>
              {Object.entries(paymentMethodLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Rekening Tujuan" htmlFor="bankAccountId">
            <Select id="bankAccountId" {...register("bankAccountId")}>
              <option value="">—</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Nomor Referensi" htmlFor="reference">
            <Input id="reference" {...register("reference")} />
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
          {isSubmitting ? "Menyimpan…" : "Catat Pembayaran"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
