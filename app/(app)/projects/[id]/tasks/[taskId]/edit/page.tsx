import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/forms/task-form";
import type { TaskInput } from "@/lib/validations";
import { updateTask } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;
  const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!t) notFound();

  const defaults: Partial<TaskInput> = {
    title: t.title,
    description: t.description ?? undefined,
    status: t.status,
    priority: t.priority,
    estimateHours: t.estimateHours ?? undefined,
    deadline: t.deadline ?? undefined,
    definitionOfDone: t.definitionOfDone ?? undefined,
    notes: t.notes ?? undefined,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Task" description={t.title} />
      <TaskForm
        action={updateTask.bind(null, id, taskId)}
        defaultValues={defaults}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
