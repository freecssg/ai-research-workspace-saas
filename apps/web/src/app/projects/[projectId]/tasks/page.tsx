import { ProjectTasksClient } from "@/features/projects/project-pages";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectTasksClient projectId={projectId} />;
}
