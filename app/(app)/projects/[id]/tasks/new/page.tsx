import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/forms/task-form";
import { createTask } from "../actions";

export default async function NewTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Task Baru" />
      <TaskForm action={createTask.bind(null, id)} submitLabel="Simpan Task" />
    </div>
  );
}
