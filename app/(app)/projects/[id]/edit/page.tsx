import { asc, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "@/components/forms/project-form";
import type { ProjectInput } from "@/lib/validations";
import { updateProject } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  if (!project) notFound();

  const options = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(ne(clients.status, "archived"))
    .orderBy(asc(clients.name));

  const defaults: Partial<ProjectInput> = {
    name: project.name,
    clientId: project.clientId,
    type: project.type,
    status: project.status,
    priority: project.priority,
    description: project.description ?? undefined,
    goal: project.goal ?? undefined,
    targetUsers: project.targetUsers ?? undefined,
    startDate: project.startDate ?? undefined,
    deadline: project.deadline ?? undefined,
    clientBudget: project.clientBudget ?? undefined,
    projectValue: project.projectValue ?? undefined,
    internalNotes: project.internalNotes ?? undefined,
  };

  const action = updateProject.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Proyek" description={project.name} />
      <ProjectForm
        clients={options}
        defaultValues={defaults}
        action={action}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
