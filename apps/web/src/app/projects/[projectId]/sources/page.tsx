import { ProjectSourcesClient } from "@/features/projects/project-pages";

export default async function ProjectSourcesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectSourcesClient projectId={projectId} />;
}
