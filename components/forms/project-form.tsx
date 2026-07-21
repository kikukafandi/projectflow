"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  priorityLabels,
  projectStatus,
  projectTypeLabels,
} from "@/lib/labels";
import { projectSchema, type ProjectInput } from "@/lib/validations";

type ClientOption = { id: string; name: string };

export function ProjectForm({
  clients,
  defaultValues,
  action,
  submitLabel,
}: {
  clients: ClientOption[];
  defaultValues?: Partial<ProjectInput>;
  action: (values: ProjectInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      type: "website",
      status: "lead",
      priority: "medium",
      ...defaultValues,
    },
  });

  async function onSubmit(values: ProjectInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama Proyek" htmlFor="name" required error={errors.name?.message}>
              <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            </Field>
          </div>
          <Field label="Klien" htmlFor="clientId" required error={errors.clientId?.message}>
            <Select id="clientId" {...register("clientId")} aria-invalid={!!errors.clientId}>
              <option value="">Pilih klien…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jenis Proyek" htmlFor="type">
            <Select id="type" {...register("type")}>
              {Object.entries(projectTypeLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register("status")}>
              {Object.entries(projectStatus).map(([v, { label }]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Prioritas" htmlFor="priority">
            <Select id="priority" {...register("priority")}>
              {Object.entries(priorityLabels).map(([v, { label }]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal Mulai" htmlFor="startDate">
            <Input id="startDate" type="date" {...register("startDate")} />
          </Field>
          <Field label="Deadline" htmlFor="deadline">
            <Input id="deadline" type="date" {...register("deadline")} />
          </Field>
          <Field label="Budget Klien" htmlFor="clientBudget" error={errors.clientBudget?.message}>
            <Input
              id="clientBudget"
              inputMode="numeric"
              placeholder="0"
              className="tabular"
              {...register("clientBudget")}
            />
          </Field>
          <Field label="Nilai Proyek" htmlFor="projectValue" error={errors.projectValue?.message}>
            <Input
              id="projectValue"
              inputMode="numeric"
              placeholder="0"
              className="tabular"
              {...register("projectValue")}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4">
          <Field label="Deskripsi" htmlFor="description">
            <Textarea id="description" {...register("description")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tujuan" htmlFor="goal">
              <Input id="goal" {...register("goal")} />
            </Field>
            <Field label="Target Pengguna" htmlFor="targetUsers">
              <Input id="targetUsers" {...register("targetUsers")} />
            </Field>
          </div>
          <Field label="Catatan Internal" htmlFor="internalNotes">
            <Textarea id="internalNotes" {...register("internalNotes")} />
          </Field>
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
      </div>
    </form>
  );
}
