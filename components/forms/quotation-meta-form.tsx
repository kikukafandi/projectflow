"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import {
  quotationMetaSchema,
  type QuotationMetaInput,
} from "@/lib/validations";

export function QuotationMetaForm({
  defaultValues,
  action,
  disabled,
}: {
  defaultValues?: Partial<QuotationMetaInput>;
  action: (values: QuotationMetaInput) => Promise<{ error: string } | void>;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok?: boolean; error?: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<QuotationMetaInput>({
    resolver: zodResolver(quotationMetaSchema),
    defaultValues,
  });

  async function onSubmit(values: QuotationMetaInput) {
    setMsg(null);
    const res = await action(values);
    if (res?.error) setMsg({ error: res.error });
    else {
      setMsg({ ok: true });
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="Berlaku Sampai" htmlFor="validUntil">
        <Input id="validUntil" type="date" disabled={disabled} {...register("validUntil")} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" disabled={disabled} {...register("showPrice")} />
        Tampilkan harga pada penawaran
      </label>
      <Field label="Catatan" htmlFor="notes">
        <Textarea id="notes" disabled={disabled} {...register("notes")} />
      </Field>
      <Field label="Syarat & Ketentuan" htmlFor="terms">
        <Textarea id="terms" disabled={disabled} {...register("terms")} />
      </Field>
      {msg?.error && (
        <div role="alert" className="rounded-[12px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {msg.error}
        </div>
      )}
      {msg?.ok && <span className="text-[13px] text-success">Tersimpan.</span>}
      {!disabled && (
        <Button type="submit" size="sm" loading={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : "Simpan"}
        </Button>
      )}
    </form>
  );
}
