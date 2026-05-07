import { WorkspaceConversationsClient } from "@/features/workspaces/workspace-pages";

export default async function WorkspaceConversationsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceConversationsClient workspaceId={workspaceId} />;
}
