"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { numberingSchema, type NumberingInput } from "@/lib/validations";

const FIELDS: { key: keyof NumberingInput; label: string }[] = [
  { key: "project", label: "Proyek" },
  { key: "rab", label: "RAB" },
  { key: "quotation", label: "Quotation" },
  { key: "invoice", label: "Invoice" },
  { key: "receipt", label: "Kuitansi" },
];

export function NumberingForm({
  defaultValues,
  nextSequence,
  action,
}: {
  defaultValues: NumberingInput;
  /** Next sequence per doc type, for the live preview. */
  nextSequence: Record<string, number>;
  action: (values: NumberingInput) => Promise<{ error: string } | { ok: true }>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NumberingInput>({
    resolver: zodResolver(numberingSchema),
    defaultValues,
  });

  const year = new Date().getFullYear();
  const current = watch();

  async function onSubmit(values: NumberingInput) {
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
        <CardContent className="space-y-4">
          {FIELDS.map((f) => {
            const prefix = (current[f.key] ?? "").toString().trim();
            const seq = String(nextSequence[f.key] ?? 1).padStart(3, "0");
            return (
              <div
                key={f.key}
                className="grid gap-3 sm:grid-cols-[1fr_1.2fr] sm:items-start"
              >
                <Field label={f.label} htmlFor={f.key} error={errors[f.key]?.message}>
                  <Input
                    id={f.key}
                    className="tabular uppercase"
                    aria-invalid={!!errors[f.key]}
                    {...register(f.key)}
                  />
                </Field>
                <div className="sm:pt-7">
                  <span className="text-[12px] text-ink-muted">Nomor berikutnya</span>
                  <div className="tabular text-sm font-medium text-ink">
                    {prefix ? `${prefix}/${year}/${seq}` : "—"}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {formError && (
        <div role="alert" className="rounded-[12px] bg-danger-soft px-3 py-2 text-[13px] text-danger">
          {formError}
        </div>
      )}
      {saved && (
        <div role="status" className="rounded-[12px] bg-success-soft px-3 py-2 text-[13px] text-success">
          Format nomor tersimpan.
        </div>
      )}

      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? "Menyimpan…" : "Simpan Format"}
      </Button>
    </form>
  );
}
