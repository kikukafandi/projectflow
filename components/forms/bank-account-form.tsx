"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { bankAccountSchema, type BankAccountInput } from "@/lib/validations";

export function BankAccountForm({
  defaultValues,
  action,
  submitLabel,
}: {
  defaultValues?: Partial<BankAccountInput>;
  action: (values: BankAccountInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankAccountInput>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { isPrimary: false, ...defaultValues },
  });

  async function onSubmit(values: BankAccountInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Bank" htmlFor="bankName" required error={errors.bankName?.message}>
            <Input id="bankName" {...register("bankName")} aria-invalid={!!errors.bankName} />
          </Field>
          <Field label="Nomor Rekening" htmlFor="accountNumber" required error={errors.accountNumber?.message}>
            <Input id="accountNumber" {...register("accountNumber")} aria-invalid={!!errors.accountNumber} />
          </Field>
          <Field label="Nama Pemilik Rekening" htmlFor="accountHolder" required error={errors.accountHolder?.message}>
            <Input id="accountHolder" {...register("accountHolder")} aria-invalid={!!errors.accountHolder} />
          </Field>
          <Field label="Cabang" htmlFor="branch">
            <Input id="branch" {...register("branch")} />
          </Field>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              {...register("isPrimary")}
              className="size-4 accent-[#FF7A1A]"
            />
            <span className="text-sm text-ink">Jadikan rekening utama</span>
          </label>
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
