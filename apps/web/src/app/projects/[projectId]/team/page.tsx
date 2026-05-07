import { ProjectTeamClient } from "@/features/projects/project-pages";

export default async function ProjectTeamPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectTeamClient projectId={projectId} />;
}
