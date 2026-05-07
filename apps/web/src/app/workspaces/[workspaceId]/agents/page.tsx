import { WorkspaceAgentsClient } from "@/features/workspaces/workspace-pages";

export default async function WorkspaceAgentsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceAgentsClient workspaceId={workspaceId} />;
}
