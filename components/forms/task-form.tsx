"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { Input, Select, Textarea } from "@/components/ui/input";
import { priorityLabels, taskStatus } from "@/lib/labels";
import { taskSchema, taskStatusValues, type TaskInput } from "@/lib/validations";

export function TaskForm({
  defaultValues,
  action,
  submitLabel,
}: {
  defaultValues?: Partial<TaskInput>;
  action: (values: TaskInput) => Promise<{ error: string } | void>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: { status: "backlog", priority: "medium", ...defaultValues },
  });

  async function onSubmit(values: TaskInput) {
    setFormError(null);
    const res = await action(values);
    if (res?.error) setFormError(res.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Judul Task" htmlFor="title" required error={errors.title?.message}>
              <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
            </Field>
          </div>
          <Field label="Status" htmlFor="status">
            <Select id="status" {...register("status")}>
              {taskStatusValues.map((s) => (
                <option key={s} value={s}>{taskStatus[s].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Prioritas" htmlFor="priority">
            <Select id="priority" {...register("priority")}>
              {Object.entries(priorityLabels).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Estimasi (jam)" htmlFor="estimateHours">
            <Input id="estimateHours" inputMode="numeric" className="tabular" {...register("estimateHours")} />
          </Field>
          <Field label="Deadline" htmlFor="deadline">
            <Input id="deadline" type="date" {...register("deadline")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi" htmlFor="description">
              <Textarea id="description" {...register("description")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Definition of Done" htmlFor="definitionOfDone">
              <Textarea id="definitionOfDone" {...register("definitionOfDone")} />
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
