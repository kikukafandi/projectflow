"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import { invoiceMetaSchema, type InvoiceMetaInput } from "@/lib/validations";

type BankOption = { id: string; label: string };

export function InvoiceMetaForm({
  banks,
  defaultValues,
  action,
}: {
  banks: BankOption[];
  defaultValues?: Partial<InvoiceMetaInput>;
  action: (values: InvoiceMetaInput) => Promise<{ error: string } | void>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<InvoiceMetaInput>({
    resolver: zodResolver(invoiceMetaSchema),
    defaultValues,
  });

  async function onSubmit(values: InvoiceMetaInput) {
    setSaved(false);
    await action(values);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Tanggal Terbit" htmlFor="issueDate">
          <Input id="issueDate" type="date" {...register("issueDate")} />
        </Field>
        <Field label="Jatuh Tempo" htmlFor="dueDate">
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </Field>
        <Field label="Diskon (IDR)" htmlFor="discount">
          <Input id="discount" inputMode="numeric" className="tabular" {...register("discount")} />
        </Field>
        <Field label="Pajak (%)" htmlFor="taxPercent">
          <Input id="taxPercent" inputMode="numeric" className="tabular" {...register("taxPercent")} />
        </Field>
      </div>
      <Field label="Rekening" htmlFor="bankAccountId">
        <Select id="bankAccountId" {...register("bankAccountId")}>
          <option value="">—</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Catatan" htmlFor="notes">
        <Textarea id="notes" {...register("notes")} />
      </Field>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : "Simpan & Hitung Ulang"}
        </Button>
        {saved && <span className="text-[13px] text-success">Tersimpan.</span>}
      </div>
    </form>
  );
}
