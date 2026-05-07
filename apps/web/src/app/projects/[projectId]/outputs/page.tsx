import { ProjectOutputsClient } from "@/features/projects/project-pages";

export default async function ProjectOutputsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectOutputsClient projectId={projectId} />;
}
