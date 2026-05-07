import { ProjectConversationsClient } from "@/features/projects/project-pages";

export default async function ProjectConversationsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectConversationsClient projectId={projectId} />;
}
