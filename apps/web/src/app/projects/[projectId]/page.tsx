import { ProjectOverviewClient } from "@/features/projects/project-pages";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectOverviewClient projectId={projectId} />;
}
