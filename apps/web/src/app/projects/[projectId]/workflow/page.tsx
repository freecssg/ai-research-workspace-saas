import { ProjectWorkflowClient } from "@/features/projects/project-pages";

export default async function ProjectWorkflowPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkflowClient projectId={projectId} />;
}
