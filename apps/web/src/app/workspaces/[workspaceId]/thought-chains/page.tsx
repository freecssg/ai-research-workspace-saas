import { WorkspaceThoughtChainsClient } from "@/features/workspaces/workspace-pages";

export default async function WorkspaceThoughtChainsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceThoughtChainsClient workspaceId={workspaceId} />;
}
